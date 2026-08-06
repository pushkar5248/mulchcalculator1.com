// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.mulchcalculator1.com',
  integrations: [react(), sitemap()],
  output: 'static',
  adapter: cloudflare(),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "fr", "hi", "ru", "it", "de"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});