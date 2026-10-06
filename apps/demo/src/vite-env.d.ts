/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Populated by /config.js (SSM, config:generate, or Docker entrypoint). */
  __ENV__?: Record<string, string | undefined>;
}
