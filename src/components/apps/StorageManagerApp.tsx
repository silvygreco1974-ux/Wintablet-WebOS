import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
} from 'lucide-react';
import { StorageService } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface StorageManagerAppProps {
  onRefreshAll: () => void;
}

export const StorageManagerApp: React.FC<StorageManagerAppProps> = ({ onRefreshAll }) => {
  const [stats, setStats] = useState(StorageService.getStorageStats());
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const refresh = () => {
    setStats(StorageService.getStorageStats());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleExportBackup = () => {
    sound.playNotification();
    const backupJson = StorageService.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wintablet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        sound.playNotification();
        setImportStatus('Backup ripristinato con successo!');
        onRefreshAll();
        refresh();
      } else {
        setImportStatus('Errore: formato file backup non valido.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    sound.playClick();
    if (confirm('Vuoi davvero ripristinare il sistema allo stato iniziale? I dati attuali verranno reimpostati.')) {
      StorageService.resetAllToDefault();
      onRefreshAll();
      refresh();
      sound.playNotification();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-y-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-2xl shadow-inner backdrop-blur-md">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black flex items-center gap-2">
              <span>Gestione Spazio & Memoria Tablet</span>
              <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                Zero Ingombro
              </span>
            </h1>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed max-w-2xl font-medium">
              Hai pochissimo spazio di memoria sul tuo tablet? WinTablet WebOS risiede interamente nella cache compatta del browser (<strong>meno di 1.5 MB</strong>), salvando oltre 2 GB di spazio che altrimenti andrebbero sprecati con app native!
            </p>
          </div>
        </div>
      </div>

      {/* Main Gauge & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Uso Memoria WebOS
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-600 font-mono">
                {stats.totalKb} <span className="text-lg font-bold text-slate-500">KB</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 5120 KB</span>
            </div>
            <div className="mt-3 w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.max(3, parseFloat(stats.usedPercent))}%` }}
              />
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Memoria libera: {stats.freeKb} KB</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
            Percentuale occupata: <strong className="text-slate-900 dark:text-white">{stats.usedPercent}%</strong>
          </div>
        </div>

        {/* Real Savings Estimate */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Spazio Risparmiato sul tuo Tablet
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Usando questa piattaforma invece di installare app tradizionali, hai risparmiato sul disco del tablet:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Editor Testo</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">- 450 MB</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <FileCode className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Editor Codice</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">- 380 MB</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <StickyIcon className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Sticky Notes</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">- 85 MB</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <Globe className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Web App</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">- 1.2 GB</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Totale spazio salvato:</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-sm">~ 2.1 GB di memoria libera sul tablet</span>
          </div>
        </div>
      </div>

      {/* Backup and Restore Actions */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Backup e Sicurezza Dati
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Puoi salvare tutti i tuoi file, sticky notes e link web in un unico file .json per trasferirlo su Google Drive, chiavetta USB o email.
        </p>

        {importStatus && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-400 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Esporta Backup Completo (.json)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-300 dark:border-slate-700">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Ripristina da Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ripristina Stato Iniziale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
