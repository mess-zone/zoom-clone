import { MaybeRefOrGetter, toValue } from "@vueuse/core"
import { ref } from "vue"
import { v4 as uuidV4 } from 'uuid'

interface Toast {
    id?: string,
    message: string,
}

export function useToasts() {

    const toasts = ref<Toast[]>([])

    function addToast(toast: MaybeRefOrGetter<Toast>) {
        const t = toValue(toast)
        t.id = uuidV4()
        toasts.value.push(t)
        console.log('add toast', t)
    }

    addToast({ message: '3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    addToast({ message: '3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    addToast({ message: '3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    addToast({ message: '3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})

    return {
        toasts,
        addToast,
    }
}