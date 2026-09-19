/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EKRASIKLIS_SETUP_URL?: string;
  readonly VITE_EKRASIKLIS_VIDEO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
