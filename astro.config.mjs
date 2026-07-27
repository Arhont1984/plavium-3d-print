// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Временный препрод-домен на GitHub Pages живёт по пути /<repo>/,
// поэтому base подставляется только в CI-сборке для Pages (см. .github/workflows/deploy.yml).
// ЗАМЕНИТЕ site на реальный домен, когда определитесь с хостингом.
const isGhPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: isGhPages ? 'https://<ваш-github-логин>.github.io' : 'https://3dtseh.ru',
  base: isGhPages ? '/site-3d-print' : '/',
  integrations: [sitemap()],
});
