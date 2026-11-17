import {createRoot} from 'react-dom/client';
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

createRoot(document.getElementById('root')!).render(<App />);
