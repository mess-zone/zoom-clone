<template>
    <div class="page">
        <div class="local-stream-grid">
            <div class="video-wrapper video-wrapper--cam">
                <video ref="camVideo" autoplay muted></video>
                <div class="no-camera">
                    <div
                        class="sound-level"
                        :style="{ borderWidth: soundLevel + 'px' }"
                    ></div>
                </div>
                <div class="top-status-bar">
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
                <div class="bottom-bar">
                    You [cam] {{ user?.name }} {{ user?.color }}
                    <font-awesome-icon icon="fa-regular fa-hand" v-if="!!handIsRaised"/>
                </div>
            </div>
            <div v-if="screenIsSharing" class="video-wrapper video-wrapper--shared-screen">
                <video ref="sharedScreenVideo" autoplay muted></video>
                <div class="bottom-bar">
                    You [screen-share] {{ user?.name }} {{ user?.color }}
                </div>
            </div>
        </div>

        <div id="streamGrid">
            <StreamPreview 
                v-for="item in visibleRemoteStreams" 
                :key="item.id"
                :remoteStream="(item as RemoteStream)"
                :mediaStream="(item.mediaChannel?.remoteStream as MediaStream)"
            ></StreamPreview>
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
                <button class="btn-round" :class="{ 'active': handIsRaised }" @click="handleRaiseHand" :title="handIsRaised ? 'Stop raise hand': 'Raise hand'">
                    <font-awesome-icon icon="fa-regular fa-hand" />
                </button>
                <button class="btn-round" :class="{ 'active': screenIsSharing }" @click="handleShareScreen" :title="screenIsSharing ? 'Stop sharing screen': 'Start share screen'">
                    <font-awesome-icon :icon="['fas', 'tv']" />
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
import { computed, ref, toRefs, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useRoomStore } from '../stores/useRoomStore'
import { useToasts } from '../composables/useToasts'
import { useLocalStream } from '../composables/useLocalStream'

import SettingsModal from "../components/organisms/SettingsModal.vue";
import ToastContainer from "../components/molecules/ToastContainer.vue";
import StreamPreview from "../components/molecules/StreamPreview.vue";
import { usePeer } from "../composables/usePeer";
import { generateRandomUser } from "../utils/randomUser"
import { v4 as uuidV4 } from 'uuid'
import { useDisplayMedia } from '@vueuse/core'
import { RemoteStream } from "../utils/temporary-types";

const route = useRoute();

const { addToast } = useToasts()

const { room } = useRoomStore()
const { rId: roomId, clients, state } = toRefs(room)

room.setRoomId(''+route.params.roomId)
room.active = true

const connected = computed(() => state.value.connected);
const size = computed(() => clients.value.size);

const camVideo = ref<HTMLVideoElement>();

const { 
    stream: camStream, 
    camIsEnabled, 
    micIsEnabled, 
    muteCam, 
    muteMic,
    soundLevel,
} = useLocalStream(camVideo)

const sharedScreenVideo = ref<HTMLVideoElement>();


const { stream: shareScreenStream, stop, enabled: screenIsSharing } = useDisplayMedia({ video: true, audio: true })

watchEffect(() => {
  // preview on a video element
  if(sharedScreenVideo.value && shareScreenStream.value) {
      sharedScreenVideo.value.srcObject = shareScreenStream.value
  }
  if(shareScreenStream.value) {
    // nunca é disparado pois o stream já comeca ativado
    //   shareScreenStream.value.addEventListener('active', (e) => {
    //     console.log('shared screen active')
    //   })
    // garante que o evento de desligar o compartilhamento de tela vai ser disparado, mesmo se o usuário fechar a aba/janela/tela que estava sendo compartilhada
    shareScreenStream.value.addEventListener('inactive', (e) => {
        console.log('shared screen inactive', e)
        stop()
        console.log('ENVIAR COMANDO DE ENCERRAR COMPARTILHAMENTO DE TELA')
        disconnectSharedScreenWithAllUsers()
    })
  }

})

//p2p
const { open, call, connect, peer, _addMediaConnection, _addDataConnection, _closeAllConnectionsFromUser } = usePeer();

const userId = ref<string>('')

interface User {
    peerId?: string,
    name?: string,
    color?: string,
}

const user = ref<User>({
    peerId: undefined,
    name: undefined,
    color: undefined,
})

open()

const remoteStreams = ref<RemoteStream[]>([])

