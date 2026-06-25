/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAITLIST_SCRIPT_URL?: string;
  readonly VITE_WAITLIST_SCRIPT_TOKEN?: string;
  readonly VITE_WEBP_CONVERT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
