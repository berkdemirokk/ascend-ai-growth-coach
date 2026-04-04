import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('motion')) return 'motion';
            if (id.includes('react-markdown')) return 'markdown';
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled by the local environment when file watching is unstable.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
