import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap 5177 (pria=5173, wanita=5176, admin=5174/5175). strictPort: gagal keras kalau bentrok.
  server: { port: 5177, strictPort: true },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
