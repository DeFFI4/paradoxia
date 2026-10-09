/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PLATEGA_PROJECT_ID?: string;
  readonly VITE_PLATEGA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
