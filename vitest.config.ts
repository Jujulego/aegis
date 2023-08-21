import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { swc } from 'rollup-plugin-swc3';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    cache: { dir: '.vitest' },
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'lcovonly'],
    },
    globals: true,
    typecheck: {
      tsconfig: 'tests/tsconfig.json',
    }
  },
  plugins: [
    swc({
      jsc: {
        target: 'esnext',
        parser: {
          syntax: 'typescript'
        },
        baseUrl: dirname(fileURLToPath(import.meta.url)),
        paths: {
          '@/src/*': ['./src/*']
        }
      },
      module: {
        type: 'es6'
      }
    })
  ]
});
