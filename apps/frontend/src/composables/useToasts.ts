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

        setTimeout(()=> {
            console.log('remove toast', t)
            const index = toasts.value.indexOf(t);

            toasts.value.splice(index, 1);
        }, 5000)
    }

    setTimeout(()=> {
        addToast({ message: '1  3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    }, 1000)

    setTimeout(()=> {
        addToast({ message: '2  3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    }, 2000)

    setTimeout(()=> {
        addToast({ message: '3  3f063f3c-5bc5-467b-8fe2-19ab9eb483a0 entrou na reunião'})
    }, 4000)

    return {
        toasts,
        addToast,
    }
}