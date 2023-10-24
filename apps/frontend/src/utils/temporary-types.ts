import { DataConnection, MediaConnection } from "peerjs";

export interface RemoteStream {
    id: string,
    peerId: string,
    mediaChannel: MediaConnection | null,
    dataChannel: DataConnection | null,
    type: 'cam' | 'screen-share',
    visible: boolean,

    user?: {
        name: string,
        color: string,
    },
    raisedHand?: boolean, // TODO não faz sentida para 'screen-share', deveria ser opcional?, mas é obrigatorio para 'cam'
}