<template>
    <div class="stream-preview">
        <video ref="video" autoplay muted></video>
        <div class="front">
            {{ props.mediaConnection?.type }}
            {{ props.mediaConnection?.connectionId }}
            id: {{ props.mediaConnection?.remoteStream?.id }}
            remoteStream: {{ props.remoteStream?.id }}
            active: {{ props.remoteStream?.active }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { MediaConnection } from 'peerjs';
import { ref, watch } from 'vue';

const props = defineProps<{
  mediaConnection: MediaConnection,
  remoteStream: MediaStream,
}>()

const video = ref<HTMLVideoElement>()

watch(() => props.remoteStream, () => {
    console.log('WATCH remote stream changed', props.remoteStream)
    if(video.value) {
        video.value.srcObject = props.remoteStream
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
    position: absolute;
    bottom: 0;
    left: 0;
    color: white;
}
</style>