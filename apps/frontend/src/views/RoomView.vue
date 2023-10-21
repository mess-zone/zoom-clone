<template>
    <h1>room</h1>
    <p>connected: {{ connected }}</p>
    <button @click="joinRoom()">join-room</button>
    <br />
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
    <pre>
        {{ users }}
    </pre>

    <video ref="video" autoplay class="h-100 w-auto"></video>
    <button @click="enabled = !enabled">
        {{ enabled ? "Stop" : "Start" }}
    </button>
    <h3>cameras</h3>
    <div
        v-for="camera of cameras"
        :key="camera.deviceId"
        :class="{ 'text-primary': currentCamera === camera.deviceId }"
        @click="currentCamera = camera.deviceId"
    >
        {{ camera.label }}
    </div>
    <h3>microphones</h3>
    <div
        v-for="microfone of microphones"
        :key="microfone.deviceId"
        :class="{ 'text-primary': currentMicrophone === microfone.deviceId }"
        @click="currentMicrophone = microfone.deviceId"
    >
        {{ microfone.label }}
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { state, socket } from "../config/socket";
import { useRoute } from "vue-router";

import { useDevicesList, useUserMedia } from "@vueuse/core";

const route = useRoute();

const connected = computed(() => state.connected);
const users = computed(() => state.users);

function connect() {
    socket.connect();
}

function disconnect() {
    socket.disconnect();
}

function joinRoom() {
    const roomId = route.params.roomId;
    // TODO
    const userId = "FAKE-USER-ID";
    console.log("emit ", roomId, userId);
    socket.emit("join-room", roomId, userId);
}

// camera e microfone
const currentCamera = ref<string>();
const currentMicrophone = ref<string>();
const { 
    videoInputs: cameras,
    audioInputs: microphones,
} = useDevicesList({
    requestPermissions: true,
    onUpdated() {
        if (!cameras.value.find((i) => i.deviceId === currentCamera.value)) {
            currentCamera.value = cameras.value[0]?.deviceId;
        }
        if (!microphones.value.find((i) => i.deviceId === currentMicrophone.value)) {
            currentMicrophone.value = microphones.value[0]?.deviceId;
        }
    },
});

const video = ref<HTMLVideoElement>();
const { stream, enabled } = useUserMedia({
    constraints: { 
        video: { deviceId: currentCamera },
        audio: { deviceId: currentMicrophone },
    },
});

watchEffect(() => {
    if (video.value) {
        video.value.srcObject = stream.value!;
        // video.value.addEventListener('loadedmetadata', () => {
        //     video.value?.play()
        // })
    }
});

</script>

<style>
.text-primary {
    color: green;
    font-weight: bold;
}
</style>