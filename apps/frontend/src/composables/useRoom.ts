import { MaybeRefOrGetter, reactive, toRef } from "vue"
import { state, socket } from "../config/socket";
import { toValue } from "@vueuse/core";

interface User {
    id: string,
}

export function useRoom(id: MaybeRefOrGetter<string>) {

    // TODO rename to roomId
    const rId = toRef(id)

    const clients = reactive(new Map<string, User>())

    function joinRoom(userId: MaybeRefOrGetter<string>) {
        const uId = toValue(userId)
        console.log('[useRoom] join-meeting', rId.value, uId)
        socket.emit("join-meeting", rId.value, uId);
        clients.set(uId, { id: uId })
    }

    function leaveRoom(userId: MaybeRefOrGetter<string>) {
        const uId = toValue(userId)
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