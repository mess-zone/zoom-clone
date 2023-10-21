<template>
        <div v-if="props.isOpen" class="modal-overlay" @click="closeSettingsModal">
            <div class="modal" @click.stop="">
                <div class="modal-header">
                    <h2>Settings Component</h2>
                    <button class="close-icon" @click="closeSettingsModal">
                        <font-awesome-icon icon="fa-solid fa-xmark" />
                    </button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
            </div>
        </div>
</template>

<script setup lang="ts">

const emit = defineEmits(['close'])

interface Props {
    isOpen: boolean
}

const props = defineProps<Props>()

function closeSettingsModal() {
    emit('close')
}

</script>

<style scoped>

.close-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid transparent;
    padding: 0;
    font-size: 1.5em;
    color:rgba(0, 0, 0, 0.6);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}


.modal-overlay {
    background-color: rgba(0, 0, 0, 0.781);
    position: fixed;
    inset: 0;
    display: grid;
    /* justify-items: center;
    align-items: center; */
    place-items: center;
}

.modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

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