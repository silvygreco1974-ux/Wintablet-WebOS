import React, { useState } from 'react';
import {
  Search,
  Power,
  RotateCcw,
  Sparkles,
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
  HardDrive,
  Sliders,
  Calculator,
  User,
  Plus,
} from 'lucide-react';
import { AppId, CustomWebApp, VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (appId: AppId) => void;
  onLaunchWebApp: (app: CustomWebApp) => void;
  onOpenFile: (file: VirtualFile) => void;
  webApps: CustomWebApp[];
  recentFiles: VirtualFile[];
  taskbarAlign: 'center' | 'left';
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
  onLaunchWebApp,
  onOpenFile,
  webApps,
  recentFiles,
  taskbarAlign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const coreApps = [
    {
      id: 'text-editor' as AppId,
      name: 'Editor di Testo',
      icon: <FileText className="w-5 h-5 text-white" />,
      color: '#2563eb',
      desc: 'Crea e formatta documenti',
    },
    {
      id: 'code-editor' as AppId,
      name: 'Editor di Codice',
      icon: <FileCode className="w-5 h-5 text-white" />,
      color: '#10b981',
      desc: 'HTML, JS, anteprima live',
    },
    {
      id: 'sticky-notes' as AppId,
      name: 'Sticky Notes',
      icon: <StickyIcon className="w-5 h-5 text-white" />,
      color: '#f59e0b',
      desc: 'Note adesive sul desktop',
    },
    {
      id: 'web-launcher' as AppId,
      name: 'Web Hub & App',
      icon: <Globe className="w-5 h-5 text-white" />,
      color: '#06b6d4',
      desc: 'Aggiungi app web esterne',
    },
    {
      id: 'file-explorer' as AppId,
      name: 'Questo PC',
      icon: <HardDrive className="w-5 h-5 text-white" />,
      color: '#3b82f6',
      desc: 'Esplora disco e file',
    },
    {
      id: 'storage-manager' as AppId,
      name: 'Memoria Tablet',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: '#6366f1',
      desc: 'Gestione e backup spazio',
    },
    {
      id: 'calculator' as AppId,
      name: 'Calcolatrice',
      icon: <Calculator className="w-5 h-5 text-white" />,
      color: '#ec4899',
      desc: 'Calcoli standard e percentuali',
    },
    {
      id: 'settings' as AppId,
      name: 'Impostazioni',
      icon: <Sliders className="w-5 h-5 text-white" />,
      color: '#64748b',
      desc: 'Sfondi, tablet touch e audio',
    },
  ];

  const filteredCoreApps = coreApps.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWebApps = webApps.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecentFiles = recentFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
    >
      <div
        className={`absolute bottom-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-300 dark:border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 w-full max-w-xl flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-200 ${
          taskbarAlign === 'center'
            ? 'left-1/2 -translate-x-1/2'
            : 'left-4'
        }`}
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Cerca app, impostazioni e documenti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Pinned Core Apps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">App di Sistema</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Ultra-leggere per tablet</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
              {filteredCoreApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    sound.playClick();
                    onLaunchApp(app.id);
                    onClose();
                  }}
                  className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-center group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-1.5 border border-white/20"
                    style={{ backgroundColor: app.color }}
                  >
                    {app.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Web Apps Section */}
          {webApps.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Web App Esterne Salvate</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onLaunchApp('web-launcher');
                    onClose();
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Aggiungi altra
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{wa.name}</div>
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
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Documenti Recenti</span>
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
                      {file.type === 'doc' ? <FileText className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB · {new Date(file.updatedAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with User & Power */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Utente Tablet</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ambiente WebOS Attivo</div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
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
