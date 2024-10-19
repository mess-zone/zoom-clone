import { ref } from "vue"
import { useDevicesList } from "@vueuse/core";

const currentCamera = ref<string>();
const currentMicrophone = ref<string>();

const { videoInputs: cameras, audioInputs: microphones } = useDevicesList({
    requestPermissions: true,
    onUpdated() {
        console.log("use devices list on updated", cameras.value, microphones.value);
        if (!cameras.value.find((i) => i.deviceId === currentCamera.value)) {
            currentCamera.value = cameras.value[0]?.deviceId;
        }
        if (!microphones.value.find((i) => i.deviceId === currentMicrophone.value)) {
            currentMicrophone.value = microphones.value[0]?.deviceId;
        }
    },
});

export function useDevices() {

    return {
        // TODO rename to currentCameraId
        currentCamera,
        // TODO renamte to currentMicrophoneId
        currentMicrophone,
        // TODO rename to availableCameras
        cameras,
        // TODO renamte to availableMicrophones
        microphones,
    }
}