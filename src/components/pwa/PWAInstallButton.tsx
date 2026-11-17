import React, { useState } from 'react';
import { Download, Sparkles, X, Smartphone, Copy, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'taskbar' | 'header' | 'settings' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isInIframe =
    typeof window !== 'undefined' &&
    (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>App installata sul dispositivo (PWA attiva)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const renderContent = () => {
    if (variant === 'taskbar') {
      return (
        <button
          onClick={handleInstallClick}
          className={`p-2 rounded-xl flex items-center justify-center transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95 ${className}`}
          title="Installa WinTablet come PWA sul tablet"
        >
          <Download className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'settings') {
      return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border-2 border-blue-200 dark:border-blue-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Installa Progressive Web App (PWA)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-600 text-white font-black uppercase">PWA</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Usa l'app a schermo intero senza barre del browser, anche offline e con icona dedicata nella home del tablet.
              </div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Installa PWA</span>
          </button>
        </div>
      );
    }

    // Default 'header' / desktop quick bar variant
    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all hover:scale-105 ${className}`}
        title="Installa WinTablet WebOS sul tuo tablet / PC come app nativa (PWA)"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Installa PWA</span>
      </button>
    );
  };

  return (
    <>
      {renderContent()}

      {/* In-App Guided PWA Install Modal (replaces alert which fails on tablet/iframe) */}
      {showGuideModal && (
        <div
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-extrabold">
                  {isIOS ? 'Installa su iPad o iPhone' : 'Installa sul Tablet o PC'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isInIframe && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-2">
                <div>
                  Stai visualizzando l'app dentro un riquadro di anteprima: i browser consentono l'installazione PWA solo aprendo l'app direttamente in una scheda del browser (es. tramite il link condiviso).
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Link copiato!' : 'Copia indirizzo app'}</span>
                </button>
              </div>
            )}

            {isIOS ? (
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <div>Tocca il pulsante <strong>Condividi</strong> (quadrato con freccia verso l'alto) nella barra di Safari.</div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <div>Seleziona <strong>"Aggiungi alla schermata Home"</strong> e tocca <strong>Aggiungi</strong>.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <div>Su <strong>Chrome / Edge Tablet (Android)</strong>: tocca il menu <strong>⋮</strong> in alto a destra e seleziona <strong>"Aggiungi a schermata Home"</strong> o <strong>"Installa app"</strong>.</div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <div>Se l'app era già stata installata prima, rimuovila dalla Home o aggiorna la pagina prima di reinstallarla.</div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white hover:bg-blue-500 shadow-md transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
};
