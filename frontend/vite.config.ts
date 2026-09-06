import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3042,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3041',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3041',
        ws: true,
      },
    },
  },
  build: {
    emptyOutDir: false,
  },
});
