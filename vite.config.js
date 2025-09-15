import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚡ Важно: base ставим './', чтобы пути к ресурсам работали и в деве, и в Electron
export default defineConfig({
  base: './',
  plugins: [react()],
})
