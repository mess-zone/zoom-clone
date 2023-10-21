import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

const URL: string = import.meta.env.VITE_SERVER_URL
console.log('SERVER URL', URL)
export const socket = io(URL);

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on('user-connected', (userId) => {
    console.log('user-connected', userId)
})

socket.on('user-disconnected', (userId) => {
    console.log('user-disconnected', userId)
})

socket.on("foo", (...args) => {
    // @ts-ignore
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
    // @ts-ignore
  state.barEvents.push(args);
});