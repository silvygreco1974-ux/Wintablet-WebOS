import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const VIRTUAL_PUBLIC_APPS_ID = 'virtual:public-html-apps';
const RESOLVED_VIRTUAL_PUBLIC_APPS_ID = '\0' + VIRTUAL_PUBLIC_APPS_ID;

const APP_COLOR_PALETTE = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
  '#6366f1',
];

const VALID_CATEGORIES = new Set([
  'Produttività',
  'Strumenti',
  'Sviluppo',
  'Studio',
  'Grafica & Design',
  'Social',
  'Intrattenimento',
  'Altro',
]);

function decodeBasicEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function formatFallbackTitle(rawName: string): string {
  return rawName
    .replace(/\.(html?|HTML?)$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase()) || 'App HTML';
}

function pickColorForUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return APP_COLOR_PALETTE[Math.abs(hash) % APP_COLOR_PALETTE.length];
}

function parseHtmlAppMetadata(filePath: string, urlPath: string, fallbackBaseName: string) {
  let html = '';
  try {
    html = fs.readFileSync(filePath, 'utf-8');
  } catch {}

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? decodeBasicEntities(titleMatch[1].replace(/\s+/g, ' ')) : '';
  const name = rawTitle || formatFallbackTitle(fallbackBaseName);

  const descMatch =
    html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const description = descMatch?.[1]
    ? decodeBasicEntities(descMatch[1])
    : `App HTML locale (${urlPath})`;

  const themeMatch =
    html.match(/<meta\s+[^>]*name=["']theme-color["'][^>]*content=["'](#[0-9a-fA-F]{3,8})["'][^>]*>/i) ||
    html.match(/<meta\s+[^>]*content=["'](#[0-9a-fA-F]{3,8})["'][^>]*name=["']theme-color["'][^>]*>/i);
  const iconColor = themeMatch?.[1] || pickColorForUrl(urlPath);

  const catMatch =
    html.match(/<meta\s+[^>]*name=["']app-category["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']app-category["'][^>]*>/i);
  const rawCat = catMatch?.[1] ? decodeBasicEntities(catMatch[1]) : '';
  const category = VALID_CATEGORIES.has(rawCat) ? rawCat : 'Strumenti';

  const slug = urlPath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `local-html-${slug || 'app'}`,
    name,
    url: urlPath,
    iconName: 'FileCode',
    iconColor,
    category,
    displayMode: 'window' as const,
    description,
    isPinnedDesktop: true,
    isPinnedTaskbar: false,
    isLocalHtml: true,
  };
}

function scanPublicHtmlApps(publicDir: string) {
  if (!fs.existsSync(publicDir)) return [];

  const discovered: ReturnType<typeof parseHtmlAppMetadata>[] = [];
  const seenUrls = new Set<string>();

  const registerFile = (fullPath: string, urlPath: string, fallbackName: string) => {
    const normalizedUrl = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    if (seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);
    discovered.push(parseHtmlAppMetadata(fullPath, normalizedUrl, fallbackName));
  };

  const scanFolder = (dirPath: string, urlPrefix: string, allowLooseSubdirs: boolean) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile() && /\.html?$/i.test(entry.name)) {
        const urlPath = `${urlPrefix}/${entry.name}`.replace(/\/+/g, '/');
        registerFile(fullPath, urlPath, entry.name);
        continue;
      }

      if (entry.isDirectory()) {
        // Never treat static image folders like wallpapers as HTML apps
        if (urlPrefix === '' && entry.name === 'wallpapers') continue;

        const indexHtml = fs.existsSync(path.join(fullPath, 'index.html'))
          ? 'index.html'
          : fs.existsSync(path.join(fullPath, 'index.htm'))
          ? 'index.htm'
          : null;

        if (indexHtml) {
          const urlPath = `${urlPrefix}/${entry.name}/${indexHtml}`.replace(/\/+/g, '/');
          registerFile(path.join(fullPath, indexHtml), urlPath, entry.name);
        } else if (entry.name === 'apps' || allowLooseSubdirs) {
          scanFolder(fullPath, `${urlPrefix}/${entry.name}`.replace(/\/+/g, '/'), entry.name === 'apps' || allowLooseSubdirs);
        }
      }
    }
  };

  scanFolder(publicDir, '', false);
  return discovered;
}

function publicHtmlAppsPlugin(): Plugin {
  const publicDir = path.resolve(process.cwd(), 'public');
  return {
    name: 'win-tablet-public-html-apps',
    resolveId(id) {
      if (id === VIRTUAL_PUBLIC_APPS_ID) {
        return RESOLVED_VIRTUAL_PUBLIC_APPS_ID;
      }
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_PUBLIC_APPS_ID) {
        const apps = scanPublicHtmlApps(publicDir);
        return `export const PUBLIC_HTML_APPS = ${JSON.stringify(apps)};`;
      }
      return null;
    },
    configureServer(server) {
      server.middlewares.use('/__public_html_apps', (_req, res) => {
        const apps = scanPublicHtmlApps(publicDir);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(apps));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      publicHtmlAppsPlugin(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'wallpapers/*.jpg'],
        manifest: {
          id: '/',
          name: 'WinTablet WebOS',
          short_name: 'WinTablet',
          description: 'Un ambiente desktop stile Windows leggero e ottimizzato per tablet con editor di testo, editor di codice, sticky notes, launcher per web app esterne e gestione memoria.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigateFallbackDenylist: [/\.html?$/i, /^\/apps\//, /^\/__public_html_apps/],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
