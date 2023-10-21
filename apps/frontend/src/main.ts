import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import FontAwesomeIcon from "./config/font-awesome";

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
