import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '3005'),
    host: '0.0.0.0', // Importante para Render
    // Allow Vite to use the next available port when the preferred dev port is busy.
    strictPort: false,
    allowedHosts: true
  },
  preview: {
    port: parseInt(process.env.PORT || '3005'),
    host: '0.0.0.0', // Importante para Render
    strictPort: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist'
  }
})
