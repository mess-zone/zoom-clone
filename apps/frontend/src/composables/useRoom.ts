import { MaybeRefOrGetter, reactive, ref, toValue } from "vue"
import { state, socket } from "../config/socket";

interface User {
    peerId: string,
}

export function useRoom(id?: MaybeRefOrGetter<string>) {

    // TODO rename to roomId
    const rId = ref(toValue(id))

    const clients = reactive(new Map<string, User>())

    // entrar em sala com id definido
    if(!rId.value) {
        // gerar novo id
        createRoom()
    }

    async function createRoom() {
        try {
            const response = await socket.emitWithAck('create-meeting')
            console.log('ROOM ID NOT DEFINED, CREATING MEETING ID', response)
    
            rId.value = response.roomId

        } catch (error) {
            console.error(error);
        }
    }

    async function joinRoom(userId: MaybeRefOrGetter<string>) {
        const uId = toValue(userId)
        console.log('[useRoom] join-meeting', rId.value, uId)
        try {
            const response = await socket.emitWithAck("join-meeting", rId.value, uId);
            console.log('CALLBACK');
              
            response.forEach(peer => {
                console.log(peer)
                clients.set(peer.peerId, peer)
            });
        } catch(e) {
            console.error(e)
        }
    }

    function leaveRoom(peerId: MaybeRefOrGetter<string>) {
        const uId = toValue(peerId)
        console.log('[useRoom] leave-meeting', rId.value, uId)
        socket.emit("leave-meeting", rId.value, uId);
        clients.delete(uId)
    }

    return {
        rId,
        clients,
        joinRoom,
        leaveRoom,
        // deprecated
        state, socket,
    }
}