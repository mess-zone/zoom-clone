<template>
    <div class="stream-preview">
        <video ref="video" autoplay muted></video>
        <div class="front">
            {{ remoteUser.name }} {{ remoteUser.color }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { MediaConnection } from 'peerjs';
import { ref, watchEffect } from 'vue';

const props = defineProps<{
  mediaConnection: MediaConnection,
  remoteStream: MediaStream,
  localPeerId: string | undefined,
}>()

const video = ref<HTMLVideoElement>()

const metadata = ref(props.mediaConnection?.metadata)

const remoteUser = ref()

watchEffect(() => {
    if(video.value) {
        video.value.srcObject = props.remoteStream
    }

    if(props.localPeerId) {
        remoteUser.value = metadata.value.users.find(u => u.peerId !== props.localPeerId)
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

.front {
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    color: white;
}
</style>