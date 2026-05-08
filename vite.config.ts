import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: true,
    fs: {
      allow: ['..', '../../..', '../../../..'],
    },
  },
  optimizeDeps: {
    include: ['sql.js']
  },
  build: {
    rollupOptions: {
      external: [/\.sqlite$/]
    }
  },
  assetsInclude: ['**/*.db']
});
