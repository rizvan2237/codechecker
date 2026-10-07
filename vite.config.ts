import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite settings. Keep this file small; most app settings live in src/config.
export default defineConfig({
  plugins: [react()],
});
