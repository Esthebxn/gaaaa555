import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.PORT || '3002'),
    host: '0.0.0.0', // Importante para Render
    strictPort: true,
    allowedHosts: true
  },
  preview: {
    port: parseInt(process.env.PORT || '3002'),
    host: '0.0.0.0', // Importante para Render
    strictPort: true,
    allowedHosts: true
  },
  resolve: {
    alias: {
      // Puedes agregar aliases si es necesario
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-icons'],
          utils: ['axios', 'hls.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}) 
