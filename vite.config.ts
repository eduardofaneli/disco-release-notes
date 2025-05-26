import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Base configurável para GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' || process.env.BASE_URL ? '/disco-release-notes/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
})
