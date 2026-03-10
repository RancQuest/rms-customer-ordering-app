import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3001,
    proxy: {
      // Proxy /api to YARP gateway (rms-aspnetcore-microservices). Gateway routes:
      // /api/restaurants/* -> Restaurant Management, /api/menu/* -> Menu Management.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
