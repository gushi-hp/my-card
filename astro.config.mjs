import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yourname.dev',
  output: 'static',
  devToolbar: { enabled: false },
  prefetch: {
    defaultStrategy: 'hover',
  },
});
