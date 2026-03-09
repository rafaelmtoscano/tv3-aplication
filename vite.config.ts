import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      // More tolerant reconnection for cloud proxy environments
      timeout: 5000,
      overlay: true,
    },
  },
});
