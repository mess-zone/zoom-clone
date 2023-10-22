import { MaybeRefOrGetter, reactive, ref, toValue } from "vue"
import { state, socket } from "../config/socket";

interface User {
    peerId: string,
}

export function useRoom() {

    // TODO rename to roomId
    const rId = ref<string>()

    const active = ref(false)

    const clients = reactive(new Map<string, User>())

    /**
     * configura socket para acessar a sala com id especificado.
     * 
     * 
     * se o id não for especificado, cria um novo id único
     * @param id 
     * @returns 
     */
    async function setRoomId(roomId?: MaybeRefOrGetter<string>) {
        const id = toValue(roomId)

        if(id) {
            rId.value = id
            return
        }

        try {
            const response = await getRandomId()
            // console.log('ROOM ID NOT DEFINED, CREATING RANDOM MEETING ID', response)
    
            rId.value = response.roomId

        } catch (error) {
            console.error(error);
        }
    }

    async function getRandomId() {
        return socket.emitWithAck('create-meeting')
    }

    async function joinRoom(userId: MaybeRefOrGetter<string>) {
        const uId = toValue(userId)
        console.log('[useRoom] join-meeting', rId.value, uId)
        try {
            const response = await socket.emitWithAck("join-meeting", rId.value, uId);

            response.forEach(peer => {
                // console.log(peer)
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
        active,
        clients,
        joinRoom,
        leaveRoom,
        setRoomId,
        // deprecated
        state, socket,
    }
}