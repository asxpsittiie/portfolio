import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    // This allows Astro to handle 3D model files properly
    assetsInclude: ['**/*.glb']
  }
});