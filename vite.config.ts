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
      includeAssets: [
        'favicon.ico', 
        'robots.txt', 
        'icons/launchericon-48x48.png',
        'icons/launchericon-72x72.png',
        'icons/launchericon-96x96.png',
        'icons/launchericon-144x144.png',
        'icons/launchericon-192x192.png',
        'icons/launchericon-512x512.png'
      ],
      // ✅ ADD THE MANIFEST CONFIGURATION HERE
      manifest: {
        name: "SR BOSS",
        short_name: "SR BOSS",
        description: "Play Matka games online - Place bets and win big",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        icons: [
          {
            src: "icons/launchericon-48x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/launchericon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/launchericon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/launchericon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/launchericon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Home",
            description: "Go to dashboard",
            url: "/dashboard",
            icons: [{ src: "icons/launchericon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "Wallet",
            short_name: "Balance",
            description: "Check your balance",
            url: "/wallet",
            icons: [{ src: "icons/launchericon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "History",
            short_name: "Bets",
            description: "View bet history",
            url: "/history",
            icons: [{ src: "icons/launchericon-96x96.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: null,
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