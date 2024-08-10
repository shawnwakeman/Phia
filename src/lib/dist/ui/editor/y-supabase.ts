import { RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import debounce from "debounce";
import { EventEmitter } from "eventemitter3";
import { fromUint8Array, toUint8Array } from "js-base64";


import * as Y from "yjs";
import * as bc from 'lib0/broadcastchannel'
import * as time from 'lib0/time'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as syncProtocol from 'y-protocols/sync'
import * as authProtocol from 'y-protocols/auth'
import * as awarenessProtocol from 'y-protocols/awareness'
import { ObservableV2 } from 'lib0/observable'
import * as math from 'lib0/math'
import * as url from 'lib0/url'
import * as env from 'lib0/environment'

export const messageSync = 0
export const messageQueryAwareness = 3
export const messageAwareness = 1
export const messageAuth = 2

export interface SupabaseProviderConfiguration {
	name: string;
	document: Y.Doc;
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
	public presenceData = {}
	constructor(supabase: SupabaseClient, config: SupabaseProviderConfiguration) {
		super();

		this.setConfiguration(config);
		this.configuration.document = config.document ? config.document : new Y.Doc();
		this.awareness = new awarenessProtocol.Awareness(this.configuration.document);
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

		const changedClients = added.concat(updated).concat(removed);

		const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness!, changedClients);


	
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
		awarenessProtocol.removeAwarenessStates(this.awareness!, [this.document.clientID], "window unload");
	}

	public async onConnect() {
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
			const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.document.clientID]);
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
                    awarenessProtocol.applyAwarenessUpdate(this.awareness!, update, this);
                }
			})
			.on('presence', { event: 'sync' }, () => {
				console.log('Synced presence state: ', this.channel!.presenceState())
				this.presenceData = this.channel!.presenceState()
			  })
            .on("broadcast", { event: "requestCurrentState" }, (event) => {
				this.onrequestCurrentState(event);
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
            const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.document.clientID]);
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
