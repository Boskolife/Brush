import Handlebars from 'handlebars';

type PictureSource = {
  media?: string;
  srcset?: string;
  src?: string;
  type?: string;
};

type PictureHelperHash = {
  alt?: string;
  class?: string;
  loading?: string;
  width?: number | string;
  height?: number | string;
  sources?: PictureSource[];
};

type HandlebarsRuntimeOptions = {
  hash?: PictureHelperHash;
};

function isHandlebarsOptions(value: unknown): value is HandlebarsRuntimeOptions {
  return Boolean(value && typeof value === 'object' && 'hash' in (value as object));
}

/**
 * Renders <picture> with WebP source and PNG/JPEG fallback.
 *
 * Supports:
 * - {{picture "/img/hero.jpg" alt="Hero" class="hero-image"}}
 * - {{picture "/img/hero.jpg" "Hero" class="hero-image"}}
 */
export function pictureHelper(
  pathOrSrc: unknown,
  altOrOptions?: unknown,
  maybeOptions?: unknown,
): Handlebars.SafeString {
  const src = typeof pathOrSrc === 'string' ? pathOrSrc : '';

  const options = isHandlebarsOptions(altOrOptions)
    ? altOrOptions
    : isHandlebarsOptions(maybeOptions)
      ? maybeOptions
      : undefined;

  const positionalAlt =
    typeof altOrOptions === 'string' && !isHandlebarsOptions(altOrOptions)
      ? altOrOptions
      : undefined;

  const hash = options?.hash || {};
  const alt =
    hash.alt != null ? String(hash.alt) : positionalAlt != null ? String(positionalAlt) : '';

  const className = hash.class != null ? ` class="${String(hash.class)}"` : '';
  const loading = hash.loading != null ? String(hash.loading) : 'lazy';
  const width = hash.width != null ? ` width="${Number(hash.width)}"` : '';
  const height = hash.height != null ? ` height="${Number(hash.height)}"` : '';
  const sources = hash.sources || [];

  const normalized = src.replace(/^\//, '');
  const imgPath = normalized;
  const webpPath = normalized.replace(/\.(png|jpe?g)$/i, '.webp');

  let sourcesHtml = '';

  if (Array.isArray(sources) && sources.length > 0) {
    sources.forEach((source) => {
      if (source && typeof source === 'object') {
        const media = source.media
          ? ` media="${String(source.media).replace(/"/g, '&quot;')}"`
          : '';
        const srcset = source.srcset || source.src || '';
        const type = source.type
          ? ` type="${String(source.type).replace(/"/g, '&quot;')}"`
          : '';

        if (srcset) {
          const normalizedSrcset = srcset.replace(/^\//, '');
          sourcesHtml += `<source${media} srcset="${normalizedSrcset}"${type}>`;
        }
      }
    });
  }

  const html =
    `<picture${className}>` +
    sourcesHtml +
    `<source srcset="${webpPath}" type="image/webp">` +
    `<img src="${imgPath}" alt="${alt.replace(/"/g, '&quot;')}" loading="${loading}"${width}${height}>` +
    `</picture>`;

  return new Handlebars.SafeString(html);
}

