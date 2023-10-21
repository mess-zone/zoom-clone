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
</style>
