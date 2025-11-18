import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    sourcemap: true, // Enable source maps for production builds
  },
  // Source maps are enabled by default in dev mode
})
