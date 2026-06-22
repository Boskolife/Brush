import { resolve } from 'path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { htmlFiles } from './getHTMLFileNames';
import {
  run as runWebpConversion,
  startWatch as startWebpWatch,
} from './scripts/convertToWebp';
import { pictureHelper } from './scripts/pictureHelper';

function toAbsPath(pathFromRepoRoot: string): string {
  return fileURLToPath(new URL(pathFromRepoRoot, import.meta.url));
}

function loadJson(pathFromRepoRoot: string): unknown {
  return JSON.parse(readFileSync(toAbsPath(pathFromRepoRoot), 'utf8')) as unknown;
}

function loadJsonIfExists(pathFromRepoRoot: string): unknown {
  const absPath = toAbsPath(pathFromRepoRoot);
  if (!existsSync(absPath)) return {};
  return JSON.parse(readFileSync(absPath, 'utf8')) as unknown;
}

function pageJsonPath(pagePath: string): string | null {
  const fileName = pagePath.split('/').pop();
  if (!fileName || !fileName.endsWith('.html')) return null;
  const pageName = fileName.slice(0, -'.html'.length);
  return `./src/data/${pageName}.json`;
}

const input: Record<string, string> = {
  main: resolve(__dirname, 'src/index.html'),
};

htmlFiles.forEach((file) => {
  input[file.replace('.html', '')] = resolve(__dirname, 'src', file);
});

const webpPlugin = (): Plugin => ({
  name: 'webp-convert',
  async buildStart() {
    await runWebpConversion();
  },
  configureServer() {
    startWebpWatch();
  },
});

const handlebarsReloadPlugin = (): Plugin => ({
  name: 'handlebars-reload',
  handleHotUpdate({ file, server }) {
      const normalizedPath = file.replace(/\\/g, '/');

      if (
        normalizedPath.includes('/templates/') ||
        normalizedPath.includes('/sections/') ||
        normalizedPath.includes('/data/')
      ) {
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
        return [];
      }

      return [];
    },
  configureServer(server: ViteDevServer) {
    const templatesDir = resolve(__dirname, 'src/templates');
    const sectionsDir = resolve(__dirname, 'src/sections');
    const dataDir = resolve(__dirname, 'src/data');

    server.watcher.add([templatesDir, sectionsDir, dataDir]);
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableWebpConvert = env.VITE_WEBP_CONVERT !== 'false';

  return {
    base: './',
    root: 'src',
    publicDir: '../public',
    plugins: [
      handlebars({
        partialDirectory: [
          resolve(__dirname, 'src/templates'),
          resolve(__dirname, 'src/sections'),
        ],
        reloadOnPartialChange: true,
        context(pagePath) {
          const site = loadJson('./src/data/site.json');
          const jsonPath = pageJsonPath(pagePath);
          const page = jsonPath ? loadJsonIfExists(jsonPath) : {};

          return {
            site,
            page,
          };
        },
        helpers: {
          picture: pictureHelper,
          year: () => String(new Date().getFullYear()),
          upper: (value: unknown) => String(value ?? '').toUpperCase(),
          array: function (...args: unknown[]) {
            const items = args.slice(0, -1);
            return items;
          },
          object: function (...args: unknown[]) {
            const options = args[args.length - 1] as { hash?: Record<string, unknown> };
            return options.hash || {};
          },
        },
      }),
      handlebarsReloadPlugin(),
      ...(enableWebpConvert ? [webpPlugin()] : []),
    ],
    build: {
      rollupOptions: {
        input,
      },
      outDir: '../dist/',
      emptyOutDir: true,
    },
    server: {
      host: true,
      open: true,
    },
  };
});

