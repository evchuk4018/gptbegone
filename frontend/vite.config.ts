import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/workout-192.png", "icons/workout-512.png", "icons/workout-maskable-192.png", "icons/workout-maskable-512.png"],
      manifest: {
        name: "Workout Ledger",
        short_name: "Workout",
        description: "Mobile-first workout tracking for sessions, progress, templates, and bodyweight logs.",
        start_url: "/workout",
        scope: "/",
        display: "standalone",
        theme_color: "#05080d",
        background_color: "#05080d",
        icons: [
          {
            src: "/icons/workout-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/workout-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/workout-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/workout-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) => url.pathname.startsWith("/api/workout/") && request.method === "GET",
            handler: "NetworkFirst",
            options: {
              cacheName: "workout-get-cache",
              networkTimeoutSeconds: 4,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url, request }) => url.pathname.startsWith("/api/workout/") && request.method !== "GET",
            handler: "NetworkOnly"
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
