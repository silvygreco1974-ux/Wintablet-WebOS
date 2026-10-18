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
} from 'lucide-react';
import { SystemSettings } from '../../types/os';
import { WALLPAPERS } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface SettingsAppProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
}

const ACCENT_COLORS: { id: SystemSettings['accentColor']; name: string; hex: string }[] = [
  { id: 'blue', name: 'Blu Windows', hex: '#3b82f6' },
  { id: 'emerald', name: 'Verde Smeraldo', hex: '#10b981' },
  { id: 'violet', name: 'Viola Profondo', hex: '#8b5cf6' },
  { id: 'amber', name: 'Ambra Solare', hex: '#f59e0b' },
  { id: 'rose', name: 'Rosa Magenta', hex: '#f43f5e' },
  { id: 'cyan', name: 'Ciano Fluido', hex: '#06b6d4' },
];

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, onUpdateSettings }) => {
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
        ? '/src/assets/images/win_bloom_light_1792313311807.jpg'
        : '/src/assets/images/win_bloom_wallpaper_1792312140457.jpg';
    onUpdateSettings({ ...settings, theme, wallpaper: nextWallpaper });
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

      {/* Theme Selection Banner (Light vs Dark with Strong Contrast) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Tema Sistema (Chiaro / Scuro)
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'light'
                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="p-3 bg-amber-400 rounded-xl text-slate-950 shadow-sm">
              <Sun className="w-6 h-6 fill-amber-950" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base text-slate-900">Tema Chiaro</div>
              <div className="text-xs text-slate-600 font-medium">Luminoso, carta bianca e alto contrasto</div>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'border-blue-500 bg-slate-800 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-sm">
              <Moon className="w-6 h-6 fill-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-base text-slate-900 dark:text-white">Tema Scuro</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sfondo scuro riposante per la sera</div>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WALLPAPERS.map((wp) => {
            const isSelected = settings.wallpaper === wp.url;
            return (
              <div
                key={wp.id}
                onClick={() => handleWallpaperChange(wp.url)}
                className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  isSelected
                    ? 'border-blue-500 shadow-lg scale-[1.02] ring-2 ring-blue-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div className="h-28 bg-slate-950 relative overflow-hidden">
                  <img
                    src={wp.url}
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{wp.name}</div>
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
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Colore Risalto (Accent)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {ACCENT_COLORS.map((col) => {
              const isSelected = settings.accentColor === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => handleAccentChange(col.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablet Mode & Audio */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Modalità Tablet & Suoni
          </h3>

          <div className="space-y-3">
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
                  Effetti audio Windows sintetizzati a basso consumo di memoria
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
    </div>
  );
};
