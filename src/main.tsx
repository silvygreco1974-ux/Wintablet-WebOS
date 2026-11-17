import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __wtDeferredInstallPrompt?: Event | null;
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__wtDeferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('wt-pwa-prompt-ready'));
});

window.addEventListener('appinstalled', () => {
  window.__wtDeferredInstallPrompt = null;
});

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister().catch(() => {});
        });
      })
      .catch(() => {});
  } else {
    const hadController = !!navigator.serviceWorker.controller;
    let isReloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !isReloading) {
        isReloading = true;
        window.location.reload();
      }
    });

    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        registration.update().catch(() => {});
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);

