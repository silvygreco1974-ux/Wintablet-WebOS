import React, { useState } from 'react';
import {
  Search,
  Power,
  FileText,
  FileCode,
  User,
  Pin,
  PinOff,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import { AppId, CustomWebApp, SystemSettings, VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';
import { SYSTEM_APPS_CATALOG } from '../../utils/appsCatalog';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (appId: AppId) => void;
  onLaunchWebApp: (app: CustomWebApp) => void;
  onOpenFile: (file: VirtualFile) => void;
  webApps: CustomWebApp[];
  recentFiles: VirtualFile[];
  settings: SystemSettings;
  onTogglePinTaskbar: (appId: AppId) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
  onLaunchWebApp,
  onOpenFile,
  webApps,
  recentFiles,
  settings,
  onTogglePinTaskbar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomizingBar, setIsCustomizingBar] = useState(false);

  if (!isOpen) return null;

  const pinnedTaskbarApps = settings.pinnedTaskbarApps || [
    'text-editor',
    'code-editor',
    'file-explorer',
  ];

  const filteredCoreApps = SYSTEM_APPS_CATALOG.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Web apps only appear inside Start Menu when searching (since pre-installed web apps live on Desktop)
  const filteredWebApps = searchQuery.trim()
    ? webApps.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredRecentFiles = recentFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCustomizingBar(false);
          onClose();
        }
      }}
      className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
    >
      <div
        className={`absolute bottom-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-300 dark:border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 w-[calc(100%-1rem)] max-w-xl flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-200 ${
          settings.taskbarAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-2 sm:left-4'
        }`}
        style={{ maxHeight: 'calc(100dvh - 80px)' }}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Cerca app di sistema, file o web app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* System Apps Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5 gap-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                App di Sistema
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsCustomizingBar(!isCustomizingBar);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                  isCustomizingBar
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                }`}
                title="Scegli quali icone fissare sulla barra in basso"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{isCustomizingBar ? 'Fine selezione barra' : 'Scegli icone barra'}</span>
              </button>
            </div>

            {isCustomizingBar && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-800 dark:text-blue-200">
                Tocca un'app per aggiungerla o rimuoverla dalla barra delle applicazioni in basso.
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {filteredCoreApps.map((app) => {
                const isPinned = pinnedTaskbarApps.includes(app.id);
                return (
                  <div key={app.id} className="relative group">
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (isCustomizingBar) {
                          onTogglePinTaskbar(app.id);
                        } else {
                          onLaunchApp(app.id);
                          onClose();
                        }
                      }}
                      className={`w-full flex flex-col items-center p-2.5 rounded-xl transition-all text-center ${
                        isCustomizingBar
                          ? isPinned
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent opacity-70 hover:opacity-100'
                          : 'hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-1.5 border border-white/20"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.renderIcon('w-5 h-5 text-white')}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate w-full">
                        {app.shortName}
                      </span>
                    </button>

                    {/* Pin status badge when customizing or hovered */}
                    {(isCustomizingBar || isPinned) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          onTogglePinTaskbar(app.id);
                        }}
                        className={`absolute top-1 right-1 p-1 rounded-md transition-all ${
                          isPinned
                            ? 'bg-blue-600 text-white shadow-sm opacity-100'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isPinned ? 'Rimuovi dalla barra' : 'Fissa sulla barra'}
                      >
                        {isPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search-only Web Apps results */}
          {filteredWebApps.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-500" /> Web App trovate
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredWebApps.map((wa) => (
                  <button
                    key={wa.id}
                    onClick={() => {
                      sound.playClick();
                      onLaunchWebApp(wa);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm border border-white/20"
                      style={{ backgroundColor: wa.iconColor }}
                    >
                      {wa.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {wa.name}
                      </div>
                      <div className="text-[9px] text-slate-500">{wa.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Documenti Recenti
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredRecentFiles.slice(0, 4).map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      sound.playClick();
                      onOpenFile(file);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0">
                      {file.type === 'doc' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <FileCode className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB ·{' '}
                        {new Date(file.updatedAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with User & Close */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Utente Tablet
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {pinnedTaskbarApps.length} app fissate sulla barra
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsCustomizingBar(false);
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
            title="Chiudi Menu Start"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
