import { Peer } from "peerjs"
import { reactive } from "vue"


export const peerState = reactive({
    peerId: '',
})

export const peer = new Peer()

peer.on("open", (peerId) => {
    console.log(`[PEER] conection opened. My peer id: ${peerId}`)
})