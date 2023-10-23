import { shallowReactive, ref } from "vue";
import { makePeer } from "../config/peer";
import Peer from "peerjs";

export function usePeer() {

    const peerId = ref<string>()

    const peer = shallowReactive<Peer>(makePeer());

    const channels = ref([])

    peer.on("open", (id) => {
        peerId.value = id
        console.log(`[peer] peer connection opened, peerId: ${peerId.value}`);
    });

    peer.on("close", () => {
        console.log(`[peer] peer connection ${peerId.value} destroyed`);
        peerId.value = undefined
    });
    
    peer.on("error", (e) => {
        console.error(`[peer] peer error`, e);
    });
    
    peer.on("call", (mediaConnection) => {
        console.log(`[peer] a remote peer attempts to call you`, mediaConnection);
    })
    

    return {
        peerId,
        peer,
        channels,
    }
}