// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://cljuarez97.github.io',
  base: '/alaria-landing',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/(offline|404)\/?$/.test(page) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
