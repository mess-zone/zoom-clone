<template>
    <div>
        <button @click="handleNewRoom">new room</button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { serverAPI } from '../config/axios'

const router = useRouter()

async function handleNewRoom() {
    try {
        const roomId = await createRoomId()
        console.log('created roomId', roomId)
        router.push({
            name: 'room',
            params: {
                roomId,
            }
        })
    } catch (error) {
        console.error(error);
    }
}

async function createRoomId() {
  try {
    const response = await serverAPI.get('/room');
    return response.data.roomId
  } catch (error) {
    console.error(error);
  }
}

</script>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
