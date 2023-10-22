import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import FontAwesomeIcon from "./config/fontAwesome";

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
