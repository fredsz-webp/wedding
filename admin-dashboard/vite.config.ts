import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap 5174. strictPort: gagal keras kalau bentrok (tidak diam-diam pindah).
  server: { port: 5174, strictPort: true },
  build: {
    // Vendor dipisah jadi chunk sendiri — di-cache browser antar deploy,
    // dan chunk aplikasi jadi kecil (peringatan >500kB hilang).
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});
