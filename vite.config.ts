import { resolve } from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { htmlFiles } from './getHTMLFileNames';
import {
  run as runWebpConversion,
  startWatch as startWebpWatch,
} from './scripts/convertToWebp';
import { pictureHelper } from './scripts/pictureHelper';

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
      normalizedPath.includes('/popups/')
    ) {
      server.ws.send({
        type: 'full-reload',
        path: '*',
      });
      return [];
    }
  },
  configureServer(server: ViteDevServer) {
    const templatesDir = resolve(__dirname, 'src/templates');
    const sectionsDir = resolve(__dirname, 'src/sections');
    const popupsDir = resolve(__dirname, 'src/popups');

    server.watcher.add([templatesDir, sectionsDir, popupsDir]);
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
          resolve(__dirname, 'src/popups'),
        ],
        reloadOnPartialChange: true,
        helpers: {
          picture: pictureHelper,
          year: () => String(new Date().getFullYear()),
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

