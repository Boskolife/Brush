import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public', 'images');
const extensions = /\.(png|jpe?g)$/i;

function walkDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (extensions.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export async function convertFile(inputPath: string): Promise<void> {
  const parsed = path.parse(inputPath);
  const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
  await sharp(inputPath)
    .webp({ quality: 90 })
    .toFile(webpPath);
  console.log(
    `[convertToWebp] ${path.relative(publicDir, inputPath)} -> ${path.relative(
      publicDir,
      webpPath,
    )}`,
  );
}

export async function run(): Promise<void> {
  const files = walkDir(publicDir);
  if (files.length === 0) {
    console.log('[convertToWebp] No PNG/JPEG files found in public/');
    return;
  }
  for (const file of files) {
    try {
      await convertFile(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[convertToWebp] Error converting ${file}:`, message);
    }
  }
}

function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): (...args: T) => void {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: T) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export function startWatch(): void {
  if (!fs.existsSync(publicDir)) {
    console.log('[convertToWebp] public/ not found, skipping watch');
    return;
  }
  const convertDebounced = debounce(async (fullPath: string) => {
    if (!extensions.test(fullPath)) return;
    try {
      await convertFile(fullPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[convertToWebp] Error converting ${fullPath}:`, message);
    }
  }, 300);

  fs.watch(publicDir, { recursive: true }, (event, filename) => {
    if (!filename) return;
    const fullPath = path.join(publicDir, filename);
    if (!extensions.test(filename)) return;
    convertDebounced(fullPath);
  });

  console.log(
    '[convertToWebp] Watching public/ for new or changed images...',
  );
}

function isMainModule(): boolean {
  try {
    const scriptPath = fileURLToPath(import.meta.url);
    const entry = process.argv[1];
    if (!entry) {
      return false;
    }
    return path.resolve(entry) === path.resolve(scriptPath);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  if (process.argv.includes('--watch')) {
    run().then(startWatch);
  } else {
    void run();
  }
}

