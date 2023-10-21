import { MaybeRefOrGetter, toRef } from "vue"

export function useRoom(id: MaybeRefOrGetter<string>) {

    // TODO rename to roomId
    const rId = toRef(id)

    return {
        rId
    }
}