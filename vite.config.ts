import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure axios is pre-bundled and aliased to a browser-friendly ESM build
  optimizeDeps: {
    include: ['axios'],
  },
  // Do not deep-alias axios (package `exports` blocks deep imports).
  // Let Vite resolve `axios` normally, but pre-bundle it for the dev/build step.
  build: {
    rollupOptions: {
      // Keep default behaviour, but adding this comment in case externalization is needed later
      // external: []
    },
  },
})
