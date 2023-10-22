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
                <div class="status-bar">
                    <div class="mic-status">
                        <font-awesome-icon
                            v-show="micIsEnabled"
                            icon="fa-solid fa-microphone"
                        />
                        <font-awesome-icon
                            v-show="!micIsEnabled"
                            icon="fa-solid fa-microphone-slash"
                        />
                    </div>
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

        <Teleport to="body">
            <SettingsModal :isOpen="settingsModalIsOpen" @close="closeSettingsModal" />
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { state, socket } from "../config/socket";
import { useRoute } from "vue-router";
import { useRoom } from '../composables/useRoom'
import { useLocalStream } from '../composables/useLocalStream'

import { Peer } from "peerjs";
import throttle from "lodash.throttle";
import router from "../routes";
import SettingsModal from "../components/organisms/SettingsModal.vue";

const route = useRoute();

const connected = computed(() => state.connected);
const users = computed(() => state.users);

// function connect() {
//     socket.connect();
// }

function disconnect() {
    socket.disconnect();
}

const video = ref<HTMLVideoElement>();

const { 
    stream, 
    camIsEnabled, 
    micIsEnabled, 
    muteCam, 
    muteMic
} = useLocalStream(video)


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

//p2p
const peer = new Peer();

const peers = {};

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


const { rId: roomId } = useRoom(''+route.params.roomId)

peer.on("open", (id) => {
    console.log("peer connection opened", id);
    socket.emit("join-room", roomId.value, id);
});


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

const settingsModalIsOpen = ref(false)

function openSettingsModal() {
    settingsModalIsOpen.value = true
}

function closeSettingsModal() {
    settingsModalIsOpen.value = false
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

.video-wrapper .status-bar {
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    top: 0;
    right: 0;
    padding: 8px;
}

.status-bar .mic-status {
    width: 32px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
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
</style>