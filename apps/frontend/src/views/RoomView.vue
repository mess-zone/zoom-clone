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

    <div class="video-wrapper">
        <video ref="video" autoplay></video>
        <div class="bottom-bar">
            <button class="btn-round" @click="enabled = !enabled" :title="enabled ? 'Stop cam' : 'Start cam'">
                <font-awesome-icon v-show="enabled" icon="fa-solid fa-video" />
                <font-awesome-icon v-show="!enabled" icon="fa-solid fa-video-slash" />
            </button>
        </div>
    </div>
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
        video: { deviceId: currentCamera.value },
        audio: { deviceId: currentMicrophone.value },
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

.video-wrapper {
    background-color: rgb(50, 50, 50);
    width: 640px;
    height: 480px;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
}

.video-wrapper video {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    object-fit: cover;
}

.video-wrapper .bottom-bar {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin-bottom: 10px;
}

.btn-round {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 1px solid transparent;
    padding: 0;
    font-size: 2em;
    background-color: #f9f9f9;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>