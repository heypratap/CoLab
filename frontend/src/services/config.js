const backendUrl = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5002"
).replace(/\/+$/, "");

const parsedUrl = new URL(backendUrl);

export const API_URL = backendUrl;

export const SOCKET_URL = backendUrl;

export const YJS_URL = `${parsedUrl.protocol === "https:" ? "wss:" : "ws:"}//${parsedUrl.host}/yjs`;
