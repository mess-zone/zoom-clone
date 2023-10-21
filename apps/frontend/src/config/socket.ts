import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

const URL: string = import.meta.env.VITE_SERVER_URL

export const socket = io(URL);

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("foo", (...args) => {
    // @ts-ignore
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
    // @ts-ignore
  state.barEvents.push(args);
});