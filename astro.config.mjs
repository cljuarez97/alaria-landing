// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { cspIntegration } from './src/lib/csp.mjs';

export default defineConfig({
  site: 'https://cljuarez97.github.io',
  base: '/alaria-landing',
  trailingSlash: 'always',
  integrations: [sitemap({ lastmod: new Date(), filter: (page) => !/\/(offline|404|resultados)\/?$/.test(page) }), cspIntegration()],
  vite: {
    plugins: [tailwindcss()],
    // Scripts siempre en archivo: los inline cambiarían de hash en cada despliegue y una pestaña
    // abierta, que conserva la CSP anterior al navegar con el ClientRouter, los bloquearía.
    build: { assetsInlineLimit: 0 },
  },
});
