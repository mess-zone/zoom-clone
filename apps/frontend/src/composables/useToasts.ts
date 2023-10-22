import { MaybeRefOrGetter, toValue } from "@vueuse/core"
import { ref } from "vue"

interface Toast {
    message: string,
}

export function useToasts() {

    const toasts = ref<Toast[]>([])

    function addToast(toast: MaybeRefOrGetter<Toast>) {
        const t = toValue(toast)
        toasts.value.push(t)
        console.log('add toast', t)
    }

    return {
        toasts,
        addToast,
    }
}