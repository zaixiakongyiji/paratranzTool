import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://paratranz.cn',
        changeOrigin: true,
      }
    }
  }
});
