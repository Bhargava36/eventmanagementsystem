import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'three': path.resolve(__dirname, './node_modules/three'),
    },
    dedupe: ['three'],
  },
  optimizeDeps: {
    include: [
      'react-icons/gi',
      'react-icons/lu',
      'lucide-react',
      'qrcode',
      'qrcode.react',
      'jspdf'
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://emsapi.aitamsac.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
