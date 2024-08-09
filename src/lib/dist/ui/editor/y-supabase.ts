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
	name: string;
	document: Y.Doc;
	awareness?: Awareness;
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
	private presenceData = {}
	constructor(supabase: SupabaseClient, config: SupabaseProviderConfiguration) {
		super();

		this.setConfiguration(config);
		this.configuration.document = config.document ? config.document : new Y.Doc();
		this.awareness = new Awareness(this.configuration.document);
		this.supabase = supabase;

		this.on("connect", this.onConnect);
		this.on("disconnect", this.onDisconnect);
		this.document.on("update", debounce(this.documentUpdateHandler.bind(this), 100));
        this.awareness.on("update", debounce(this.onAwarenessUpdate.bind(this), 100));
        
        this.connect();
        

		
        

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
	

	
		const userCount = Object.keys(this.presenceData).length;
	
		if (userCount > 1 && this.channel) {
			const stateVectorO = fromUint8Array(Y.encodeStateVector(this.document));
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
	}
	

	private async onAwarenessUpdate({ added, updated, removed }: any, origin: any) {
    // Combine added, updated, and removed clients
			const changedClients = added.concat(updated).concat(removed);
			
			// Filter out inactive clients
			const activeClients = changedClients.filter((client: any) => {
				// Replace this check with your actual condition for active clients
				return this.awareness.getStates().has(client) && !this.awareness.getStates().get(client).inactive;
			});

			// Encode awareness update only for active clients
			const awarenessUpdate = encodeAwarenessUpdate(this.awareness!, activeClients);


	
		const userCount = Object.keys(this.presenceData).length;
	
		console.log("User count:", userCount);
		
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

	private oncurrentStateResponse({ event, payload }: { event: string; [key: string]: any }) {
		try {
			const editorState = toUint8Array(payload);
			Y.applyUpdate(this.document, editorState);
			console.log("Received and applied state from another editor.");
		} catch (error) {
			console.error("Error applying state from another editor:", error);
		}
	}

	removeSelfFromAwarenessOnUnload() {
		removeAwarenessStates(this.awareness!, [this.document.clientID], "window unload");
	}

	private async onConnect() {
        // let stateReceived = false;
        
        if (this.channel) {
            console.log("asking for current state");
            
            try {
                this.channel.send({
                    type: "broadcast",
                    event: "requestCurrentState",
                    payload: {}
                });
            } catch (error) {
                console.error("Error broadcasting diff:", error);
            }
        }


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

	
            // or any default state you wish to apply
            // && !(data[0][this.configuration.databaseDetails.updateColumns.content] !== "AAA=")
          



		
        if ((data.length !== 0 && data[0][this.configuration.databaseDetails.updateColumns.content] !== "AAA=" )) {
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
			const awarenessUpdate = encodeAwarenessUpdate(this.awareness, [this.document.clientID]);
			this.emit("awareness", awarenessUpdate);
		}
	}

	private connect() {
		this.channel = this.supabase.channel(this.configuration.name);
		this.startSync();
	}

	private startSync() {
		this.channel!.on("broadcast", { event: "update" }, (event) => {
			this.onReceiveUpdate(event);
		})
			.on("broadcast", { event: "diff" }, (event) => {
				this.onRecieiveDiffs(event);
			})
			.on("broadcast", { event: "awareness" }, ({ payload }) => {
                const update = toUint8Array(payload.awareness);
                if (this.awareness) {
                    applyAwarenessUpdate(this.awareness!, update, this);
                }
			})
			.on('presence', { event: 'sync' }, () => {
				console.log('Synced presence state: ', this.channel!.presenceState())
				this.presenceData = this.channel!.presenceState()
			  })
            .on("broadcast", { event: "requestCurrentState" }, (event) => {
				this.onrequestCurrentState(event);
			})
			.on("broadcast", { event: "currentStateResponse" }, (event) => {
				this.oncurrentStateResponse(event);
			})

			.subscribe(async (status) => {
				switch (status) {
					case "SUBSCRIBED":
                        this.emit("connect", this);
                        console.log("Connected to channel", this.configuration.name);
                        await this.channel!.track({ online_at: new Date().toISOString() })
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
	
        return fromUint8Array(Y.encodeStateAsUpdate(this.document));;
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
  
        if (this.awareness) {
            const localClientID = this.document.clientID;
            removeAwarenessStates(this.awareness, [localClientID], "destroy");
        }

        if (this.channel && this.awareness) {
            const awarenessUpdate = encodeAwarenessUpdate(this.awareness, [this.document.clientID]);
            this.channel.send({
                type: "broadcast",
                event: "awareness",
                payload: { awareness: fromUint8Array(awarenessUpdate) },
            });
        }

        this.removeSelfFromAwarenessOnUnload();
        this.removeAllListeners();
        this.disconnect();

		this.document.off("update", this.documentUpdateHandler);
		this.awareness?.off("update", this.onAwarenessUpdate);

		if (this.channel) {
			this.disconnect();
		}
	}
}
