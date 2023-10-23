<template>
    <div class="page">
        <div ref="streamGrid" id="streamGrid">
            {{ peerId }}
            <StreamPreview v-for="item in clientsComputed" :key="item.peerId" :id="item.peerId">
                {{ item }} <span>{{ item.peerId === userId ? 'LOCAL' : 'REMOTE' }}</span>
            </StreamPreview>
        </div>

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

import SettingsModal from "../components/organisms/SettingsModal.vue";
import ToastContainer from "../components/molecules/ToastContainer.vue";
import StreamPreview from "../components/molecules/StreamPreview.vue";
import { usePeer } from "../composables/usePeer";


const route = useRoute();

const { addToast } = useToasts()

const { room } = useRoomStore()
const { rId: roomId, clients, state } = toRefs(room)

const clientsComputed = computed(() => {
    return Object.fromEntries(clients.value)
})

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
const { peerId, peer } = usePeer();
// const peer = new Peer();

const peers = {};

const userId = ref<string>('')

/**
 * 1º when my peer object is created, join the socket room
 */
peer.on("open", (id) => {
    // TODO It's not recommended that you use this ID to identify peers, as it's meant to be used for brokering connections only. You're recommended to set the metadata option to send other identifying information.
    userId.value = id
    console.log(`[peer] peer connection opened, peerId: ${id}`, peer);
    room.joinRoom(userId)
});


// se algum peer me liga, o evento call é acionado
peer.on("call", (mediaConnection) => {
    console.log('[peer] atendendo chamada de ?, sending my local stream:')
    console.log(stream.value)
    console.log(mediaConnection.metadata)
    mediaConnection.answer(stream.value);

    const video = document.createElement("video");
    mediaConnection.on("stream", (userVideoStream) => {
        console.log('[peer] stream remoto recebido ao atender chamada:', userVideoStream)
        addVideoStream(video, userVideoStream);
    });
});

room.socket.on("user-connected", (userId) => {
    console.log(`user ${userId} joined the room ?`);
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








function connectToNewUser(destPeerId, localStream) {
    console.log(`[peer] calling user ${destPeerId} who joinded room ?, sendig my stream: `, localStream);
    // call destination peer
    const mediaConnection = peer.call(destPeerId, localStream, { metadata: { foo: `[peer] calling user ${destPeerId} who joinded room` } });
    const video = document.createElement("video");
    mediaConnection.on("stream", (userVideoStream) => {
        console.log('[peer] stream remoto recebido ao ligar para usuário:', userVideoStream)
        addVideoStream(video, userVideoStream);
    });
    mediaConnection.on("error", () => {
        video.remove();
    });
    mediaConnection.on("close", () => {
        video.remove();
    });


    peers[destPeerId] = mediaConnection;
}

const videoGrid = ref<HTMLDivElement>();

const streamGrid = ref<HTMLDivElement>();

function addVideoStream(video, stream) {
    // console.log("ADD VIDEO STREAM", video) 
    // streamGrid.value?.querySelectorAll('.stream-preview')
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
    peer.destroy()
    room.leaveRoom(userId)
    room.active = false
}
</script>

<style scoped>

.clients {
    background-color: gray;
}

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



#streamGrid {
    background-color: pink;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 30px;
}

#streamGrid > video {
  background-color: rgb(20, 20, 20);
  width: 640px;
  height: 480px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  object-fit: cover;
}

</style>../config/peer