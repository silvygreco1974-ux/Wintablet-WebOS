/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:public-html-apps' {
  import type { CustomWebApp } from './types/os';
  export const PUBLIC_HTML_APPS: CustomWebApp[];
}
