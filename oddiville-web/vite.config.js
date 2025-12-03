import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'custom_library': path.resolve(__dirname, 'custom_library'),
    },
  },
  server: {
    allowedHosts: [
      '4a89-49-43-6-241.ngrok-free.app'
    ]
  }
})
