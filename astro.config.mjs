// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { cspIntegration } from './src/lib/csp.mjs';

// API de reservas de Bichitech (opcional): su origen debe estar en connect-src de la CSP.
// Se lee del entorno del proceso (CI o la línea de comandos), igual que import.meta.env en la página.
const bookingApiOrigin = process.env.PUBLIC_BOOKING_API ? new URL(process.env.PUBLIC_BOOKING_API).origin : null;

// `lastmod` del sitemap: actualízalo junto con CONTENT_UPDATED (src/lib/schema.ts) al cambiar textos.
export default defineConfig({
  site: 'https://cljuarez97.github.io',
  base: '/alaria-landing',
  trailingSlash: 'always',
  integrations: [sitemap({ lastmod: new Date('2026-11-06'), filter: (page) => !/\/(offline|404|resultados)\/?$/.test(page) }), cspIntegration({ connect: bookingApiOrigin ? [bookingApiOrigin] : [] })],
  vite: {
    plugins: [tailwindcss()],
    // Scripts siempre en archivo: los inline cambiarían de hash en cada despliegue y una pestaña
    // abierta, que conserva la CSP anterior al navegar con el ClientRouter, los bloquearía.
    build: { assetsInlineLimit: 0 },
  },
});
