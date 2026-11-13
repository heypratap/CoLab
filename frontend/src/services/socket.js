import { io } from "socket.io-client";

const host = typeof window !== "undefined" && window.location.hostname
  ? window.location.hostname
  : "localhost";

export const socket = io(`http://${host}:5000`, {
  autoConnect: false,
});
