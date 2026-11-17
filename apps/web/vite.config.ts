import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolveSeo } from './src/seo/core.js';
import { transformIndexHtml, renderPageBody } from './src/seo/html.js';

/**
 * Renders the homepage's SEO tags, site-wide structured data and crawlable
 * fallback markup into index.html (dev + build). Every other route is rendered
 * from the built index.html by scripts/seo-postbuild.mjs.
 */
function seoPlugin(): Plugin {
  return {
    name: 'sicoin-seo',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return transformIndexHtml(html, resolveSeo('/'), renderPageBody('/'), process.env);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sicoin/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks cache well across deploys. Heavy, page-specific
        // libraries (three, recharts) are intentionally NOT listed so they stay
        // in the lazily loaded route chunks that use them.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
        },
      },
    },
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
