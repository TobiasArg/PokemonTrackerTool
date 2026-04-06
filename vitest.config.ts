import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
  },
})
