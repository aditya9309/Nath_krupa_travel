import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Disable Vite's dev error overlay so it doesn't apply a global backdrop.
    // The app can implement an overlay scoped to the Login page if needed.
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
})
