# BRUSH

Landing page for **BRUSH** — a free World Cup prediction and entertainment app. Built with Vite, TypeScript, Handlebars, and SCSS.

**Live site:** [boskolife.github.io/Brush](https://boskolife.github.io/Brush/)

---

## Stack

- **Vite 4** + **TypeScript**
- **Handlebars** — sections and templates as partials
- **SCSS** — layout and component styles
- **sharp** — automatic WebP generation for `public/images`
- **GitHub Actions** — build and deploy to GitHub Pages

---

## Pages

| File | URL | Description |
|------|-----|-------------|
| `src/index.html` | `index.html` | Main landing |
| `src/privacy.html` | `privacy.html` | Privacy policy |

Additional HTML files in `src/` are picked up automatically as Vite entry points (`getHTMLFileNames.ts`).

---

## Features

- **FAQ** — single-open accordion
- **How it works** — tabbed steps on desktop, stacked on mobile; swipe animation for step 2
- **Responsive images** — `picture` Handlebars helper (WebP + fallback)
- **Accessibility** — skip link, ARIA on FAQ/tabs, keyboard navigation for tabs

---

## Project structure

```text
.
├─ src/
│  ├─ index.html              # Landing page
│  ├─ privacy.html            # Privacy policy
│  ├─ sections/               # Landing sections (Handlebars partials)
│  ├─ templates/              # Header, footer, shared fragments
│  ├─ js/
│  │  ├─ main.ts              # Entry point
│  │  ├─ faq.ts               # FAQ accordion
│  │  ├─ how-it-works-steps.ts
│  │  └─ how-it-works-swipe.ts
│  └─ styles/                 # SCSS (main.scss imports layout partials)
├─ public/
│  ├─ images/                 # Static assets (copied to dist as-is)
│  └─ favicon/
├─ scripts/
│  ├─ convertToWebp.ts        # PNG/JPEG → WebP
│  └─ pictureHelper.ts        # Handlebars picture helper
├─ .github/workflows/static.yml
├─ getHTMLFileNames.ts
├─ vite.config.ts
└─ package.json
```

---

## Requirements

- **Node.js** 18+ (matches CI)
- npm

---

## Getting started

```sh
npm install
npm run dev
```

Dev server uses `src` as root, opens the browser, and hot-reloads changes in templates, sections, and scripts.

Build for production:

```sh
npm run build
```

Output goes to `dist/`.

Preview the production build locally:

```sh
npm run preview
```

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run webp` | Convert images in `public/images` to WebP |
| `npm run webp:watch` | Watch and convert on change |

---

## Environment variables

Optional — create a `.env` file in the **project root** (not inside `src/`). Vite loads it via `envDir` in `vite.config.ts`.

```env
VITE_WEBP_CONVERT=false
```

Disables WebP conversion during build (CI already sets this).

`.env` is gitignored. Restart the dev server after changing env values.

---

## Deploying to GitHub Pages

The project uses **`base: './'`** so assets work from a repo subpath (`https://<user>.github.io/<repo>/`).

Deployment is automated in `.github/workflows/static.yml` on push to `main`:

1. `npm ci` → `npm run build`
2. Upload `dist/` to GitHub Pages

### Image paths

Use **relative** paths for assets that must work on GitHub Pages, e.g. `images/card-1.png` — not `/images/card-1.png`. Absolute paths resolve from the domain root and break on project Pages (`/Brush/`).

The `picture` helper strips a leading slash automatically. Dynamic image URLs in JS should be read from `<img>` elements in HTML (see `section-how-it-works.html` and `how-it-works-swipe.ts`).

---

## Handlebars helpers

- **`picture`** — `<picture>` with WebP source and fallback:

```hbs
{{picture "/images/hero-img.png" "Hero" class="hero__image" mobile="/images/hero-img-mob.png"}}
```

- **`year`** — current year (available if needed in templates).

Partials live in `src/templates` and `src/sections`.

---

## License

MIT
