<template>
    <div>
        <button @click="handleNewRoom">new room</button>
    </div>
</template>

<script setup lang="ts">
import { useRoomStore } from '../stores/useRoomStore'

const { room } = useRoomStore()

async function handleNewRoom() {
    await room.setRoomId()
    room.active = true
}

</script>

<style scoped>
</style>
