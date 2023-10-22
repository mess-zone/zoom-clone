import { MaybeRefOrGetter, toValue } from "@vueuse/core"
import { ref } from "vue"
import { v4 as uuidV4 } from 'uuid'

interface Toast {
    id?: string,
    message: string,
}

const toasts = ref<Toast[]>([])

export function useToasts() {

    function addToast(toast: MaybeRefOrGetter<Toast>) {
        const t = toValue(toast)
        t.id = uuidV4()
        toasts.value.push(t)
        console.log('add toast', t)

        setTimeout(()=> {
            console.log('remove toast', t)
            const index = toasts.value.indexOf(t);

            toasts.value.splice(index, 1);
        }, 5000)
    }

    return {
        toasts,
        addToast,
    }
}