import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const NOSCRIPT_MARKER_REGEX = /<!--\s*META_PIXEL_NOSCRIPT_START\s*-->[\s\S]*?<!--\s*META_PIXEL_NOSCRIPT_END\s*-->/;

const metaPixelNoscriptPlugin = (metaPixelId?: string): Plugin => ({
  name: 'meta-pixel-noscript',
  transformIndexHtml(html) {
    if (!metaPixelId) {
      return html.replace(NOSCRIPT_MARKER_REGEX, '');
    }

    const safeId = encodeURIComponent(metaPixelId);
    return html.replaceAll('__META_PIXEL_ID__', safeId);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const metaPixelId = env.VITE_META_PIXEL_ID?.trim();

  return {
    plugins: [react(), metaPixelNoscriptPlugin(metaPixelId)],
    build: {
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'lucide': ['lucide-react'],
          },
        },
      },
    },
  };
});
