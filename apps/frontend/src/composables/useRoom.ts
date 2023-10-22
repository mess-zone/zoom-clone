import { MaybeRefOrGetter, reactive, toRef } from "vue"
import { state, socket } from "../config/socket";

interface User {
    id: string,
}

export function useRoom(id: MaybeRefOrGetter<string>) {

    // TODO rename to roomId
    const rId = toRef(id)

    const clients = reactive(new Map<string, User>())

    function join(roomId: string, userId: string) {
        console.log('[useRoom] JOIN ROOM', roomId, userId)
        socket.emit("join-room", roomId, userId);
        clients.set(userId, { id: userId })
    }

    return {
        rId,
        clients,
        join,
        // deprecated
        state, socket,
    }
}