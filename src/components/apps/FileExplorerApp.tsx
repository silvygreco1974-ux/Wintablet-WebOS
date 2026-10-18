import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
  Trash2,
  Download,
  Plus,
  Search,
  HardDrive,
  Grid,
  List as ListIcon,
  Clock,
  Database,
  ExternalLink,
} from 'lucide-react';
import { CustomWebApp, StickyNote, VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';

interface FileExplorerAppProps {
  files: VirtualFile[];
  stickyNotes: StickyNote[];
  webApps: CustomWebApp[];
  onOpenFile: (file: VirtualFile) => void;
  onDeleteFile: (id: string) => void;
  onOpenStickyNotes: () => void;
  onOpenWebLauncher: () => void;
  onNewFile: (type: 'doc' | 'code') => void;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({
  files,
  stickyNotes,
  webApps,
  onOpenFile,
  onDeleteFile,
  onOpenStickyNotes,
  onOpenWebLauncher,
  onNewFile,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'docs' | 'code' | 'notes' | 'web'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const filteredFiles = files.filter((f) => {
    const matchesSection =
      activeSection === 'all' ||
      (activeSection === 'docs' && f.type === 'doc') ||
      (activeSection === 'code' && f.type === 'code');
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  const handleDownload = (file: VirtualFile) => {
    sound.playClick();
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-60 sm:w-68 border-r border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-300 dark:border-slate-800 flex items-center gap-2.5">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">Questo PC (Disco)</span>
        </div>

        <div className="p-2 space-y-1 flex-1 overflow-y-auto text-sm">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('all');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              activeSection === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>Tutti i Documenti</span>
            </div>
            <span className="text-xs opacity-80">{files.length}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('docs');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              activeSection === 'docs'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-sky-500" />
              <span>Documenti di Testo</span>
            </div>
            <span className="text-xs opacity-80">{files.filter((f) => f.type === 'doc').length}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('code');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              activeSection === 'code'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span>Script & Codice</span>
            </div>
            <span className="text-xs opacity-80">{files.filter((f) => f.type === 'code').length}</span>
          </button>

          <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
            <span className="px-3 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Collegamenti
            </span>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('notes');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeSection === 'notes'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StickyIcon className="w-4 h-4 text-amber-500" />
                <span>Sticky Notes</span>
              </div>
              <span className="text-xs opacity-80">{stickyNotes.length}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveSection('web');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeSection === 'web'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>Web App & Link</span>
              </div>
              <span className="text-xs opacity-80">{webApps.length}</span>
            </button>
          </div>
        </div>

        {/* Disk Info Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between mb-1.5 font-bold">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-blue-500" /> Spazio File
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">{(totalBytes / 1024).toFixed(1)} KB</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(3, (totalBytes / (5 * 1024 * 1024)) * 100))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero ingombro di memoria sul tablet</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Explorer Top Toolbar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 flex items-center justify-between gap-2 text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewFile('doc')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Testo</span>
            </button>
            <button
              onClick={() => onNewFile('code')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Codice</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow' : 'text-slate-500'}`}
                title="Griglia"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow' : 'text-slate-500'}`}
                title="Lista"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Files Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeSection === 'notes' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Sticky Notes Salvate ({stickyNotes.length})
                </h3>
                <button
                  onClick={onOpenStickyNotes}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Apri Sticky Notes</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stickyNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={onOpenStickyNotes}
                    className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-2xl cursor-pointer transition-all shadow-sm"
                  >
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-1">{n.title}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSection === 'web' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Web App Salvaspazio ({webApps.length})
                </h3>
                <button
                  onClick={onOpenWebLauncher}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Apri Web Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {webApps.map((a) => (
                  <div
                    key={a.id}
                    onClick={onOpenWebLauncher}
                    className="p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-all flex items-center gap-3 shadow-sm"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0 shadow-md"
                      style={{ backgroundColor: a.iconColor }}
                    >
                      {a.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{a.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Folder className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nessun file presente in questa sezione.</p>
              <p className="text-xs text-slate-500 mt-1">Usa i pulsanti in alto per creare un nuovo documento o file di codice!</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredFiles.map((f) => {
                const isDoc = f.type === 'doc';
                const isSel = selectedFileId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedFileId(f.id);
                    }}
                    onDoubleClick={() => onOpenFile(f)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer group shadow-sm ${
                      isSel
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-inner">
                      {isDoc ? (
                        <FileText className="w-7 h-7 text-blue-600" />
                      ) : (
                        <FileCode className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate w-full" title={f.name}>
                      {f.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      {(f.size / 1024).toFixed(1)} KB
                    </span>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFile(f);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                        title="Apri file"
                      >
                        Apri
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(f);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-black dark:hover:text-white"
                        title="Scarica su tablet"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClose();
                          onDeleteFile(f.id);
                        }}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg text-rose-500"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold text-xs">
                    <th className="p-3">Nome</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Dimensione</th>
                    <th className="p-3">Ultima Modifica</th>
                    <th className="p-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredFiles.map((f) => (
                    <tr
                      key={f.id}
                      onClick={() => onOpenFile(f)}
                      className="hover:bg-blue-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="p-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                        {f.type === 'doc' ? (
                          <FileText className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileCode className="w-4 h-4 text-emerald-500" />
                        )}
                        <span>{f.name}</span>
                      </td>
                      <td className="p-3 text-slate-500 capitalize">{f.type === 'doc' ? 'Documento' : 'Codice'}</td>
                      <td className="p-3 font-mono text-slate-500">{(f.size / 1024).toFixed(1)} KB</td>
                      <td className="p-3 text-slate-500">{new Date(f.updatedAt).toLocaleDateString('it-IT')}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFile(f);
                          }}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold mr-2"
                        >
                          Apri
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
