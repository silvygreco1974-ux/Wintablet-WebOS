import React from 'react';
import {
  Palette,
  Monitor,
  Volume2,
  VolumeX,
  Tablet,
  Sliders,
  Info,
  Check,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles,
  Download,
  RefreshCw,
} from 'lucide-react';
import { SystemSettings, AppId } from '../../types/os';
import { WALLPAPER_LIST } from '../../utils/wallpapers';
import { sound } from '../../utils/audio';
import { ACCENT_CONFIGS } from '../../utils/theme';
import { SYSTEM_APPS_CATALOG } from '../../utils/appsCatalog';
import { APP_VERSION, checkForAppUpdates, forcePurgeAppCacheAndReload } from '../../utils/pwa';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface SettingsAppProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

const ACCENT_COLORS: { id: SystemSettings['accentColor']; name: string; hex: string }[] = [
  { id: 'blue', name: 'Blu Windows', hex: '#2563eb' },
  { id: 'emerald', name: 'Verde Smeraldo', hex: '#059669' },
  { id: 'violet', name: 'Viola Profondo', hex: '#7c3aed' },
  { id: 'amber', name: 'Ambra Solare', hex: '#d97706' },
  { id: 'rose', name: 'Rosa Magenta', hex: '#e11d48' },
  { id: 'cyan', name: 'Ciano Fluido', hex: '#0891b2' },
];

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, onUpdateSettings }) => {
  const currentAccent = ACCENT_CONFIGS[settings.accentColor] || ACCENT_CONFIGS.blue;
  const [updateStatus, setUpdateStatus] = React.useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);

  const handleCheckUpdates = async () => {
    sound.playClick();
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const result = await checkForAppUpdates();
      if (result === 'updated') {
        setUpdateStatus('Nuovo aggiornamento trovato! Ricaricamento in corso...');
        window.setTimeout(() => window.location.reload(), 600);
      } else {
        setUpdateStatus(`Versione v${APP_VERSION} attiva. Se non vedi le novità, usa "Svuota cache app e ricarica".`);
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleForceCachePurge = async () => {
    sound.playClick();
    setUpdateStatus('Pulizia cache PWA in corso...');
    await forcePurgeAppCacheAndReload();
  };

  const handleWallpaperChange = (url: string) => {
    sound.playClick();
    onUpdateSettings({ ...settings, wallpaper: url });
  };

  const handleAccentChange = (accent: SystemSettings['accentColor']) => {
    sound.playClick();
    onUpdateSettings({ ...settings, accentColor: accent });
  };

  const handleTabletModeToggle = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, tabletMode: !settings.tabletMode });
  };

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    if (next) sound.playClick();
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    sound.playClick();
    const nextWallpaper =
      theme === 'light'
        ? '/wallpapers/win_bloom_light.jpg'
        : '/wallpapers/win_bloom_dark.jpg';
    onUpdateSettings({ ...settings, theme, wallpaper: nextWallpaper });
  };

  const pinnedTaskbarApps = settings.pinnedTaskbarApps || ['text-editor', 'code-editor', 'file-explorer'];
  const pinnedDesktopApps = settings.pinnedDesktopApps || [];

  const togglePinTaskbar = (appId: AppId) => {
    sound.playClick();
    const exists = pinnedTaskbarApps.includes(appId);
    const next = exists
      ? pinnedTaskbarApps.filter((id) => id !== appId)
      : [...pinnedTaskbarApps, appId];
    onUpdateSettings({ ...settings, pinnedTaskbarApps: next });
  };

  const togglePinDesktop = (appId: AppId) => {
    sound.playClick();
    const exists = pinnedDesktopApps.includes(appId);
    const next = exists
      ? pinnedDesktopApps.filter((id) => id !== appId)
      : [...pinnedDesktopApps, appId];
    onUpdateSettings({ ...settings, pinnedDesktopApps: next });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-y-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-500" />
          <span>Impostazioni di Sistema</span>
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
          Personalizza l'aspetto, il tema chiaro/scuro, gli sfondi, la modalità tablet e l'audio.
        </p>
      </div>

      {/* PWA In-App Install Banner */}
      <PWAInstallButton variant="settings" />

      {/* Theme Selection Banner */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Tema Sistema (Chiaro / Scuro)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'light'
                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="p-3 bg-amber-400 rounded-xl text-slate-950 shadow-sm shrink-0">
              <Sun className="w-6 h-6 fill-amber-950" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base text-slate-900 dark:text-white">Tema Chiaro Naturale</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Luce morbida e riposante, testo scuro ad alto contrasto</div>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'border-blue-500 bg-slate-800 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-sm shrink-0">
              <Moon className="w-6 h-6 fill-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base text-slate-900 dark:text-white">Tema Scuro Notturno</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sfondo scuro riposante per la sera e risparmio energetico</div>
            </div>
          </button>
        </div>
      </div>

      {/* Wallpapers section */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Sfondo del Desktop (Wallpaper HD)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {WALLPAPER_LIST.map((wp) => {
            const isSelected = settings.wallpaper === wp.url;
            return (
              <div
                key={wp.id}
                onClick={() => handleWallpaperChange(wp.url)}
                className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  isSelected
                    ? 'border-blue-500 shadow-lg scale-[1.02] ring-2 ring-[var(--accent-hex,#2563eb)]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div
                  className="h-28 bg-slate-900 relative overflow-hidden flex items-center justify-center"
                  style={{
                    background: wp.isGradient ? wp.url : undefined,
                  }}
                >
                  {!wp.isGradient && (
                    <img
                      src={wp.url}
                      alt={wp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = wp.fallbackUrl;
                      }}
                    />
                  )}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 text-white rounded-full p-1.5 shadow-md"
                      style={{ backgroundColor: currentAccent.hex }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{wp.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{wp.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent color & Tablet Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Accent Colors */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Colore Risalto (Accent)
            </h3>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: currentAccent.hex }}
            >
              {currentAccent.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACCENT_COLORS.map((col) => {
              const isSelected = settings.accentColor === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => handleAccentChange(col.id)}
                  className={`p-2.5 rounded-xl border-2 flex items-center gap-2.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'shadow-md scale-105 text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? col.hex : undefined,
                    borderColor: isSelected ? col.hex : undefined,
                  }}
                >
                  <span
                    className={`w-4 h-4 rounded-full shrink-0 shadow-sm border ${
                      isSelected ? 'border-white' : 'border-black/20'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate">{col.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-bold text-slate-500">Anteprima Colore Attivo:</div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm"
                style={{ backgroundColor: currentAccent.hex }}
              >
                Pulsante Primario
              </button>
              <div
                className="px-3 py-1.5 rounded-lg font-bold text-xs border"
                style={{
                  color: currentAccent.hex,
                  borderColor: currentAccent.hex,
                  backgroundColor: `${currentAccent.hex}15`,
                }}
              >
                Bordo & Badge Attivo
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Mode & Audio */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Modalità Tablet & Suoni
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Tablet className="w-4 h-4 text-blue-500" />
                  <span>Modalità Tablet Touch</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Ingrandisce barre e pulsanti per facilitare il tocco con le dita
                </div>
              </div>
              <button
                onClick={handleTabletModeToggle}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.tabletMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    settings.tabletMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Suoni di Sistema</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Effetti audio sintetizzati ad ingombro zero
                </div>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Taskbar & Desktop App Visibility Customizer */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Personalizza Barra & Desktop
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tutte le app di sistema si trovano sempre nel menu Start. Scegli quali mostrare anche sulla barra in basso o sul desktop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SYSTEM_APPS_CATALOG.map((app) => {
            const onTaskbar = pinnedTaskbarApps.includes(app.id);
            const onDesktop = pinnedDesktopApps.includes(app.id);
            return (
              <div
                key={app.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.renderIcon('w-4 h-4 text-white')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {app.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => togglePinTaskbar(app.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                      onTaskbar
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Mostra sulla barra delle applicazioni in basso"
                  >
                    Barra
                  </button>
                  <button
                    onClick={() => togglePinDesktop(app.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                      onDesktop
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Mostra icona anche sul desktop"
                  >
                    Desktop
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* App Version & PWA Cache Control */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Aggiornamenti &amp; Cache PWA
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            WinTablet v{APP_VERSION}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Se dopo un nuovo deploy continui a vedere la versione precedente sul tablet, svuota la cache del Service Worker: i tuoi documenti, appunti e file salvati non verranno toccati.
        </p>

        {updateStatus && (
          <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-blue-200">
            {updateStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Controllo...' : 'Controlla aggiornamenti'}</span>
          </button>

          <button
            onClick={handleForceCachePurge}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Svuota cache app e ricarica</span>
          </button>
        </div>
      </div>
    </div>
  );
};

