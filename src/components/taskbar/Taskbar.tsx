import React, { useState, useEffect } from 'react';
import {
  Search,
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  Sliders,
  Calendar as CalendarIcon,
  Tablet,
  LayoutGrid,
} from 'lucide-react';
import { AppId, SystemSettings, WindowItem } from '../../types/os';
import { sound } from '../../utils/audio';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface TaskbarProps {
  windows: WindowItem[];
  activeWindowId: string | null;
  settings: SystemSettings;
  isStartOpen: boolean;
  isActionCenterOpen: boolean;
  isCalendarOpen: boolean;
  onToggleStart: () => void;
  onToggleActionCenter: () => void;
  onToggleCalendar: () => void;
  onToggleTabletMode: () => void;
  onAppClick: (appId: AppId, windowId?: string) => void;
  onMinimizeAll: () => void;
}

import { SYSTEM_APPS_CATALOG } from '../../utils/appsCatalog';

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  settings,
  isStartOpen,
  isActionCenterOpen,
  isCalendarOpen,
  onToggleStart,
  onToggleActionCenter,
  onToggleCalendar,
  onToggleTabletMode,
  onAppClick,
  onMinimizeAll,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Only apps chosen by the user are permanently pinned on the Taskbar
  const pinnedIds = settings.pinnedTaskbarApps || ['text-editor', 'code-editor', 'file-explorer'];
  const pinnedApps = SYSTEM_APPS_CATALOG.filter((app) => pinnedIds.includes(app.id));

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-t border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] z-50 flex items-center justify-between px-2 select-none transition-colors ${
        settings.tabletMode ? 'h-14 px-3' : 'h-12'
      }`}
    >
      {/* Left: Align Left Start or Spacer */}
      {settings.taskbarAlign === 'left' ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              onToggleStart();
            }}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              isStartOpen
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'hover:bg-slate-200 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400'
            }`}
            title="Start"
          >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleStart();
            }}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
            title="Cerca"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-20 hidden md:block" />
      )}

      {/* Center Apps Area */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto ${
          settings.taskbarAlign === 'center' ? 'mx-auto' : ''
        }`}
      >
        {settings.taskbarAlign === 'center' && (
          <>
            <button
              onClick={() => {
                sound.playClick();
                onToggleStart();
              }}
              className={`p-2 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isStartOpen
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'hover:bg-slate-200 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400'
              }`}
              title="Menu Start (App di sistema)"
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
              </div>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onToggleStart();
              }}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
              title="Cerca"
            >
              <Search className="w-4 h-4" />
            </button>
          </>
        )}

        {/* User-Chosen Pinned Apps */}
        {pinnedApps.map((app) => {
          const appWindows = windows.filter((w) => w.appId === app.id && w.isOpen);
          const isRunning = appWindows.length > 0;
          const isActive = appWindows.some((w) => w.id === activeWindowId && !w.isMinimized);

          return (
            <button
              key={app.id}
              onClick={() => {
                sound.playClick();
                onAppClick(app.id, appWindows[0]?.id);
              }}
              className={`relative p-2 rounded-xl transition-all group flex items-center justify-center shrink-0 ${
                isActive
                  ? 'bg-blue-100 dark:bg-white/15 text-blue-900 dark:text-white shadow-sm'
                  : isRunning
                  ? 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
                  : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              } ${settings.tabletMode ? 'w-11 h-11' : 'w-10 h-10'}`}
              title={app.name}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-sm border border-white/20"
                style={{ backgroundColor: app.color }}
              >
                {app.renderIcon('w-3.5 h-3.5 text-white')}
              </div>

              {isRunning && (
                <div
                  className="absolute bottom-0.5 rounded-full transition-all"
                  style={{
                    width: isActive ? '16px' : '6px',
                    height: '3px',
                    backgroundColor: isActive ? 'var(--accent-hex, #2563eb)' : '#94a3b8',
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Running unpinned windows (system or web apps) */}
        {windows
          .filter((w) => w.isOpen && !pinnedApps.some((p) => p.id === w.appId))
          .map((w) => {
            const isActive = w.id === activeWindowId && !w.isMinimized;
            const catalogApp = SYSTEM_APPS_CATALOG.find((a) => a.id === w.appId);
            return (
              <button
                key={w.id}
                onClick={() => {
                  sound.playClick();
                  onAppClick(w.appId, w.id);
                }}
                className={`relative p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-white/15 text-blue-900 dark:text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
                } ${settings.tabletMode ? 'w-11 h-11' : 'w-10 h-10'}`}
                title={w.title}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-white shadow-sm border border-white/20"
                  style={{ backgroundColor: w.color }}
                >
                  {catalogApp ? catalogApp.renderIcon('w-3.5 h-3.5 text-white') : w.title.charAt(0)}
                </div>
                <div
                  className="absolute bottom-0.5 rounded-full transition-all"
                  style={{
                    width: isActive ? '16px' : '6px',
                    height: '3px',
                    backgroundColor: isActive ? 'var(--accent-hex, #2563eb)' : '#94a3b8',
                  }}
                />
              </button>
            );
          })}
      </div>

      {/* Right: System Tray */}
      <div className="flex items-center gap-1 shrink-0">
        {/* PWA Install Button in Taskbar */}
        <PWAInstallButton variant="taskbar" />

        {/* Tablet Mode toggle quick icon */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleTabletMode();
          }}
          className={`p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1 ${
            settings.tabletMode
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={settings.tabletMode ? 'Modalità Tablet Attiva' : 'Attiva Modalità Tablet Touch'}
        >
          <Tablet className="w-4 h-4" />
        </button>

        {/* Action Center Pill (WiFi, Volume, Battery) */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleActionCenter();
          }}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors ${
            isActionCenterOpen
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
          }`}
          title="Centro Notifiche e Azioni Rapide"
        >
          <Wifi className="w-3.5 h-3.5 text-current" />
          {settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-current" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
          )}
          <Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Date & Time with Calendar flyout toggle - Ultra visible in light theme */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleCalendar();
          }}
          className={`flex flex-col items-end px-2.5 py-1 rounded-xl text-right text-xs transition-colors ${
            isCalendarOpen
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-slate-100'
          }`}
          title="Data e Ora (Tocca per aprire il calendario)"
        >
          <span className="font-mono font-extrabold text-[12px] leading-tight text-slate-900 dark:text-white">
            {time}
          </span>
          <span className="font-mono font-bold text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
            {date}
          </span>
        </button>

        {/* Desktop Peak line (click to minimize all windows) */}
        <button
          onClick={() => {
            sound.playClick();
            onMinimizeAll();
          }}
          className="w-2 h-7 hover:bg-white/20 border-l border-white/10 transition-colors ml-1"
          title="Mostra Desktop"
        />
      </div>
    </div>
  );
};
