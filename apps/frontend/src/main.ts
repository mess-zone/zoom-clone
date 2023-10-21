import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faEllipsisVertical, faXmark, faPhone } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faEllipsisVertical, faXmark, faPhone)

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
