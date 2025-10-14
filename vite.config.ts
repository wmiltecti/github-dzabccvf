import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'), // <-- habilita import '@/...'
    },
  },
  optimizeDeps: {
    // manter seu exclude
    exclude: ['lucide-react'],
    // turf modular pré-empacotado p/ dev
    include: ['@turf/buffer', '@turf/helpers', '@turf/difference', '@turf/area', '@turf/length'],
  },
})
