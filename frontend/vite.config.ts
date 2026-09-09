/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// In development the Spring api runs on :8080 and Vite proxies the paths it
// owns. changeOrigin stays false on purpose: Spring builds the OAuth2 redirect
// URI from the Host header, and the browser-facing host is localhost:5173.
const backend = 'http://localhost:8080'
const backendPaths = ['/api', '/oauth2', '/login', '/logout', '/ws']

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // an external registerSW.js keeps the CSP at script-src 'self'
      injectRegister: 'script-defer',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Ours',
        short_name: 'Ours',
        description: 'Our memories, plans, and days.',
        // paper; the app swaps the theme-color meta to ink (#121110) in dark mode
        theme_color: '#faf9f6',
        background_color: '#faf9f6',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // The service worker must never answer for the api or the OAuth2
        // redirects; those always go to the network.
        navigateFallbackDenylist: backendPaths.map((p) => new RegExp(`^${p}`)),
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      backendPaths.map((p) => [p, { target: backend, changeOrigin: false, ws: p === '/ws' }]),
    ),
  },
  // Unit tests for the pure modules (data/planViews, data/dates): `npm test`.
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
