<template>
    <div class="stream-preview">
        <video ref="video" autoplay muted></video>
        <div class="bottom-bar">
            {{ remoteStream.user?.name }} {{ remoteStream.user?.color }}
            <font-awesome-icon icon="fa-regular fa-hand" v-if="!!remoteStream.raisedHand"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DataConnection, MediaConnection } from 'peerjs';
import { ref, watchEffect } from 'vue';

// TODO duplicated definition
interface RemoteStream {
    id: string,
    peerId: string,
    mediaChannel: MediaConnection | null,
    dataChannel: DataConnection | null,
    type: 'cam',

    user?: {
        name: string,
        color: string,
    },
    raisedHand: boolean,
}

const props = defineProps<{
    remoteStream: RemoteStream,
    // FIX o video só é exibido se passar o mediaStream separado como prop, tem algo errado com a reatividade do remoteStream prop
    mediaStream: MediaStream,
}>()

// TODO show mic and cam status

const video = ref<HTMLVideoElement>()


watchEffect(() => {
    if(video.value) {
        video.value.srcObject = props.mediaStream
    }
})


</script>

<style scoped>

.stream-preview {
    background-color: rgb(50, 50, 50);
    width: 640px;
    height: 480px;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
}

.stream-preview video {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    object-fit: cover;
}

.bottom-bar {
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    color: white;
}
</style>