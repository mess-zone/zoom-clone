import { ref } from "vue"

export function useRoom(roomId: string) {

    const rId = ref(roomId)

    return {
        rId
    }
}