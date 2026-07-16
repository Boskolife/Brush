/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBP_CONVERT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
