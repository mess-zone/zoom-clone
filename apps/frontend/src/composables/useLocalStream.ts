import { MaybeRefOrGetter, toRef, watch, watchEffect } from "vue";
import { useDevices } from "./useDevices";
import { useUserMedia } from "@vueuse/core";

export function useLocalStream(element: MaybeRefOrGetter<HTMLVideoElement | undefined>) {

    const videoEl = toRef(element)

    const { 
        currentCamera, 
        currentMicrophone
    } = useDevices()
    
    
    const { stream, enabled, start, stop, restart } = useUserMedia({
        // autoSwitch: true,
        constraints: {
            // @ts-ignore
            video: { deviceId: currentCamera },
            // @ts-ignore
            audio: { deviceId: currentMicrophone },
        },
    });

    enabled.value = true

    watch(currentCamera, () => {
        console.log("currentCamera CHANGED", currentCamera);
        restart();
    });
    
    watch(currentMicrophone, () => {
        console.log("currentMicrophone CHANGED", currentMicrophone);
        restart();
    });

    watchEffect(() => {
        console.log("WATCH EFFECT stream changed", stream.value);
        if (videoEl.value) {
            videoEl.value.srcObject = stream.value!;
            // video.value.addEventListener('loadedmetadata', () => {
            //     video.value?.play()
            // })
        }
    });

    return {
        videoEl, stream, enabled, start, stop, restart,
    }
}