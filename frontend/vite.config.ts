import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev only: forward /api/* to the backend, so the browser sees one origin
    // (same as production, where Express serves both the app and the API)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
