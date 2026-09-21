import { build } from 'vite';
import { resolve } from 'path';

async function run() {
  await build({
    build: {
      ssr: 'scripts/test_engine.ts',
      outDir: 'scripts/dist_test',
      rollupOptions: {
        output: {
          entryFileNames: 'test_bundle.mjs',
          format: 'es'
        }
      }
    }
  });
}

run();
