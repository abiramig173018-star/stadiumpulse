import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In dev, requests to /api/* are proxied to `vercel dev` (or a local
      // stub) once the serverless functions exist. No backend yet — this is
      // just wired up so Step 4+ can plug straight in.
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
})
