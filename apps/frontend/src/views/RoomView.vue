<template>
    <h1>room</h1>
    <p>connected: {{ connected }}</p>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { state, socket } from "../config/socket";

const connected = computed(()=> state.connected)

function connect() {
    socket.connect();
}

function disconnect() {
    socket.disconnect();
}
</script>