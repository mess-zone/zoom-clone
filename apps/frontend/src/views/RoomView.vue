<template>
    <div class="page">


        <div ref="videoGrid" id="videoGrid">
            <div class="video-wrapper my-video">
                <video ref="video" autoplay muted></video>
                <div class="no-camera">
                    <div
                        class="sound-level"
                        :style="{ borderWidth: soundLevel + 'px' }"
                    ></div>
                </div>
            </div>
        </div>
        <p>socket connected: {{ connected }}</p>
        <!-- <button @click="joinRoom()">join-room</button>
        <br />
        <button @click="connect()">Connect</button>
        <button @click="disconnect()">Disconnect</button> -->
        <pre>
            {{ users }}
        </pre>

        <div class="footer-bar">
            <h4>{{ roomId }}</h4>
            <div class="center">
                <button
                    class="btn-round"
                    :class="{ 'btn-danger': !micIsEnabled }"
                    @click="muteMic"
                    :title="!micIsEnabled ? 'Turn on microphone' : 'Turn off microphone'"
                >
                    <font-awesome-icon
                        v-show="micIsEnabled"
                        icon="fa-solid fa-microphone"
                    />
                    <font-awesome-icon
                        v-show="!micIsEnabled"
                        icon="fa-solid fa-microphone-slash"
                    />
                </button>
                <button
                    class="btn-round"
                    :class="{ 'btn-danger': !camIsEnabled }"
                    @click="muteCam"
                    :title="!camIsEnabled ? 'Turn on camera' : 'Turn off camera'"
                >
                    <font-awesome-icon
                        v-show="camIsEnabled"
                        icon="fa-solid fa-video"
                    />
                    <font-awesome-icon
                        v-show="!camIsEnabled"
                        icon="fa-solid fa-video-slash"
                    />
                </button>
                <button class="btn-round" @click="openSettingsModal" title="More options">
                    <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" />
                </button>
                <button class="btn-round btn-danger" @click="handleLeaveRoom" title="End call">
                    <font-awesome-icon icon="fa-solid fa-phone" rotation="180" />
                </button>
            </div>
            <h4>{{ roomId }}</h4>
        </div>

        <div v-if="settingModalIsOpen" class="modal-overlay" @click="closeSettingsModal">
            <div class="modal" @click.stop="">
                <div class="modal-header">
                    <h2>Settings</h2>
                    <button class="close-icon" @click="closeSettingsModal">
                        <font-awesome-icon icon="fa-solid fa-xmark" />
                    </button>
                </div>
                <div class="modal-body">
                    <div class="config-group">
                        <h3>Video</h3>
                        <h4>Camera</h4>
                        <!-- <button @click="muteCam">mute cam</button> -->
                        <ul class="select-list">
                            <li
                                v-for="camera of cameras"
                                :key="camera.deviceId"
                                class="option"
                                :class="{
                                    'active': currentCamera === camera.deviceId,
                                }"
                                @click="currentCamera = camera.deviceId"
                            >
                                {{ camera.label }}
                            </li>
                        </ul>
                    </div>
                    <div class="config-group">
                        <h3>Audio</h3>
                        <h4>Microfone</h4>
                        <!-- <button @click="muteMic">mute mic</button> -->
    
                        <ul class="select-list">
                            <li
                                v-for="microfone of microphones"
                                :key="microfone.deviceId"
                                class="option"
                                :class="{
                                    'active':
                                        currentMicrophone === microfone.deviceId,
                                }"
                                @click="currentMicrophone = microfone.deviceId"
                            >
                                {{ microfone.label }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { state, socket } from "../config/socket";
import { useRoute } from "vue-router";

import { useDevicesList, useUserMedia } from "@vueuse/core";

import { Peer } from "peerjs";
import throttle from "lodash.throttle";
import router from "../routes";

const route = useRoute();

const connected = computed(() => state.connected);
const users = computed(() => state.users);

// function connect() {
//     socket.connect();
// }

function disconnect() {
    socket.disconnect();
}

// // deprecated
// function joinRoom() {
//     const roomId = route.params.roomId;
//     // TODO
//     const userId = "FAKE-USER-ID";
//     console.log("emit ", roomId, userId);
//     socket.emit("join-room", roomId, userId);
// }

// camera e microfone
const currentCamera = ref<string>();
const currentMicrophone = ref<string>();
const { videoInputs: cameras, audioInputs: microphones } = useDevicesList({
    requestPermissions: true,
    onUpdated() {
        console.log("use devices list on updated");
        if (!cameras.value.find((i) => i.deviceId === currentCamera.value)) {
            currentCamera.value = cameras.value[0]?.deviceId;
        }
        if (
            !microphones.value.find(
                (i) => i.deviceId === currentMicrophone.value
            )
        ) {
            currentMicrophone.value = microphones.value[0]?.deviceId;
        }
    },
});

const video = ref<HTMLVideoElement>();
const { stream, enabled, constraints, restart } = useUserMedia({
    autoSwitch: true,
    constraints: {
        // @ts-ignore
        video: { deviceId: currentCamera },
        // @ts-ignore
        audio: { deviceId: currentMicrophone },
    },
});

const soundLevel = ref(0);
watch(stream, () => {
    if (stream.value) {
        console.log("STREAM CHANGED", stream);

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

watch(constraints, () => {
    console.log("STREAM CONSTRAINS CHANGED", constraints);
});

watch(currentCamera, () => {
    console.log("current camera CHANGED", currentCamera);
    restart();
});

watch(currentMicrophone, () => {
    console.log("currentMicrophone CHANGED", currentMicrophone);
    restart();
});

enabled.value = true;

//p2p
const peer = new Peer();

const peers = {};

watchEffect(() => {
    console.log("WATCH EFFECT", stream.value);
    if (video.value) {
        video.value.srcObject = stream.value!;
        // video.value.addEventListener('loadedmetadata', () => {
        //     video.value?.play()
        // })
    }
});

peer.on("call", (call) => {
    call.answer(stream.value);

    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
});

socket.on("user-connected", (userId) => {
    console.log("USER-connected", userId, stream.value);
    connectToNewUser(userId, stream.value);
});

socket.on("user-disconnected", (userId) => {
    console.log(userId, "disconnected");
    console.log(peers);
    // if(peers[userId]) {
    peers[userId].close();
    // }
});

peer.on("open", (id) => {
    console.log("peer connection opened", id);
    socket.emit("join-room", route.params.roomId, id);
});

const roomId = ref(route.params.roomId)

function connectToNewUser(userId, stream) {
    console.log("connecting to new user", userId, stream);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

const videoGrid = ref<HTMLDivElement>();

function addVideoStream(video, stream) {
    console.log("ADD VIDEO STREAM", video);
    video.srcObject = stream;
    video.classList.add('video-remote')
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    if (videoGrid.value) {
        videoGrid.value.append(video);
    }
}

const camIsEnabled = ref(false);
const micIsEnabled = ref(false);

watchEffect(() => {
    if (stream.value) {
        camIsEnabled.value = stream.value.getVideoTracks()[0].enabled;
        micIsEnabled.value = stream.value.getAudioTracks()[0].enabled;
        console.log("BUTTONS watchers", camIsEnabled.value, micIsEnabled.value);
    }
});

function muteCam() {
    camIsEnabled.value = !camIsEnabled.value;
    // @ts-ignore
    stream.value
        .getVideoTracks()
        .forEach((track) => (track.enabled = camIsEnabled.value));
    // @ts-ignore
    console.log("mute cam", stream.value.getVideoTracks()[0]);
}

function muteMic() {
    micIsEnabled.value = !micIsEnabled.value;

    // @ts-ignore
    stream.value
        .getAudioTracks()
        .forEach((track) => (track.enabled = micIsEnabled.value));
    // @ts-ignore
    console.log("mute mic", stream.value.getAudioTracks()[0]);
}


const settingModalIsOpen = ref(false)

function openSettingsModal() {
    settingModalIsOpen.value = true
}

function closeSettingsModal() {
    settingModalIsOpen.value = false
}

function handleLeaveRoom() {
    console.log('leave room')
    disconnect()
    router.push({
        name: 'home'
    })
}
</script>

<style scoped>
.page {
    background-color: rgb(32, 29, 34);
    position: absolute;
    width: 100%;
    min-height: 100%;
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


.btn-round {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid transparent;
    padding: 0;
    font-size: 1.2em;
    background-color: rgba(255, 255, 255, 0.2);
    color: #f9f9f9;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

.btn-round.btn-danger {
    background-color: rgb(219, 39, 52);
}

.close-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid transparent;
    padding: 0;
    font-size: 1.5em;
    color:rgba(0, 0, 0, 0.6);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

#videoGrid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 30px;
}


.no-camera {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 9, 128, 0.459);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.sound-level {
    height: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    /* background-color: green; */
    border-color: rgba(255, 255, 255, 0.356);
    border-style: solid;
}

.footer-bar {
    background-color: rgb(32, 29, 34);
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 20px;
    color: white;
    gap: 10px;
}

.footer-bar .center {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.modal-overlay {
    background-color: rgba(0, 0, 0, 0.781);
    position: fixed;
    inset: 0;
    display: grid;
    /* justify-items: center;
    align-items: center; */
    place-items: center;
}

.modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.config-group {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 15px 0;
}

.select-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.select-list li {
    padding: 5px 10px;
    cursor: pointer;
}

.select-list li:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.select-list li.active {
    color: green;
    font-weight: bold;
}
</style>
