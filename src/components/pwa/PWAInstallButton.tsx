import React, { useState } from 'react';
import { Download, Sparkles, X, Smartphone, ArrowDown } from 'lucide-react';
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
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General guidance fallback for browsers that don't emit beforeinstallprompt (e.g. desktop safari/firefox)
      alert("Per installare l'app come PWA:\n\n• Su Chrome/Edge: clicca sull'icona di installazione nella barra degli indirizzi o nel menu in alto a destra.\n• Su Android: tocca i 3 puntini e scegli 'Aggiungi a schermata Home' / 'Installa app'.\n• Su iPad/iPhone: tocca Condividi e 'Aggiungi a schermata Home'.");
    }
  };

  const renderContent = () => {
    if (variant === 'taskbar') {
      return (
        <button
          onClick={handleInstallClick}
          className={`p-2 rounded-xl flex items-center justify-center transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95 ${className}`}
          title="Installa WinTablet come PWA sul tablet"
        >
          <Download className="w-4 h-4 animate-bounce" />
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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-black uppercase">PWA</span>
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

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-extrabold">Installa su iPad o iPhone</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                <div>Tocca il pulsante <strong>Condividi</strong> (quadrato con freccia verso l'alto) nella barra di Safari in alto o in basso.</div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                <div>Scorri le opzioni verso il basso e seleziona <strong>"Aggiungi alla schermata Home"</strong>.</div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                <div>Tocca <strong>Aggiungi</strong> in alto a destra. L'icona WinTablet apparirà sulla schermata principale del tuo iPad/iPhone!</div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
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
