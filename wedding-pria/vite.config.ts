import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap 5173. strictPort: gagal keras kalau bentrok (tidak diam-diam pindah).
  server: { port: 5173, strictPort: true },
  optimizeDeps: {
    exclude: ['lucide-react'],

  },
});
