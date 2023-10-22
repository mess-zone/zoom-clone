import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
});

const URL: string = import.meta.env.VITE_SERVER_URL
export const socket = io(URL);
console.log('SOCKET SERVER URL', URL)

socket.on("connect", () => {
  state.connected = true;
  console.log('socket connected')
});

socket.on("disconnect", () => {
  state.connected = false;
  console.log('socket connected')
});