const visibleRemoteStreams = computed(() => {
    return remoteStreams.value.filter(s => s.visible)
})

function addToRemoteStreams(stream: RemoteStream) {
    const foundStream = remoteStreams.value.find(s => s.id == stream.id)
    // patch update 
    if(foundStream) { 
        if(stream.dataChannel) {
            foundStream.dataChannel = stream.dataChannel
        }
        if(stream.mediaChannel) {
            foundStream.mediaChannel = stream.mediaChannel
        }
    } else {
        remoteStreams.value.push(stream)
    }
}

function removeFromRemoteStreams(remoteStream: RemoteStream) {
    const index = remoteStreams.value.indexOf(remoteStream);
    remoteStreams.value.splice(index, 1);
}

function removeAllRemoteStreamsByUser(peerId: string) {
    const streamsToRemove = remoteStreams.value.filter(s => s.peerId == peerId)
    for(const remoteStream of streamsToRemove) {
        removeFromRemoteStreams(remoteStream as RemoteStream)
    }
}

function getRemoteStream(remoteStreamId: string) {
    return remoteStreams.value.find(s => s.id == remoteStreamId)
}

function sendDataToRemoteStream(remoteStreamId: string, payload) {
    const remoteStream = getRemoteStream(remoteStreamId)
    if(remoteStream?.dataChannel) {
        remoteStream.dataChannel.send(payload)
    }
}

function sendToAllRemoteStreams(payload, streamType: string) {
    console.log(`BROADCAST DATA TO ALL ${streamType} streams`, payload)
    for(const remoteStream of remoteStreams.value) {
        if(remoteStream.type == streamType) {
            if(remoteStream.dataChannel) {
                remoteStream.dataChannel.send(payload)
            }
        }
    }
}

if(peer.value) {
    // when my peer object is created, join the socket room
    peer.value.on("open", (id) => {
        // TODO It's not recommended that you use this ID to identify peers, as it's meant to be used for brokering connections only. You're recommended to set the metadata option to send other identifying information.
        userId.value = id

        user.value = {
            peerId: userId.value,
            ...generateRandomUser()
        }
        room.joinRoom(user)
    });
    
    // se algum peer me liga, o evento call é acionado
    peer.value.on("call", (mediaConnection) => {
        _addMediaConnection(mediaConnection)

        let visible = false

        if(mediaConnection.metadata.remoteStreamType === 'cam') {
            mediaConnection.answer(camStream.value);
            visible = true
        } else if(mediaConnection.metadata.remoteStreamType === 'screen-share') {
            mediaConnection.answer();
            visible = true
        }

        // add remote stream to array of remote streams
        const remoteStream: RemoteStream = {
            id: mediaConnection.metadata.remoteStreamId,
            peerId: mediaConnection.peer,
            mediaChannel: mediaConnection,
            dataChannel: null,
            type: mediaConnection.metadata.remoteStreamType,
            visible,
        }
        addToRemoteStreams(remoteStream)
    });

    peer.value.on("connection", (dataConnection) => {
        _addDataConnection(dataConnection)
        let visible = false
        dataConnection.on('open', () => {
            // receive messages
            dataConnection.on('data', (event) => handleStreamControllerEvents(event, dataConnection.metadata.remoteStreamId))


            if(dataConnection.metadata.remoteStreamType === 'cam') {
                // send messages
                const payload = { event: 'updated-user-info', data: { user: user.value, raisedHand: handIsRaised.value} }
                console.log('sendind UPDATE-USER-INFO data', payload)
                sendDataToRemoteStream(dataConnection.metadata.remoteStreamId, payload)
                visible = true
            } else if(dataConnection.metadata.remoteStreamType === 'screen-share') {
                visible = false
            }
        })

        // add remote stream to array of remote streams
        const remoteStream: RemoteStream = {
            id: dataConnection.metadata.remoteStreamId,
            peerId: dataConnection.peer,
            mediaChannel: null,
            dataChannel: dataConnection,
            type: dataConnection.metadata.remoteStreamType,
            visible,
        }
        addToRemoteStreams(remoteStream)
    })

}

room.socket.on("user-connected", (user) => {
    console.log(`[socket] user ${user.name} joined the room:`, user);
    clients.value.set(user.peerId, user)
    addToast({ message: `${user.name} entrou na reunião`})
    connectToNewUser(user.peerId, camStream.value);
    if(screenIsSharing.value) {
        connectToShareScreenWithUser(user.peerId, shareScreenStream.value)
    }
});

