import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api-deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-deepseek/, '')
      }
    }
  },
  build: { outDir: "dist", sourcemap: true }
})
