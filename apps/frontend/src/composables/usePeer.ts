import { shallowRef, ref, ShallowRef } from "vue";
import { makePeer } from "../config/peer";
import Peer from "peerjs";

export function usePeer() {

    const peerId = ref<string>()

    const peer: ShallowRef<Peer | undefined> = shallowRef(undefined);

    const channels = ref([])

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
    

    return {
        open,
        destroy,
        peerId,
        peer,
        channels,
    }
}