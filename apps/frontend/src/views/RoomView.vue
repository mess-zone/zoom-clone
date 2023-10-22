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
                    {{ soundLevel }}
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
        <div class="footer-bar">
            <ToastContainer class="bottom-toast-container" />
      
            <div class="room-name">
                <span class="connection-status-dot" :class="{ 'connected': connected }" :title="connected ? 'Connected': 'Disconnected'"></span>
                <h4>{{ roomId }}</h4>
            </div>
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
            <h4>{{ size }}</h4>
        </div>

        <Teleport to="body">
            <SettingsModal :isOpen="settingsModalIsOpen" @close="closeSettingsModal" />
        </Teleport>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs } from "vue";
import { useRoute } from "vue-router";
import { useRoomStore } from '../stores/useRoomStore'
import { useToasts } from '../composables/useToasts'
import { useLocalStream } from '../composables/useLocalStream'

import { Peer } from "peerjs";

import SettingsModal from "../components/organisms/SettingsModal.vue";
import ToastContainer from "../components/molecules/ToastContainer.vue";

const route = useRoute();

const { addToast } = useToasts()

const { room } = useRoomStore()
const { rId: roomId, clients, state } = toRefs(room)

room.setRoomId(''+route.params.roomId)
room.active = true

const connected = computed(() => state.value.connected);
const size = computed(() => clients.value.size);

const video = ref<HTMLVideoElement>();

const { 
    stream, 
    camIsEnabled, 
    micIsEnabled, 
    muteCam, 
    muteMic,
    soundLevel,
} = useLocalStream(video)

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

room.socket.on("user-connected", (userId) => {
    console.log("USER-connected", userId, stream.value);
    clients.value.set(userId, { peerId: userId })
    addToast({ message: `${userId} entrou na reunião`})
    connectToNewUser(userId, stream.value);
});

room.socket.on("user-disconnected", (userId) => {
    console.log(userId, "disconnected");
    console.log(peers);
    clients.value.delete(userId)
    addToast({ message: `${userId} saiu da reunião`})
    // if(peers[userId]) {
    peers[userId].close();
    // }
});



const userId = ref<string>('')

peer.on("open", (peerId) => {
    userId.value = peerId
    console.log("peer connection opened", userId.value);
    room.joinRoom(userId)
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

// TODO reset room when leaving?
function handleLeaveRoom() {
    room.leaveRoom(userId)
    room.active = false
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
    color: white;
}

.status-bar .mic-status {
    width: 32px;
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
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.sound-level {
    height: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
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

.footer-bar .bottom-toast-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    margin: 10px 20px;
}

.connection-status-dot {
    display: block;
    width: 10px;
    aspect-ratio: 1;
    background-color: rgb(255, 0, 0);
    border-radius: 50%;
}

.connection-status-dot.connected {
    background-color: #2ae52a;
}

.room-name {
    display: flex;
    gap: 8px;
    align-items: center;
}

</style>