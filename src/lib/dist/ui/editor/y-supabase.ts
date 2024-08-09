import { RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import debounce from "debounce";
import { EventEmitter } from "eventemitter3";
import { fromUint8Array, toUint8Array } from "js-base64";

import {
	Awareness,
	removeAwarenessStates,
	encodeAwarenessUpdate,
	applyAwarenessUpdate,
} from "y-protocols/awareness";
import * as Y from "yjs";

export interface SupabaseProviderConfiguration {
	/**
	 * The identifier/name of your document
	 */
	name: string;
	/**
	 * The actual Y.js document
	 */
	document: Y.Doc;
	/**
	 * The awareness instance
	 */
	awareness?: Awareness;
	/**
	 * Details about the database to connect to
	 */
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
	private awareness: Awareness | null = null;
	private version: number = 0;
	public callbacks: { [key: string]: Function[] } = {};

	constructor(supabase: SupabaseClient, config: SupabaseProviderConfiguration) {
        super();
        
		this.setConfiguration(config);
		this.configuration.document = config.document ? config.document : new Y.Doc();
		this.awareness = config.awareness
			? config.awareness
			: new Awareness(this.configuration.document);
		this.supabase = supabase;

		this.on("connect", this.onConnect);
		this.on("disconnect", this.onDisconnect);
		this.document.on("update", debounce(this.documentUpdateHandler.bind(this), 50));
		this.awareness.on("update", debounce(this.onAwarenessUpdate.bind(this), 50));
		this.connect();

		if (typeof window !== "undefined") {
			window.addEventListener("beforeunload", this.removeSelfFromAwarenessOnUnload);
		} else if (typeof process !== "undefined") {
			process.on("exit", () => this.removeSelfFromAwarenessOnUnload);
		}
	}

	public setConfiguration(configuration: Partial<SupabaseProviderConfiguration> = {}): void {
		this.configuration = { ...this.configuration, ...configuration };
	}

	get document() {
		return this.configuration.document;
	}

	private documentUpdateHandler(update: Uint8Array, origin?: any) {
		if (origin === this) {
			return;
		}

		const stateVectorO = Y.encodeStateVector(this.document);

		if (this.channel) {
			try {
				this.channel.send({
					type: "broadcast",
					event: "diff",
					payload: fromUint8Array(stateVectorO),
				});
			} catch (error) {
				console.error("Error broadcasting diff:", error);
			}
		}
	}

	private onAwarenessUpdate({ added, updated, removed }: any, origin: any) {
		const changedClients = added.concat(updated).concat(removed);
		const awarenessUpdate = encodeAwarenessUpdate(this.awareness!, changedClients);

		if (this.channel) {
			this.channel.send({
				type: "broadcast",
				event: "awareness",
				payload: { awareness: fromUint8Array(awarenessUpdate) },
			});
		}
	}

    removeSelfFromAwarenessOnUnload() {
     
		removeAwarenessStates(this.awareness!, [this.document.clientID], "window unload");
	}

	private async onConnect() {
		// let stateReceived = false;


		const { data, error } = await this.supabase
			.from(this.configuration.databaseDetails.table)
			.select<
				string,
				{ [key: string]: string }
			>(`${this.configuration.databaseDetails.updateColumns.content}`)
			.eq(this.configuration.databaseDetails.updateColumns.name, this.configuration.name)
			.single();

		if (error) {
			console.error(error);
			return;
		}

		if (data && data[this.configuration.databaseDetails.updateColumns.content]) {
			try {
				const dbDocument = toUint8Array(
					data[this.configuration.databaseDetails.updateColumns.content]
				);

				Y.applyUpdate(this.document, dbDocument);
			} catch (error) {
				console.error(error);
			}
		}


		this.emit("status", [{ status: "connected" }]);

		if (this.awareness && this.awareness.getLocalState() !== null) {
			const awarenessUpdate = encodeAwarenessUpdate(this.awareness, [this.document.clientID]);
			this.emit("awareness", awarenessUpdate);
		}
	}

	private connect() {
		this.channel = this.supabase.channel(this.configuration.name);
		this.startSync();
	}

	private startSync() {
        this.channel!
            .on("broadcast", { event: "update" }, (event) => {
                this.onReceiveUpdate(event);
            })
			.on("broadcast", { event: "diff" }, (event) => {
				this.onRecieiveDiffs(event);
			})
			.on("broadcast", { event: "awareness" }, ({ payload }) => {
				const update = toUint8Array(payload.awareness);
				applyAwarenessUpdate(this.awareness!, update, this);
			})
			.on("broadcast", { event: "requestCurrentState" }, (event) => {
				this.onrequestCurrentState(event);
			})
			.on("broadcast", { event: "currentStateResponse" }, (event) => {
				this.oncurrentStateResponse(event);
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                console.log('Newly left presences: ', leftPresences)
              })
			.subscribe((status, err) => {
				switch (status) {
					case "SUBSCRIBED":
						this.emit("connect", this);
						break;
					case "CHANNEL_ERROR":
						this.emit('error', this);
						break;
					case "TIMED_OUT":
						this.emit("disconnect", this);
						break;
					case "CLOSED":
						this.emit("disconnect", this);
						break;
					default:
						break;
				}
			});
	}

	private onReceiveUpdate({ event, payload }: { event: string; [key: string]: any }) {
		console.log("onReceiveUpdate", event, payload);

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
		const dbDocument = fromUint8Array(Y.encodeStateAsUpdate(this.document));

		return dbDocument;
	}

	private onrequestCurrentState({ event, payload }: { event: string; [key: string]: any }) {
		try {
			const stateVector = Y.encodeStateAsUpdate(this.document);
			if (this.channel) {
				this.channel.send({
					type: "broadcast",
					event: "currentStateResponse",
					payload: fromUint8Array(stateVector),
				});
			}

			console.log("Current state sent in response to request.");
		} catch (error) {
			console.error("Error sending current state:", error);
		}
	}

	private oncurrentStateResponse({ event, payload }: { event: string; [key: string]: any }) {
		try {
			const editorState = toUint8Array(payload);
			Y.applyUpdate(this.document, editorState);
			console.log("Received and applied state from another editor.");
		} catch (error) {
			console.error("Error applying state from another editor:", error);
		}
	}

	private onRecieiveDiffs({ event, payload }: { event: string; [key: string]: any }) {

		const stateVectorR = fromUint8Array(Y.encodeStateVector(this.document));

		const diffR = fromUint8Array(Y.encodeStateAsUpdate(this.document, toUint8Array(payload)));

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
			removeAwarenessStates(this.awareness, states, this);
		}
	}

	public destroy() {
		this.removeAllListeners();
		this.disconnect();
		this.document.off("update", this.documentUpdateHandler);
		this.awareness?.off("update", this.onAwarenessUpdate);
       
		if (typeof window !== "undefined") {
			window.removeEventListener("beforeunload", this.removeSelfFromAwarenessOnUnload);
		} else if (typeof process !== "undefined") {
			process.off("exit", () => this.removeSelfFromAwarenessOnUnload);
		}

		if (this.channel) {
			this.disconnect();
		}
	}


}
