import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      timeout: 120000
    },
    fs: {
      strict: false,
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
  'favicon.ico', 
  'robots.txt'
],
      // ✅ ADD THE MANIFEST CONFIGURATION HERE
     manifest: {
  id: "/",
  name: "SR BOSS",
  short_name: "SR BOSS",
  description: "Play Matka games online - Place bets and win big",
  start_url: "/",
  scope: "/",
  display: "standalone",
  display_override: ["standalone", "browser"],
  orientation: "portrait",
  theme_color: "#3b82f6",
  background_color: "#ffffff",
        icons: [
  {
    src: "icons/launchericon-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any"
  },
  {
    src: "icons/launchericon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any"
  }
],
        screenshots: [
  {
    src: "/screenshots/desktop.png",
    sizes: "1280x720",
    type: "image/png",
    form_factor: "wide"
  },
  {
    src: "/screenshots/mobile.png",
    sizes: "390x844",
    type: "image/png"
  }
],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Home",
            description: "Go to dashboard",
            url: "/dashboard",
            icons: [{ src: "icons/launchericon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Wallet",
            short_name: "Balance",
            description: "Check your balance",
            url: "/wallet",
            icons: [{ src: "icons/launchericon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "History",
            short_name: "Bets",
            description: "View bet history",
            url: "/history",
            icons: [{ src: "icons/launchericon-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^\/offline$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offline-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
  build: {
    sourcemap: true,
    target: 'esnext',
  },
}));