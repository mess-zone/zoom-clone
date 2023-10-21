import { MaybeRefOrGetter, ref, toValue } from "vue"
import { useDevicesList } from "@vueuse/core";

export function useDevices() {

    const currentCamera = ref<string>();
    const currentMicrophone = ref<string>();

    const { videoInputs: cameras, audioInputs: microphones } = useDevicesList({
        requestPermissions: true,
        onUpdated() {
            console.log("use devices list on updated");
            if (!cameras.value.find((i) => i.deviceId === currentCamera.value)) {
                currentCamera.value = cameras.value[0]?.deviceId;
            }
            if (!microphones.value.find((i) => i.deviceId === currentMicrophone.value)) {
                currentMicrophone.value = microphones.value[0]?.deviceId;
            }
        },
    });

    function setCurrentCamera(device: MaybeRefOrGetter<MediaDeviceInfo>) {
        currentCamera.value = toValue(device).deviceId
    }

    function setCurrentMicrophone(device: MaybeRefOrGetter<MediaDeviceInfo>) {
        currentMicrophone.value = toValue(device).deviceId
    }


    return {
        // TODO rename to currentCameraId
        currentCamera,
        // TODO renamte to currentMicrophoneId
        currentMicrophone,
        setCurrentCamera,
        setCurrentMicrophone,
        // TODO rename to availableCameras
        cameras,
        // TODO renamte to availableMicrophones
        microphones,
    }
}