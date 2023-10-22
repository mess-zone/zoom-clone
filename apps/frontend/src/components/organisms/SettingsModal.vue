<template>
    <Modal :isOpen="props.isOpen" @close="close" >
        <template v-slot:title>
            Settings
        </template>
        <div class="config-group">
            <h3>Video</h3>
            <h4>Camera</h4>
            <ul class="select-list">
                <li
                    v-for="camera of cameras"
                    :key="camera.deviceId"
                    class="option"
                    :class="{
                        'active': currentCamera === camera.deviceId,
                    }"
                    @click="currentCamera = camera.deviceId"
                >
                    {{ camera.label }}
                </li>
            </ul>
        </div>
        <div class="config-group">
            <h3>Audio</h3>
            <h4>Microfone</h4>

            <ul class="select-list">
                <li
                    v-for="microfone of microphones"
                    :key="microfone.deviceId"
                    class="option"
                    :class="{
                        'active':
                            currentMicrophone === microfone.deviceId,
                    }"
                    @click="currentMicrophone = microfone.deviceId"
                >
                    {{ microfone.label }}
                </li>
            </ul>
        </div>
    </Modal>
</template>
<script setup lang="ts">
import { useDevices } from "../../composables/useDevices";
import Modal from "../molecules/Modal.vue";

const emit = defineEmits(['close'])

interface Props {
    isOpen: boolean
}

const props = defineProps<Props>()

function close() {
    emit('close')
}

const { 
    currentCamera, 
    currentMicrophone, 
    cameras, 
    microphones,
} = useDevices()

</script>

<style scoped>

/**
Settings modal content

*/

.config-group {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 15px 0;
}

.select-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.select-list li {
    padding: 5px 10px;
    cursor: pointer;
}

.select-list li:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.select-list li.active {
    color: green;
    font-weight: bold;
}
</style>