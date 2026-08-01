import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fabricadetrecos.com.br',
  output: 'static',
  integrations: [sitemap()],
  build: {
    // um CSS por página em vez de um bundle único: cada página só baixa o que usa
    inlineStylesheets: 'auto',
  },
  image: {
    // gera webp/avif responsivos em tempo de build
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
