// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // base: '/' ensures asset paths are absolute after build (required for Vercel)
  base: '/',

  server: {
    port: 3000, // Frontend dev server on 3000
    proxy: {
      // All /api/* requests from the browser are forwarded to the backend.
      // This avoids CORS issues and keeps the backend URL out of the browser.
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});