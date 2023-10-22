import { reactive } from 'vue'
import { useRoom } from '../composables/useRoom'

const room = reactive(useRoom())

export function useRoomStore() {
    return {
        room
    }
}