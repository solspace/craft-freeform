import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vitest-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
