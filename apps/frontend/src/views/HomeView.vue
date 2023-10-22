<template>
    <div>
        <button @click="handleNewRoom">new room</button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { socket } from '../config/socket';

const router = useRouter()

async function handleNewRoom() {
    try {
        const response = await socket.emitWithAck('create-meeting')
        console.log('CREATING MEETING RESPONSE', response)

        const roomId = response.roomId
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

</script>

<style scoped>
</style>
