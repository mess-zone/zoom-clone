<template>
    <div class="stream-preview">
        <video ref="video" autoplay muted></video>
        <div class="front">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
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