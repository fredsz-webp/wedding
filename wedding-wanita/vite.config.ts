import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap 5176 (bukan 5174/5175 agar tak bentrok dengan admin). strictPort: gagal keras kalau bentrok.
  server: { port: 5176, strictPort: true },
  optimizeDeps: {
    exclude: ['lucide-react'],

  },
});
