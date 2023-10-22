import { reactive, watch } from 'vue'
import { useRoom } from '../composables/useRoom'
import router from "../routes";

const room = reactive(useRoom())

export function useRoomStore() {

    watch(() => room.active, () => {
        if(room.active === false) {
            router.push({
                name: 'home'
            })
        } else {
            router.push({
                name: 'room',
                params: {
                    roomId: room.rId,
                }
            })
        }
    })

    return {
        room
    }


}