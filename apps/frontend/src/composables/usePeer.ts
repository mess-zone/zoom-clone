import { shallowRef, ref, ShallowRef } from "vue";
import { makePeer } from "../config/peer";
import Peer, { DataConnection, MediaConnection } from "peerjs";

export function usePeer() {

    const peerId = ref<string>()

    const peer: ShallowRef<Peer | undefined> = shallowRef(undefined);

    const channels = ref<(DataConnection | MediaConnection)[]>([])

    function open() {
        peer.value = makePeer();
        
        peer.value.on("open", (id) => {
            peerId.value = id
            console.log(`[peer] peer connection opened, peerId: ${peerId.value}`);
        });
    
        peer.value.on("close", () => {
            console.log(`[peer] peer connection ${peerId.value} destroyed`);
            peerId.value = undefined
        });
        
        peer.value.on("error", (e) => {
            console.error(`[peer] peer error`, e);
        });
        
        peer.value.on("connection", (dataConnection) => {
            console.log(`[peer] a new data connection was established from a remote peer`, dataConnection);
        })

        peer.value.on("call", (mediaConnection) => {
            console.log(`[peer] a remote peer attempts to call you`, mediaConnection);
        })
    }
    
    function destroy() {
        peer.value?.destroy()
    }
    
    /**
     * Abrir media connection
    */
    function call(destPeerId: string, localStream: MediaStream, options?: any) {
        console.log(`[peer] calling the remote peer ${destPeerId}`, options);
  
        const mediaConnection = peer.value?.call(destPeerId, localStream, options)
        _addMediaConnection(mediaConnection)

        return mediaConnection
    }

    /*
    Abrir data connection
    */
    function connect(destPeerId: string, options?: { label?: string, metadata?: Object }) {
        console.log(`[peer] open remote peer ${destPeerId} data connection`);
        const dataConnection = peer.value?.connect(destPeerId, options);
        _addDataConnection(dataConnection)

        return dataConnection
    }

    function _addDataConnection(dataConnection: DataConnection | undefined) {
        if(dataConnection) {
            console.log(`[peer] dataConnection ${dataConnection.connectionId} added`, dataConnection)
            channels.value.push(dataConnection)

            dataConnection.on('open', () => {
                console.log(`[peer] dataConnection ${dataConnection.connectionId} open and ready-to-use`);
            })

            dataConnection.on('data', (data) => {
                console.log(`[peer] dataConnection ${dataConnection.connectionId} received data:`, data);
            })

            dataConnection.on('close', () => {
                console.log(`[peer] dataConnection ${dataConnection.connectionId} closed`);
                // _removeMediaConnection(mediaConnection)
            })

            dataConnection.on("error", (e) => {
                console.error(`[peer] dataConnection peer error`, e);
                _removeConnection(dataConnection)
            });
        }
    }

    function _addMediaConnection(mediaConnection: MediaConnection | undefined) {
        if(mediaConnection) {
            console.log(`[peer] mediaConnection ${mediaConnection.connectionId} added`, mediaConnection)
            channels.value.push(mediaConnection)

            mediaConnection.on('stream', (stream) => {
                console.log(`[peer] mediaConnection ${mediaConnection.connectionId} received remote stream ${stream.active}`, stream);
                stream.addEventListener('active', (e) => {
                    console.log(`[peer] media stream active`, e)
                })
                stream.addEventListener('inactive', (e) => {
                    console.log(`[peer] media stream inactive`, e)
                })
            })

            mediaConnection.on('close', () => {
                console.log(`[peer] mediaConnection ${mediaConnection.connectionId} closed`);
                // _removeMediaConnection(mediaConnection)
            })

            mediaConnection.on("error", (e) => {
                console.error(`[peer] mediaConnection peer error`, e);
                _removeConnection(mediaConnection)
            });
        }
    }

    function _removeConnection(connection: MediaConnection | DataConnection | undefined) {
        if(connection) {
            console.log(`[peer] ${connection.type} connection ${connection.connectionId} removed from list`);
    
            const index = channels.value.indexOf(connection);
            channels.value.splice(index, 1);
        }
    }

    function _closeAllConnectionsFromUser(peerId: string) {
        console.log('[peer] close all connections from user ', peerId)
        const channelsToClose = channels.value.filter(c => c.peer === peerId)
        for(const channel of channelsToClose) {
            _removeConnection(channel as MediaConnection | DataConnection)
        }
    }
    

    return {
        open,
        destroy,
        call,
        connect,
        peerId,
        peer,
        channels,
        _addMediaConnection,
        _addDataConnection,
        _closeAllConnectionsFromUser,
    }
}