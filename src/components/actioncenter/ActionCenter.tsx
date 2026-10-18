import React from 'react';
import {
  Wifi,
  Volume2,
  VolumeX,
  Tablet,
  Maximize2,
  HardDrive,
  Sun,
} from 'lucide-react';
import { SystemSettings } from '../../types/os';
import { sound } from '../../utils/audio';

interface ActionCenterProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onOpenStorageManager: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenStorageManager,
}) => {
  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    if (next) sound.playClick();
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const toggleTabletMode = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, tabletMode: !settings.tabletMode });
  };

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    sound.setVolume(vol);
    onUpdateSettings({ ...settings, systemVolume: vol });
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bri = parseInt(e.target.value, 10);
    onUpdateSettings({ ...settings, brightness: bri });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-40 bg-black/25"
    >
      <div className="absolute bottom-14 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl p-5 w-84 text-slate-900 dark:text-slate-100 flex flex-col gap-4">
        {/* Quick Action Tiles */}
        <div className="grid grid-cols-3 gap-2">
          {/* WiFi */}
          <button
            onClick={() => sound.playClick()}
            className="p-3 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center gap-1 shadow-md"
          >
            <Wifi className="w-4 h-4" />
            <span className="text-[10px] font-bold">Wi-Fi Online</span>
          </button>

          {/* Tablet Mode */}
          <button
            onClick={toggleTabletMode}
            className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              settings.tabletMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="text-[10px] font-bold">Modalità Tablet</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              settings.soundEnabled
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] font-bold">{settings.soundEnabled ? 'Audio Attivo' : 'Muto'}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">Schermo Intero</span>
          </button>

          {/* Storage quick jump */}
          <button
            onClick={() => {
              onClose();
              onOpenStorageManager();
            }}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center justify-center gap-1 transition-colors col-span-2"
          >
            <HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] font-bold">Memoria Tablet: Ottimizzata</span>
          </button>
        </div>

        {/* Global Font Size Scale for Tablet */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Dimensione Testo Interfaccia</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono">
              {settings.fontScale === 'xlarge' ? '130%' : settings.fontScale === 'large' ? '115%' : '100%'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, fontScale: 'normal' });
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.fontScale === 'normal'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Normale
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, fontScale: 'large' });
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.fontScale === 'large'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Grande
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ ...settings, fontScale: 'xlarge' });
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.fontScale === 'xlarge'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Massima
            </button>
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Luminosità Schermo
            </span>
            <span className="text-slate-500 font-mono">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={settings.brightness}
            onChange={handleBrightnessChange}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Volume Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-500" /> Volume Suoni
            </span>
            <span className="text-slate-500 font-mono">{Math.round(settings.systemVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.systemVolume}
            onChange={handleVolumeChange}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
