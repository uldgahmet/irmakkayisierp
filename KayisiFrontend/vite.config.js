import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs (0.0.0.0) so phones can connect
    proxy: {
      '/api': 'http://localhost:5054',
      '/images': 'http://localhost:5054'
    }
  }
})
