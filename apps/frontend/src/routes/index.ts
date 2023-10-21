import HomeViewVue from "../views/HomeView.vue"
import RoomViewVue from "../views/RoomView.vue"
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
    {
        path: '/',
        component: HomeViewVue,
    },
    {
        path: '/:roomId',
        component: RoomViewVue,
    },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

export default router