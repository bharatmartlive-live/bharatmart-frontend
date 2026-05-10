import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const allowedHosts = [
  process.env.RENDER_EXTERNAL_HOSTNAME,
  ...(process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
].filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts
  },
  preview: {
    host: true,
    allowedHosts
  }
});
