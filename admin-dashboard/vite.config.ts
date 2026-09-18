import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap 5174. strictPort: gagal keras kalau bentrok (tidak diam-diam pindah).
  server: { port: 5174, strictPort: true },
});
