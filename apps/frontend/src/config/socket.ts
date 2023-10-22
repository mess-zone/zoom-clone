import { reactive } from "vue";
import { io } from "socket.io-client";

// TODO rename to roomState
export const state = reactive({
  connected: false,
  users: {},
  fooEvents: [],
  barEvents: []
});

const URL: string = import.meta.env.VITE_SERVER_URL
export const socket = io(URL);
console.log('SERVER URL', URL)

socket.on("connect", () => {
  state.connected = true;
  console.log('socket connected')
});

socket.on("disconnect", () => {
  state.connected = false;
  console.log('socket connected')
});




// TODO rename to user-joined-room
socket.on('user-connected', (userId) => {
    console.log('user-connected', userId)
    state.users[userId] = true
})

// TODO rename to user-leaved-room
socket.on('user-disconnected', (userId) => {
    console.log('user-disconnected', userId)
    state.users[userId] = false
})

socket.on("foo", (...args) => {
    // @ts-ignore
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
    // @ts-ignore
  state.barEvents.push(args);
});