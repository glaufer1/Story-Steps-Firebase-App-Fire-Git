import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'auto',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    //   },
    //   devOptions: {
    //     enabled: true
    //   },
    //   // Correctly point to the source of our service worker
    //   strategies: 'injectManifest',
    //   swSrc: 'src/sw.ts', 
    // })
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 8080,      // Use a common port
    strictPort: true, // Ensure this port is used
    hmr: {
      clientPort: 443 // Use the standard HTTPS port for HMR
    }
  }
})
