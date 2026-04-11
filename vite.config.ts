import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

const geojsonPlugin: Plugin = {
  name: 'geojson',
  transform(code, id) {
    if (id.endsWith('.geojson')) {
      return { code: `export default ${code}`, map: null };
    }
  },
};

export default defineConfig({ plugins: [tailwindcss(), sveltekit(), geojsonPlugin] });