room.socket.on("user-disconnected", (userId) => {
    // TODO show user name
    console.log(`[socket] remote user ${userId} leaved the room`);
    clients.value.delete(userId)
    addToast({ message: `${userId} saiu da reunião`})
    removeAllRemoteStreamsByUser(userId)
    _closeAllConnectionsFromUser(userId)
});


function updateUserInfo(data, remoteStreamId) {
    const remoteStream = remoteStreams.value.find(remoteStream => remoteStream.id == remoteStreamId)
    if(remoteStream) {
        remoteStream.user = data.user
        remoteStream.raisedHand = data.raisedHand
        console.log('UPDATED USER INFO', data, remoteStreamId, remoteStream)
    }
}

function handUp(data, remoteStreamId) {
    const remoteStream = remoteStreams.value.find(remoteStream => remoteStream.id == remoteStreamId)
    if(remoteStream) {
        remoteStream.raisedHand = true
        console.log('HAND UP', data, remoteStreamId, remoteStream)
    }
}

function handDown(data, remoteStreamId) {
    const remoteStream = remoteStreams.value.find(remoteStream => remoteStream.id == remoteStreamId)
    if(remoteStream) {
        remoteStream.raisedHand = false
        console.log('HAND DOWN', data, remoteStreamId, remoteStream)
    }
}

function sharedScreenStopped(data, remoteStreamId) {
    const remoteStream = remoteStreams.value.find(remoteStream => remoteStream.id == remoteStreamId)
    if(remoteStream) {
        console.log('SHARED SCREEN STOPPED, removing remote stream', remoteStreamId, remoteStream, data)
        removeFromRemoteStreams(remoteStream as RemoteStream)
    }
}


function handleStreamControllerEvents(event, remoteStreamId) {
    console.log(`[stream-controller] media stream ${remoteStreamId} received event:`, event)
    switch(event.event) {
        case 'updated-user-info':
            updateUserInfo(event.data, remoteStreamId)
            break
        case 'hand-up':
            handUp(event.data, remoteStreamId)
            break
        case 'hand-down':
            handDown(event.data, remoteStreamId)
            break
        case 'shared-screen-stopped':
            sharedScreenStopped(event.data, remoteStreamId)
            break
    }
}


function connectToNewUser(destUserPeerId, localCamStream) {

    const remoteStreamId = uuidV4()

    const metadata = {
        remoteStreamId,
        remoteStreamType: 'cam',
    }

    const options = {
        metadata
    }

    // call destination peer
    const mediaConnection = call(destUserPeerId, localCamStream, options);
    console.log('EU TO LIGANDO PRA COMPARTILHAR A CAMERA?', mediaConnection)


    // data controller connection
    const streamControllerConnection = connect(destUserPeerId, { metadata })
    if(streamControllerConnection && mediaConnection){
        streamControllerConnection.on('open', () => {
            // receive messages
            streamControllerConnection.on('data', (event) => handleStreamControllerEvents(event, remoteStreamId))
    
            // send messages
            const payload = { event: 'updated-user-info', data: { user: user.value, raisedHand: handIsRaised.value } }
            console.log('sendind UPDATE-USER-INFO data', payload)
            sendDataToRemoteStream(remoteStreamId, payload)
        })



        // add remote stream to array of remote streams
        const remoteStream: RemoteStream = {
            id: remoteStreamId,
            peerId: destUserPeerId,
            mediaChannel: mediaConnection,
            dataChannel: streamControllerConnection,
            type: 'cam',
            visible: true,
        }
        addToRemoteStreams(remoteStream)
    }

}

