import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'notification.mp3'],
      manifest: {
        name: 'Happy Provision Store',
        short_name: 'Happy Store',
        description: 'Order groceries from Happy Provision Store, Deoband',
        theme_color: '#0D9488',
        background_color: '#FFFBF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,mp3}'],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
      '/uploads': 'http://localhost:8081',
    },
  },
});
