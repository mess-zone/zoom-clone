import { shallowReactive } from "vue";
import { makePeer } from "../config/peer";
import Peer from "peerjs";

export function usePeer() {

    const peer = shallowReactive<Peer>(makePeer());

    return {
        peer,   
    }
}