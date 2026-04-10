/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_BACKEND_URL?: string;
  readonly VITE_PERSISTENCE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
