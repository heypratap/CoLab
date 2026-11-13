import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { fileURLToPath } from "node:url";
export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "monaco-editor/esm/vs/editor/editor.api.js": fileURLToPath(
        new URL(
          "./node_modules/monaco-editor/esm/vs/editor/editor.api.js",
          import.meta.url
        )
      ),
    },
  },
})

