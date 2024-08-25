import { RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import debounce from "debounce";
import { EventEmitter } from "eventemitter3";
import { fromUint8Array, toUint8Array } from "js-base64";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";

import {
	Awareness,
	removeAwarenessStates,
	encodeAwarenessUpdate,
	applyAwarenessUpdate,
} from "y-protocols/awareness";
import { th } from "date-fns/locale";

interface DatabaseDetails {
	schema: string;
	table: string;
	updateColumns: { name: string; content: string };
	conflictColumns: string;
}

interface UserData {
	name: string;
	color: string;
}

export interface SupabaseProviderConfiguration {
	name: string;
	document: Y.Doc;
	userData: UserData;
	awareness?: Awareness;
	databaseDetails: DatabaseDetails;
}

export class SupabaseProvider extends EventEmitter {
	private supabase: SupabaseClient;
	private channel: RealtimeChannel | null = null;
	private awareness: Awareness;
	private isConnected: boolean = false;
	public presenceData: any = {};
	private updateBuffer: Uint8Array[] = [];
	private debounceTimeout: number | null = null;
	private debounceCooldown: boolean = false;
	private debounceTimeoutA: number | null = null;
	private debounceCooldownA: boolean = false;
	public configuration: SupabaseProviderConfiguration = {
		name: "",
		// @ts-ignore
		document: undefined,
		userData: {
			name: "",
			color: "",
		},
		// @ts-ignore
		awareness: undefined,
		databaseDetails: {
			schema: "",
			table: "",
			updateColumns: { name: "", content: "" },
			conflictColumns: "",
		},
	};

	constructor(supabase: SupabaseClient, config: SupabaseProviderConfiguration) {
		super();

		this.setConfiguration(config);
		this.configuration.document = config.document ? config.document : new Y.Doc();

		this.supabase = supabase;
		this.awareness = config.awareness || new Awareness(config.document);

		this.connect();

		this.on("connect", this.onConnect);
		this.on("disconnect", this.onDisconnect);

		this.document.on("update", this.documentUpdateHandler.bind(this));
		this.awareness.on("update", this.onAwarenessUpdate.bind(this));
		this.document.on("destroy", this.destroy);
	}

	public setConfiguration(configuration: Partial<SupabaseProviderConfiguration> = {}): void {
		this.configuration = { ...this.configuration, ...configuration };
	}

	get document() {
		return this.configuration.document;
	}

	

	private async debounceApplyUpdate(update: Uint8Array, origin?: any) {
		// Add the update to the buffer
		this.updateBuffer.push(update);
	
		// Clear any existing debounce timeout
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = null;
		}
	
		// If there is no cooldown (debounceTimeout is null or the buffer was just cleared), execute immediately
		if (!this.debounceCooldown) {
			this.executeUpdateBuffer();
			this.debounceCooldown = true;
	
			// Reset the cooldown after the debounce delay
			this.debounceTimeout = window.setTimeout(() => {
				this.debounceCooldown = false;
	
			}, 100); // Adjust the debounce delay as needed (300ms in this example)
		} else {
			// Set a new debounce timeout for subsequent updates
			this.debounceTimeout = window.setTimeout(() => {
				this.executeUpdateBuffer();
				this.debounceCooldown = false;
			}, 100); // Adjust the debounce delay as needed (300ms in this example)
		}
	}
	
	private async executeUpdateBuffer() {


		// Merge all updates in the buffer 

		const mergedUpdate = Y.mergeUpdates(this.updateBuffer);

		// Clear the buffer
		this.updateBuffer = [];
	
		// Handle broadcasting if needed
		if (Object.keys(this.presenceData).length > 1 && this.channel) {
			const change = fromUint8Array(mergedUpdate);
			try {
				await this.channel.send({
					type: "broadcast",
					event: "documentUpdated",
					payload: { update: change },
				});
			} catch (error) {
				console.error("Error broadcasting diff:", error);
			}
		}
	}

	private async documentUpdateHandler(update: Uint8Array, origin?: any) {
		if (origin === this) return;
		if (this.isConnected === false) return;

		try {
			Y.applyUpdate(this.document, update, origin);
		} catch (error) {
			console.error("Error applying update:", error);
			return;
		}

		this.debounceApplyUpdate(update, origin);
	}


	private async executeAwarenessUpdate({ added, updated, removed }: any, origin: any) {
		// Add the update to the buffer
	
		// Clear any existing debounce timeout
		if (origin === this) return;
		const changedClients = added.concat(updated).concat(removed);
		const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
			this.awareness!,
			changedClients
		);
	
		
		if (Object.keys(this.presenceData).length > 1 && this.channel) {
			
			await this.channel.send({
				type: "broadcast",
				event: "awareness",
				payload: { awareness: fromUint8Array(awarenessUpdate) },
			});
		}
	}
	
	private async onAwarenessUpdate({ added, updated, removed }: any, origin: any) {

		if (this.debounceTimeoutA) {
			clearTimeout(this.debounceTimeoutA);
			this.debounceTimeoutA = null;
		}
	
		// If there is no cooldown (debounceTimeoutA is null or the buffer was just cleared), execute immediately
		if (!this.debounceCooldownA) {
			this.executeAwarenessUpdate({ added, updated, removed }, origin);
			this.debounceCooldownA = true;
	
			// Reset the cooldown after the debounce delay
			this.debounceTimeoutA = window.setTimeout(() => {
				this.debounceCooldownA = false;
	
			}, 100); // Adjust the debounce delay as needed (300ms in this example)
		} else {
			// Set a new debounce timeout for subsequent updates
			this.debounceTimeoutA = window.setTimeout(() => {
				this.executeAwarenessUpdate({ added, updated, removed }, origin);
				this.debounceCooldownA = false;
			}, 100); // Adjust the debounce delay as needed (300ms in this example)
		}
		
	}


	removeSelfFromAwarenessOnUnload() {
		awarenessProtocol.removeAwarenessStates(
			this.awareness!,
			[this.document.clientID],
			"window unload"
		);
	}

	public startSync() {

		if (this.isConnected === false) return;
	
		
		const stateVectorO = fromUint8Array(Y.encodeStateVector(this.document));

		if (this.channel) {
			try {
				this.channel.send({
					type: "broadcast",
					event: "syncStep2",
					payload: { stateVectorO: stateVectorO },
				});
			} catch (error) {
				console.error("Error broadcasting diff:", error);
			}
		}
	}

	onSyncResponse({ event, payload }: { event: string; [key: string]: any }) {
		const diffR = fromUint8Array(
			Y.encodeStateAsUpdate(this.document, toUint8Array(payload.stateVectorO))
		);

		if (this.channel) {
			try {
				this.channel!.send({
					type: "broadcast",
					event: "finalSync",
					payload: { diffR },
				});
			} catch (error) {
				console.error("Error broadcasting update:", error);
			}
		}
	}

	onSyncCompletion({ event, payload }: { event: string; [key: string]: any }) {
		Y.applyUpdate(this.document, toUint8Array(payload.diffR), this);
	}

	public async onConnect() {
		const { data, error } = await this.supabase
			.from(this.configuration.databaseDetails.table)
			.select<
				string,
				{ [key: string]: string }
			>(`${this.configuration.databaseDetails.updateColumns.content}`)
			.eq(this.configuration.databaseDetails.updateColumns.name, this.configuration.name)
			.limit(1);

		if (error) {
			console.error(error);
			return;
		}
		
		
		if (
			data.length !== 0 &&
			data[0][this.configuration.databaseDetails.updateColumns.content] !== "AAA="
		) {

			const dbDocument = toUint8Array(
				data[0][this.configuration.databaseDetails.updateColumns.content]
			);
			Y.applyUpdate(this.document, dbDocument);

		}

		this.emit("status", [{ status: "connected" }]);
		this.isConnected = true;
	
		this.startSync();

	

	}

	private connect() {
		this.channel = this.supabase.channel(this.configuration.name);
		this.initRealtime();
	}

	
	public async pauseRealtime() {
        if (this.channel && this.isConnected) {
			this.disconnect()
			console.log("ss realtime");
		}
		console.log("ss realtime");
	}

    public async resumeRealtime() {
		if (this.channel && !this.isConnected) {
			console.log("Resuming realtime");
			
	
			
		} else {
			this.connect()
			console.log("Resuming realtime");
		}
    }

	private initRealtime() {
		this.channel!
			.on("broadcast", { event: "documentUpdated" }, (event) => {
				this.onRecieiveDocumentUpdate(event);
			})
			.on("broadcast", { event: "awareness" }, ({ payload }) => {

				awarenessProtocol.applyAwarenessUpdate(
					this.awareness!,
					toUint8Array(payload.awareness),
					this
				);
			})
			.on("broadcast", { event: "syncStep2" }, (event) => {
				
				this.onSyncResponse(event);
			})
		
			.on("broadcast", { event: "finalSync" }, (event) => {
				this.onSyncCompletion(event);
			})
			.on('presence', { event: 'join' }, ({ key, newPresences }) => {
				if (this.channel && this.awareness) {
					const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
						this.document.clientID,
					]);
					this.channel.send({
						type: "broadcast",
						event: "awareness",
						payload: { awareness: fromUint8Array(awarenessUpdate) },
					});
				}
			  })
			.on("presence", { event: "sync" }, () => {
				this.emit("users-update", this.channel!.presenceState());
				this.presenceData = this.channel!.presenceState();
				if (this.isConnected) this.startSync();
			
			})
			.subscribe(async (status) => {
				switch (status) {
					case "SUBSCRIBED":
						if (!this.isConnected) {
							this.emit("connect", this);
						}
						
						await this.channel!.track({ userData: this.configuration.userData });
						break;
						case 'CHANNEL_ERROR':
						case 'TIMED_OUT':
						case 'CLOSED':
							this.isConnected = false;
							this.emit('disconnect', this);
							break;
						default:
							break;
			}
			});
	}

	public getConnectedUsers() {
		return this.presenceData;
	}


	public persistData() {
		return fromUint8Array(Y.encodeStateAsUpdate(this.document));
	}


	private onRecieiveDocumentUpdate({ event, payload }: { event: string; [key: string]: any }) {
		Y.applyUpdate(this.document, toUint8Array(payload.update), this);
	}

	private disconnect() {
		if (this.channel) {
			console.log("Disconnecting realtime");
			
			this.channel.unsubscribe();
			this.supabase.removeChannel(this.channel);
			this.channel = null;
		}
		this.isConnected = false;
	}

	public onDisconnect() {
		this.emit("status", [{ status: "disconnected" }]);

		if (this.awareness) {
			const states = Array.from(this.awareness.getStates().keys()).filter(
				(client) => client !== this.document.clientID
			);
			awarenessProtocol.removeAwarenessStates(this.awareness, states, this);
		}
	}

	public destroy() {
		// if last user within timout remove channel

		if (this.awareness) {
			const localClientID = this.document.clientID;
			awarenessProtocol.removeAwarenessStates(this.awareness, [localClientID], "destroy");
		}
		this.removeSelfFromAwarenessOnUnload();
		if (this.channel && this.awareness) {
			const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
				this.document.clientID,
			]);
			this.channel.send({
				type: "broadcast",
				event: "awareness",
				payload: { awareness: fromUint8Array(awarenessUpdate) },
			});
		}
		this.isConnected = false;
		this.removeAllListeners();
		this.disconnect();

		this.document.off("update", this.documentUpdateHandler);
		this.awareness?.off("update", this.onAwarenessUpdate);
		this.document.off("destroy", this.destroy);

		if (this.channel) {
			this.disconnect();
		}
	}
}
