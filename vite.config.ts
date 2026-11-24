import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // SETARA_API_TARGET bisa diisi http://setara-api.test bila pakai virtual host Laragon.
  const env = loadEnv(mode, process.cwd(), "")
  const apiTarget = env.SETARA_API_TARGET || "http://127.0.0.1:8000"
  const proxy = { "/api": { target: apiTarget, changeOrigin: true } }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: { proxy },
    preview: { proxy },
  }
})
