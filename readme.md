## Vite Landing Template (TypeScript)

Starter template for landing pages based on Vite with TypeScript, Handlebars templates, multi-page structure, and automatic WebP image conversion.

### Features

- **Vite + TypeScript**: fast bundling, type checking, and smooth DX.
- **Handlebars templates**: partials in `src/templates` and sections in `src/sections` for building pages from reusable blocks.
- **Multi-page support**: all HTML files in `src` are automatically added as separate entry points.
- **Automatic WebP conversion**: `sharp`-based script (`scripts/convertToWebp.ts`) processes images and generates WebP versions.
- **`picture` helper**: convenient `<picture>` generation with WebP and fallback images directly in Handlebars templates.
- **ESLint + Prettier**: ready-to-use linting and formatting setup.
- **GitHub Pages ready**: uses relative `base` so it works in any repo path.

---

### Requirements

- **Node.js** v16+ (latest LTS recommended).
- npm or another package manager (examples use npm).

---

### Installation and usage

1. **Install dependencies**

```sh
npm install
```

2. **Start development server**

```sh
npm run dev
```

By default, the dev server:

- uses `src` as the project root;
- automatically opens the browser;
- picks up changes in templates, sections, and scripts with hot reload / full reload.

3. **Build for production**

```sh
npm run build
```

The build output will be generated in the `dist` directory.

4. **Preview production build locally**

```sh
npm run preview
```

---

### Available npm scripts

- **`npm run dev`**: start Vite dev server.
- **`npm run build`**: build the project with Vite into `dist`.
- **`npm run preview`**: run a local server to preview the built app.
- **`npm run typecheck`**: run TypeScript compiler without emitting files.
- **`npm run lint`**: run ESLint.
- **`npm run lint:fix`**: run ESLint and auto-fix issues where possible.
- **`npm run format`**: format the project with Prettier.
- **`npm run format:check`**: check formatting with Prettier (CI-friendly).
- **`npm run webp`**: one-off WebP conversion via `scripts/convertToWebp.ts`.
- **`npm run webp:watch`**: watch mode for images, automatically converts on changes.

---

### Project structure

Approximate structure (may differ if you added/removed files):

```text
.
├─ src/
│  ├─ index.html         # Main page (primary entry point)
│  ├─ *.html             # Additional pages (each becomes a separate entry)
│  ├─ templates/         # Handlebars partials
│  ├─ sections/          # Page sections / blocks
│  ├─ js/                # TypeScript entry (e.g. main.ts)
│  └─ styles/            # SCSS styles
├─ public/               # Public files, copied as-is
├─ scripts/
│  └─ convertToWebp.ts   # Image to WebP conversion script
├─ getHTMLFileNames.ts   # Helper for generating HTML entry list
├─ vite.config.ts        # Vite + Handlebars configuration
├─ tsconfig.json
├─ package.json
└─ readme.md
```

---

### Handlebars and helpers

The project uses `vite-plugin-handlebars` with several useful helpers:

- **`picture`**: generates a `<picture>` with WebP and `<img>` fallback.
  - Parameters: `alt`, `class`, `loading`, `width`, `height`, `sources` (array of additional `<source>` with media conditions).
- **`year`**: returns the current year for the footer copyright.

Example usage in a template (simplified):

```hbs
{{{picture "/img/hero.jpg" alt="Hero image" class="hero-image"}}}
```

---

### ESLint and Prettier in VS Code

If you do not have a `.vscode/settings.json` file yet, create it with the following configuration:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

This will automatically format your code with Prettier on save.

---

### Deploying to GitHub Pages

`vite.config.ts` uses **`base: './'`**, so the build works from any subpath (including `https://<USERNAME>.github.io/<REPO>/`) without changing config.

If you want to disable automatic WebP conversion (e.g. on CI), set:

```sh
VITE_WEBP_CONVERT=false
```

Typical deploy flow:

1. Build the project:

```sh
npm run build
```

2. Push the contents of `dist` to the `gh-pages` branch (manually or via GitHub Actions).

After that, GitHub Pages will serve your landing with the configured `base` path.

---

### License

MIT

**Free Software, Hell Yeah!**
