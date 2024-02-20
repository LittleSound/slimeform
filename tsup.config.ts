import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    resolvers: 'packages/resolvers/index.ts',
  },
  format: [
    'esm',
    'cjs',
  ],
  dts: {
    resolve: true,
  },
  splitting: true,
  clean: true,
  shims: true,
})
