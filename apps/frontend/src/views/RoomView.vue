<template>
    <h1>room</h1>
    <p>connected: {{ connected }}</p>
    <button @click="joinRoom()">join-room</button>
    <br>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { state, socket } from "../config/socket";
import { useRoute } from "vue-router";

const route = useRoute()

const connected = computed(()=> state.connected)

function connect() {
    socket.connect();
}

function disconnect() {
    socket.disconnect();
}

function joinRoom() {
    const roomId = route.params.roomId
    // TODO
    const userId = 'FAKE-USER-ID'
    console.log('emit ', roomId, userId)
    socket.emit('join-room', roomId, userId)
}
</script>