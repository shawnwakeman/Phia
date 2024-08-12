import { RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import debounce from "debounce";
import { EventEmitter } from "eventemitter3";
import { fromUint8Array, toUint8Array } from "js-base64";

import * as Y from "yjs";

import * as awarenessProtocol from "y-protocols/awareness";


export interface SupabaseProviderConfiguration {
	name: string;
	document: Y.Doc;
	userName: string;
	awareness?: awarenessProtocol.Awareness;
	databaseDetails: {
		schema: string;
		table: string;
		updateColumns: { name: string; content: string };
		conflictColumns: string;
	};
}
export class SupabaseProvider extends EventEmitter {
	public configuration: SupabaseProviderConfiguration = {
		name: "",
		// @ts-ignore
		document: undefined,
		userName: "",
		// @ts-ignore
		awareness: undefined,
		databaseDetails: {
			schema: "",
			table: "",
			updateColumns: { name: "", content: "" },
			conflictColumns: "",
		},
	};

	private supabase: SupabaseClient;
	private channel: RealtimeChannel | null = null;
	private awareness: awarenessProtocol.Awareness | null = null;
	private version: number = 0;
	public callbacks: { [key: string]: Function[] } = {};
	public presenceData = {};
	constructor(supabase: SupabaseClient, config: SupabaseProviderConfiguration) {
		super();

		this.setConfiguration(config);
		this.configuration.document = config.document ? config.document : new Y.Doc();
		this.awareness = new awarenessProtocol.Awareness(this.configuration.document);
		this.supabase = supabase;

		this.on("connect", this.onConnect);
		this.on("disconnect", this.onDisconnect);
		this.document.on("update", this.documentUpdateHandler.bind(this));
		this.awareness.on("update", debounce(this.onAwarenessUpdate.bind(this), 50));

		this.connect();

		// doc.on('destroy', function(doc: Y.Doc))
	}

	public setConfiguration(configuration: Partial<SupabaseProviderConfiguration> = {}): void {
		this.configuration = { ...this.configuration, ...configuration };
	}

	get document() {
		return this.configuration.document;
	}

	private async documentUpdateHandler(update: Uint8Array, origin?: any) {
		if (origin === this) {
			return;
		}

		try {
			Y.applyUpdate(this.document, update, origin);
		} catch (error) {
			console.error("Error applying update:", error);
			return;
		}
		const userCount = Object.keys(this.presenceData).length;

		if (userCount > 1 && this.channel) {
			const change = fromUint8Array(update);

			try {
				this.channel.send({
					type: "broadcast",
					event: "test",
					payload: { update: change },
				});
			} catch (error) {
				console.error("Error broadcasting diff:", error);
			}
		}
	}

	private async onAwarenessUpdate({ added, updated, removed }: any, origin: any) {
		const changedClients = added.concat(updated).concat(removed);
		const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
			this.awareness!,
			changedClients
		);

		const userCount = Object.keys(this.presenceData).length;

		if (userCount > 1 && this.channel) {
			this.channel.send({
				type: "broadcast",
				event: "awareness",
				payload: { awareness: fromUint8Array(awarenessUpdate) },
			});
		}
	}

	private onrequestCurrentState({ event, payload }: { event: string; [key: string]: any }) {
		try {
			const stateVectorO = fromUint8Array(Y.encodeStateVector(this.document));

			if (this.channel) {
				try {
					this.channel.send({
						type: "broadcast",
						event: "diff",
						payload: { stateVectorO: stateVectorO },
					});
				} catch (error) {
					console.error("Error broadcasting diff:", error);
				}
			}
			console.log("Current state sent in response to request.");
		} catch (error) {
			console.error("Error sending current state:", error);
		}
	}

	removeSelfFromAwarenessOnUnload() {
		awarenessProtocol.removeAwarenessStates(
			this.awareness!,
			[this.document.clientID],
			"window unload"
		);
	}

	startSync() {
		try {
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
			console.log("startSync");
		} catch (error) {
			console.error("Error sending current state:", error);
		}
	}

	onSyncResponse({ event, payload }: { event: string; [key: string]: any }) {
		const stateVectorR = fromUint8Array(Y.encodeStateVector(this.document));

		const diffR = fromUint8Array(
			Y.encodeStateAsUpdate(this.document, toUint8Array(payload.stateVectorO))
		);

		if (this.channel) {
			try {
				this.channel!.send({
					type: "broadcast",
					event: "finalSync",
					payload: { stateVectorR, diffR },
				});
				console.log("onSyncResponse");
			} catch (error) {
				console.error("Error broadcasting update:", error);
			}
		}
	}

	onSyncCompletion({ event, payload }: { event: string; [key: string]: any }) {
		try {
			this.version++;
			Y.applyUpdate(this.document, toUint8Array(payload.diffR), this);
			console.log("onSyncCompletion");
		} catch (error) {
			console.error("Error applying update:", error);
		}
	}

	public async onConnect() {
		// let stateReceived = false;

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
			console.log(data[0][this.configuration.databaseDetails.updateColumns.content]);

			const dbDocument = toUint8Array(
				data[0][this.configuration.databaseDetails.updateColumns.content]
			);
			Y.applyUpdate(this.document, dbDocument);

			// No data was returned or the expected content field is missing

			// Optionally, you could initialize the document to a default state or handle it differently
		}

		this.version++;
		this.emit("status", [{ status: "connected" }]);

		if (this.awareness && this.awareness.getLocalState() !== null) {
			const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
				this.document.clientID,
			]);
			this.emit("awareness", awarenessUpdate);
		}
	}

	private connect() {
		this.channel = this.supabase.channel(this.configuration.name);
		this.initRealtime();
	}

	private initRealtime() {
		this.channel!.on("broadcast", { event: "update" }, (event) => {
			this.onReceiveUpdate(event);
		})
			.on("broadcast", { event: "diff" }, (event) => {
				this.onRecieiveDiffs(event);
			})
			.on("broadcast", { event: "test" }, (event) => {
				this.onRecieiveTest(event);
			})
			.on("broadcast", { event: "testUpdate" }, (event) => {
				this.onTestUpdate(event);
			})
			.on("broadcast", { event: "awareness" }, ({ payload }) => {
				const update = toUint8Array(payload.awareness);
				if (this.awareness) {
					awarenessProtocol.applyAwarenessUpdate(this.awareness!, update, this);
				}
			})
			.on("broadcast", { event: "syncStep2" }, (event) => {
				this.onSyncResponse(event);
			})
			.on("broadcast", { event: "finalSync" }, (event) => {
				this.onSyncCompletion(event);
			})
			.on("presence", { event: "sync" }, () => {
				console.log("Synced presence state: ", this.channel!.presenceState());
				this.emit("users-update");
				this.presenceData = this.channel!.presenceState();
			})
			.on("presence", { event: "join" }, ({ key, newPresences }) => {
				this.startSync();
			})
			.on("broadcast", { event: "requestCurrentState" }, (event) => {
				this.onrequestCurrentState(event);
			})

			.subscribe(async (status) => {
				switch (status) {
					case "SUBSCRIBED":
						this.emit("connect", this);
						console.log("Connected to channel", this.configuration.name);
						await this.channel!.track({ userName: this.configuration.userName });
						break;
					case "CHANNEL_ERROR":
						this.emit("connect", this);
						console.log("Failed to connect to channel", this.configuration.name);
						break;
					case "TIMED_OUT":
						this.emit("connect", this);
						console.log("Timed out connecting to channel", this.configuration.name);
						break;
					case "CLOSED":
						this.emit("disconnect", this);
						console.log("Disconnected from channel", this.configuration.name);
						break;
					default:
						break;
				}
			});
	}

	public getConnectedUsers() {
		return this.presenceData
	}

	private onReceiveUpdate({ event, payload }: { event: string; [key: string]: any }) {
		if (payload.diffO) {
			try {
				this.version++;
				Y.applyUpdate(this.document, toUint8Array(payload.diffO), this);
				console.log("update applied", this.document);
			} catch (error) {
				console.error("Error applying update:", error);
			}
			return;
		}
		console.log(event, payload);
		console.log("Document before update:", this.document);

		try {
			this.version++;
			Y.applyUpdate(this.document, toUint8Array(payload.diffR), this);
			console.log("update applied", this.document);
		} catch (error) {
			console.error("Error applying update:", error);
		}

		const diffO = fromUint8Array(
			Y.encodeStateAsUpdate(this.document, toUint8Array(payload.stateVectorR))
		);

		if (this.channel) {
			try {
				this.channel!.send({
					type: "broadcast",
					event: "update",
					payload: { diffO },
				});
			} catch (error) {
				console.error("Error broadcasting update:", error);
			}
		}
	}

	public persistData() {
		return fromUint8Array(Y.encodeStateAsUpdate(this.document));
	}

	private onRecieiveDiffs({ event, payload }: { event: string; [key: string]: any }) {
		const stateVectorR = fromUint8Array(Y.encodeStateVector(this.document));

		const diffR = fromUint8Array(
			Y.encodeStateAsUpdate(this.document, toUint8Array(payload.stateVectorO))
		);

		if (this.channel) {
			try {
				this.channel!.send({
					type: "broadcast",
					event: "update",
					payload: { stateVectorR, diffR },
				});
			} catch (error) {
				console.error("Error broadcasting update:", error);
			}
		}
	}

	private onTestUpdate({ event, payload }: { event: string; [key: string]: any }) {
		if (payload.diffO) {
			try {
				this.version++;
				Y.applyUpdate(this.document, toUint8Array(payload.diffO), this);
				console.log("update applied", this.document);
			} catch (error) {
				console.error("Error applying update:", error);
			}
			return;
		}
		console.log(event, payload);
		console.log("Document before update:", this.document);

		try {
			this.version++;
			Y.applyUpdate(this.document, toUint8Array(payload.diffR), this);
			console.log("update applied", this.document);
		} catch (error) {
			console.error("Error applying update:", error);
		}

		const diffO = fromUint8Array(
			Y.encodeStateAsUpdate(this.document, toUint8Array(payload.stateVectorR))
		);

		if (this.channel) {
			try {
				this.channel!.send({
					type: "broadcast",
					event: "update",
					payload: { diffO },
				});
			} catch (error) {
				console.error("Error broadcasting update:", error);
			}
		}
	}

	private onRecieiveTest({ event, payload }: { event: string; [key: string]: any }) {
		Y.applyUpdate(this.document, toUint8Array(payload.update), this);
	}

	private disconnect() {
		if (this.channel) {
			this.supabase.removeChannel(this.channel);
			this.channel = null;
		}
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

		this.removeAllListeners();
		this.disconnect();

		this.document.off("update", this.documentUpdateHandler);
		this.awareness?.off("update", this.onAwarenessUpdate);

		if (this.channel) {
			this.disconnect();
		}
	}
}
