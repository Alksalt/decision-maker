import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/decision-maker/' : '/',
  test: {
    environment: 'node',
    globals: true,
  },
}));
