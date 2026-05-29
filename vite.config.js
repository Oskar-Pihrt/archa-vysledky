import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// `base` is set at build time for GitHub Pages (e.g. "/repo-name/").
// Locally it stays "/". Override with: VITE_BASE=/repo-name/ npm run build
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE || '/',
})
