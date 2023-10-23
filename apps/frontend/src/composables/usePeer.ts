import { shallowRef, ref, ShallowRef } from "vue";
import { makePeer } from "../config/peer";
import Peer, { MediaConnection } from "peerjs";

export function usePeer() {

    const peerId = ref<string>()

    const peer: ShallowRef<Peer | undefined> = shallowRef(undefined);

    const channels = ref<MediaConnection[]>([])

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
        
        peer.value.on("call", (mediaConnection) => {
            console.log(`[peer] a remote peer attempts to call you`, mediaConnection);
        })
    }
    
    function destroy() {
        peer.value?.destroy()
    }
    
    function call(destPeerId: string, localStream: MediaStream, metadata: Object) {
        console.log(`[peer] calling the remote peer ${destPeerId}`, metadata);
        const mediaConnection = peer.value?.call(destPeerId, localStream, { metadata })
        _addMediaConnection(mediaConnection)

        return mediaConnection
    }

    function _addMediaConnection(mediaConnection: MediaConnection | undefined) {
        if(mediaConnection) {
            console.log(`[peer] mediaConnection ${mediaConnection.connectionId}`, mediaConnection)
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
                console.log(`[peer] mediaConnection ${mediaConnection.connectionId} closed media connection`);
                // _removeMediaConnection(mediaConnection)
            })

            mediaConnection.on("error", (e) => {
                console.error(`[peer] mediaConnection peer error`, e);
                _removeMediaConnection(mediaConnection)
            });
        }
    }

    function _removeMediaConnection(mediaConnection: MediaConnection | undefined) {
        if(mediaConnection) {
            console.log(`[peer] mediaConnection ${mediaConnection.connectionId} removed from list`);
    
            const index = channels.value.indexOf(mediaConnection);
            channels.value.splice(index, 1);
        }
    }

    function _closeAllConnectionsFromUser(peerId: string) {
        console.log('[peer] close all connections from user ', peerId)
        const channelsToClose = channels.value.filter(c => c.peer === peerId) as MediaConnection[]
        for(const channel of channelsToClose) {
            // channel.close()
            console.log(channel)
            _removeMediaConnection(channel)
        }
    }
    

    return {
        open,
        destroy,
        call,
        peerId,
        peer,
        channels,
        _addMediaConnection,
        _closeAllConnectionsFromUser,
    }
}