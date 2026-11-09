import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Forward API calls to the ASP.NET Core backend during development.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5007',
        changeOrigin: true,
      },
    },
  },
})
