import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://shreshtha-mak.github.io/wedding-os/ (a GitHub Pages
  // project site), so every asset/route must be prefixed with the repo name.
  base: '/wedding-os/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Wedding OS',
        short_name: 'Wedding OS',
        description: 'Private family wedding command centre',
        // Placeholder brand color — swap once visual design is decided (spec §43).
        theme_color: '#b76e79',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/wedding-os/',
        scope: '/wedding-os/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App is behind auth and shows live data — cache the shell only,
        // never API responses, so users always see current data when online.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
