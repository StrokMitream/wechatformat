import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

function r(path: string) {
  return fileURLToPath(new URL(path, import.meta.url))
}

// https://vite.dev/config/
export default defineConfig({
  base: `./`,
  resolve: {
    alias: [
      { find: `@/`, replacement: `${r(`./src`)}/` },
      // @md/core subpath exports
      { find: /^@md\/core$/, replacement: r(`./vendor/core/src/index.ts`) },
      { find: /^@md\/core\//, replacement: `${r(`./vendor/core/src`)}/` },
      // @md/shared subpath exports
      { find: /^@md\/shared$/, replacement: r(`./vendor/shared/src/index.ts`) },
      { find: /^@md\/shared\//, replacement: `${r(`./vendor/shared/src`)}/` },
    ],
  },
  build: {
    target: `es2020`,
    chunkSizeWarningLimit: 2048,
  },
  plugins: [vue()],
})