function connectToShareScreenWithUser(destUserPeerId, localSharedScreemStream) {
    const remoteStreamId = uuidV4()

    const metadata = {
        remoteStreamId,
        remoteStreamType: 'screen-share',
    }

    const options = {
            metadata,
            'constraints': {
                'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true
                },
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1,
             },
             // better audio quality https://stackoverflow.com/questions/74926110/peerjs-how-to-use-sdp-to-improve-audio-quality
             'sdpTransform': (sdpString) => {
                 return sdpString.replace("a=fmtp:111 minptime=10;useinbandfec=1","a=fmtp:111 ptime=5;useinbandfec=1;stereo=1;maxplaybackrate=48000;maxaveragebitrat=128000;sprop-stereo=1");
             }
        }

    // call destination peer
    const mediaConnection = call(destUserPeerId, localSharedScreemStream, options);
    console.log('EU TO LIGANDO PRA COMPARTILHAR A TELA?', mediaConnection?.remoteStream)

    // data controller connection
    const streamControllerConnection = connect(destUserPeerId, { metadata })
    if(streamControllerConnection && mediaConnection){
        streamControllerConnection.on('open', () => {
            // receive messages
            streamControllerConnection.on('data', (event) => handleStreamControllerEvents(event, remoteStreamId))
    
            // send messages
            const payload = { event: 'updated-user-info', data: { user: user.value } }
            sendDataToRemoteStream(remoteStreamId, payload)
        })




        // add remote stream to array of remote streams, mas com a visibilidade desativada
        const remoteStream: RemoteStream = {
            id: remoteStreamId,
            peerId: destUserPeerId,
            mediaChannel: mediaConnection,
            dataChannel: streamControllerConnection,
            type: 'screen-share',
            visible: false,
        }
        addToRemoteStreams(remoteStream)
    }
}

function disconnectSharedScreenWithAllUsers() {
    
    const payload = { event: 'shared-screen-stopped', data: { } }
    sendToAllRemoteStreams(payload, 'screen-share') // TODO deveria esperar todas as conexões receberem o payload antes de serem removidas do array de remoteStreams?

    // remove all remote streams of type screen-share invisible
    for(const remoteStream of remoteStreams.value) {
        if(remoteStream.type == 'screen-share') {
            console.log('PARA REMOVER?', remoteStream)
            removeFromRemoteStreams(remoteStream as RemoteStream)
        }
    }
    // TODO remover all peer connections related to all removed remote streams

}



const settingsModalIsOpen = ref(false)

function openSettingsModal() {
    settingsModalIsOpen.value = true
}

function closeSettingsModal() {
    settingsModalIsOpen.value = false
}

// TODO ao desligar a chamada é preciso garantir que todas as conexões são fechadas, inclusive a de compartilhamento de tela, se houver
function handleLeaveRoom() {
    removeAllRemoteStreamsByUser(userId.value)
    _closeAllConnectionsFromUser(userId.value)
    // TODO should destroy peer?
    // destroy() 
    
    // TODO shoud reset room data when leaving
    room.leaveRoom(userId)
    room.active = false
}

const handIsRaised = ref(false)

function handleRaiseHand() {
    handIsRaised.value = !handIsRaised.value

    // send messages
    const payload = { event: (handIsRaised.value ? 'hand-up' : 'hand-down'), data: {} }
    sendToAllRemoteStreams(payload, 'cam')
}

function handleShareScreen() {
    screenIsSharing.value = !screenIsSharing.value

    // ativar compartilhamento
    if(screenIsSharing.value) {
        // FIX deve dar um jeito de esperar o usuario iniciar o compartilhamento no navegador antes de connectar com os outros usuarios, senão a mediaconnection estará vazia
        setTimeout(() => {
            // TODO deve ter um jeito mais facil de pegar a lista de peerIds e excluir o meu peerIdLocal, usando o usePeer composable
            for (const client of clients.value.values()) {
                if(client.peerId != user.value.peerId) {// o clinente não sou eu mesmo
                    console.log('connectToShareScreenWithUser: ', client.peerId, client.peerId == user.value.peerId ? 'EU' : 'REMOTO');
                    connectToShareScreenWithUser(client.peerId, shareScreenStream.value)
                }
            }
        }, 10000)
    } else { // desativar compartilhamento
            // console.log('DESATIVAR COMPARTILHAMENTO DE TELA')
    }
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
}

.video-wrapper.video-wrapper--cam video {
    object-fit: cover;
}

.video-wrapper.video-wrapper--shared-screen video {
    object-fit: contain;
}

.video-wrapper .top-status-bar {
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    top: 0;
    right: 0;
    padding: 8px;
    color: white;
}

.video-wrapper .bottom-bar {
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    color: white;
}

.top-status-bar .mic-status {
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

.btn-round.active {
    background-color: rgb(162, 187, 247);
    color: rgb(32, 29, 34);
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
  /* background-color: pink; */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 30px;
  margin-bottom: 100px;
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

.local-stream-grid {
    /* background-color: aqua; */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 15px 30px;
}


</style>