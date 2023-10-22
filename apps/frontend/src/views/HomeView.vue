<template>
    <div>
        <button @click="handleNewRoom">new room</button>
        <!-- {{ room.rId }} -->
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRoomStore } from '../stores/useRoomStore'
import { watch } from 'vue';

const router = useRouter() 

const { room } = useRoomStore()

function handleNewRoom() {
    room.setRoomId()
}

watch(() => room.rId, () => {
    console.log('NEWWWW', room.rId)
    if(room.rId) {
        console.log('handle new room', room.rId)
        router.push({
            name: 'room',
            params: {
                roomId: room.rId,
            }
        })
    }
})

</script>

<style scoped>
</style>
