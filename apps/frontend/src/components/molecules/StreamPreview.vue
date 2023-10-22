<template>
    <div class="stream-preview">
        <div class="front">
            <slot ></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>

.stream-preview {
    background-color: aqua;
    background-color: rgb(50, 50, 50);
    width: 640px;
    height: 480px;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
}

.front {
    position: absolute;
    bottom: 0;
    left: 0;
    color: white;
}
</style>