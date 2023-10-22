<template>
    <TransitionGroup name="list" tag="div" class="toast-container">
        <div class="toast" v-for="toast in toasts" :key="toast.id">
            {{ toast.message }}
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { useToasts } from '../../composables/useToasts'

const { toasts } = useToasts()

</script>

<style scoped>
.toast-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.toast {
    display: inline-block;
    background-color: rgb(53, 56, 60);
    color: rgb(167, 169, 172);
    padding: 15px 20px;
    border-radius: 5px;
    font-size: .8em;
    font-weight: bold;
    margin: 10px 0;
}

/**
Toast transitions
*/

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>