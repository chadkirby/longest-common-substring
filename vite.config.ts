import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'index.ts',
      name: 'longestCommonSubstring',
      fileName: 'lcs',
      formats: ['es']
    },
    outDir: 'dist'
  }
});
