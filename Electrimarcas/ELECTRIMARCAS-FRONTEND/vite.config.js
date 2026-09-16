import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // opcional:
        // rewrite: (path) => path.replace(/^\/api/, '')
        // secure: false,
      }
    }
  }
})
