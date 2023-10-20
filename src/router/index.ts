import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import RoomView from '../views/Room.vue'

const routes = [
    {
        path: '/',
        component: HomeView,
    },
    {
        path: '/:room',
        component: RoomView,
    },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

export default router