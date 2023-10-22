import { MaybeRefOrGetter, ref, toRef, watch, watchEffect } from "vue";
import { useDevices } from "./useDevices";
import { useUserMedia } from "@vueuse/core";
import throttle from "lodash.throttle";

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



    const camIsEnabled = ref(false);
    const micIsEnabled = ref(false);

    watchEffect(() => {
        if (stream.value) {
            camIsEnabled.value = stream.value.getVideoTracks()[0].enabled;
            micIsEnabled.value = stream.value.getAudioTracks()[0].enabled;
        }
    });

    function muteCam() {
        camIsEnabled.value = !camIsEnabled.value;
        // @ts-ignore
        stream.value
            .getVideoTracks()
            .forEach((track) => (track.enabled = camIsEnabled.value));
        // @ts-ignore
        console.log('mute cam', stream.value?.getVideoTracks()[0])
        
    }

    function muteMic() {
        micIsEnabled.value = !micIsEnabled.value;
        // @ts-ignore
        stream.value
            .getAudioTracks()
            .forEach((track) => (track.enabled = micIsEnabled.value));
        // @ts-ignore
        console.log('mute mic', stream.value?.getAudioTracks()[0])
    }



    // sound level

    const soundLevel = ref(0);
    watch(stream, () => {
        console.log("SOUND LEVEL STREAM CHANGED", stream);
        if (stream.value) {
            // draw microphone activity levels
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream.value);
            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = throttle(() => {
                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                var values = 0;

                var length = array.length;
                for (var i = 0; i < length; i++) {
                    values += array[i];
                }

                var average = values / length;
                // console.log(average)
                soundLevel.value = average;
            }, 150);
        }
    });

    return {
        videoEl, stream, enabled, start, stop, restart,
        camIsEnabled, micIsEnabled, muteCam, muteMic, soundLevel,
    }
}