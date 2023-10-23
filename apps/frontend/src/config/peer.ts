import { Peer } from "peerjs"

export function makePeer() {
    const peer = new Peer()

    peer.on("open", (peerId) => {
        console.log(`[peer] OPEN peerId: ${peerId}`);
    });

    return peer
}