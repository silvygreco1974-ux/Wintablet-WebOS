import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  Layers,
  Laptop,
  Compass,
  Bookmark,
  Share2,
} from 'lucide-react';
import { CustomWebApp } from '../../types/os';
import { sound } from '../../utils/audio';

interface WebLauncherAppProps {
  webApps: CustomWebApp[];
  onUpdateWebApps: (apps: CustomWebApp[]) => void;
  onLaunchWebApp: (app: CustomWebApp) => void;
}

const PRESET_POPULAR_APPS = [
  {
    name: 'Notion',
    url: 'https://www.notion.so',
    iconName: 'Bookmark',
    iconColor: '#000000',
    category: 'Produttività' as const,
    displayMode: 'new_tab' as const,
    description: 'Note, compiti e documenti collaborativi',
  },
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    iconName: 'Sparkles',
    iconColor: '#10b981',
    category: 'Produttività' as const,
    displayMode: 'new_tab' as const,
    description: 'Assistente e chat AI',
  },
  {
    name: 'Canva',
    url: 'https://www.canva.com',
    iconName: 'Layers',
    iconColor: '#06b6d4',
    category: 'Grafica & Design' as const,
    displayMode: 'new_tab' as const,
    description: 'Design grafico e presentazioni',
  },
  {
    name: 'DeepL Traduttore',
    url: 'https://www.deepl.com/translator',
    iconName: 'Globe',
    iconColor: '#0284c7',
    category: 'Strumenti' as const,
    displayMode: 'window' as const,
    description: 'Traduzioni accurate e istantanee',
  },
  {
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    iconName: 'Laptop',
    iconColor: '#a855f7',
    category: 'Strumenti' as const,
    displayMode: 'window' as const,
    description: 'Lavagna virtuale a mano libera',
  },
  {
    name: 'Spotify Web Player',
    url: 'https://open.spotify.com',
    iconName: 'Share2',
    iconColor: '#22c55e',
    category: 'Social' as const,
    displayMode: 'new_tab' as const,
    description: 'Musica e podcast in streaming',
  },
  {
    name: 'Overleaf LaTeX',
    url: 'https://www.overleaf.com',
    iconName: 'Bookmark',
    iconColor: '#15803d',
    category: 'Studio' as const,
    displayMode: 'new_tab' as const,
    description: 'Editor accademico e scientifico LaTeX online',
  },
  {
    name: 'Photopea',
    url: 'https://www.photopea.com',
    iconName: 'Layers',
    iconColor: '#0ea5e9',
    category: 'Grafica & Design' as const,
    displayMode: 'window' as const,
    description: 'Editor di immagini PSD/RAW senza installazione',
  },
];

const CATEGORIES = [
  'Tutte',
  'Produttività',
  'Strumenti',
  'Sviluppo',
  'Studio',
  'Grafica & Design',
  'Social',
  'Altro',
];

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const WebLauncherApp: React.FC<WebLauncherAppProps> = ({
  webApps,
  onUpdateWebApps,
  onLaunchWebApp,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutte');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: 'https://',
    category: 'Produttività' as CustomWebApp['category'],
    displayMode: 'window' as 'window' | 'new_tab',
    iconColor: '#3b82f6',
    description: '',
    isPinnedDesktop: true,
    isPinnedTaskbar: false,
  });

  const handleOpenAddModal = () => {
    sound.playClick();
    setEditingAppId(null);
    setFormData({
      name: '',
      url: 'https://',
      category: 'Produttività',
      displayMode: 'window',
      iconColor: '#3b82f6',
      description: '',
      isPinnedDesktop: true,
      isPinnedTaskbar: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: CustomWebApp) => {
    sound.playClick();
    setEditingAppId(app.id);
    setFormData({
      name: app.name,
      url: app.url,
      category: app.category,
      displayMode: app.displayMode,
      iconColor: app.iconColor || '#3b82f6',
      description: app.description || '',
      isPinnedDesktop: app.isPinnedDesktop ?? true,
      isPinnedTaskbar: app.isPinnedTaskbar ?? false,
    });
    setIsModalOpen(true);
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playNotification();

    let cleanUrl = formData.url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (editingAppId) {
      // Edit existing
      const updated = webApps.map((a) =>
        a.id === editingAppId
          ? {
              ...a,
              name: formData.name.trim() || a.name,
              url: cleanUrl,
              category: formData.category,
              displayMode: formData.displayMode,
              iconColor: formData.iconColor,
              description: formData.description.trim(),
              isPinnedDesktop: formData.isPinnedDesktop,
              isPinnedTaskbar: formData.isPinnedTaskbar,
            }
          : a
      );
      onUpdateWebApps(updated);
    } else {
      // Add new
      const newApp: CustomWebApp = {
        id: `web-${Date.now()}`,
        name: formData.name.trim() || 'Nuova Web App',
        url: cleanUrl,
        iconName: 'Globe',
        iconColor: formData.iconColor,
        category: formData.category,
        displayMode: formData.displayMode,
        description: formData.description.trim() || 'Link esterno salvato',
        isPinnedDesktop: formData.isPinnedDesktop,
        isPinnedTaskbar: formData.isPinnedTaskbar,
      };
      onUpdateWebApps([newApp, ...webApps]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteApp = (id: string) => {
    sound.playClose();
    onUpdateWebApps(webApps.filter((a) => a.id !== id));
  };

  const handleAddPreset = (preset: typeof PRESET_POPULAR_APPS[0]) => {
    sound.playNotification();
    const exists = webApps.some((a) => a.url.toLowerCase() === preset.url.toLowerCase());
    if (exists) {
      alert(`"${preset.name}" è già presente nelle tue Web App!`);
      return;
    }
    const newApp: CustomWebApp = {
      id: `web-${Date.now()}`,
      name: preset.name,
      url: preset.url,
      iconName: preset.iconName,
      iconColor: preset.iconColor,
      category: preset.category,
      displayMode: preset.displayMode,
      description: preset.description,
      isPinnedDesktop: true,
      isPinnedTaskbar: false,
    };
    onUpdateWebApps([newApp, ...webApps]);
  };

  const filteredApps = webApps.filter((app) => {
    const matchesCategory = selectedCategory === 'Tutte' || app.category === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-cyan-600" />
            <span>Web Hub & Launcher</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Aggiungi i tuoi siti e servizi web preferiti: zero memoria occupata sul tablet!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Web App</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-68">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per nome o URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Installed Web Apps Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Le Mie Applicazioni Web ({filteredApps.length})
            </h2>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
              <Compass className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nessuna web app trovata</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Clicca su "Aggiungi Web App" o scegli uno dei preset consigliati qui sotto per iniziare.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-lg shrink-0 shadow-md"
                      style={{ backgroundColor: app.iconColor || '#3b82f6' }}
                    >
                      {app.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                        {app.url.replace(/^https?:\/\//, '')}
                      </p>
                      {app.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 font-medium">
                          {app.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {app.category}
                      </span>
                      {app.displayMode === 'window' ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Finestra</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Nuova scheda</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(app)}
                        className="p-1.5 text-slate-500 hover:text-black dark:hover:text-white rounded-lg"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg"
                        title="Rimuovi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onLaunchWebApp(app)}
                        className="flex items-center gap-1 ml-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                        title="Apri app"
                      >
                        <span>Apri</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Presets 1-Click Catalog */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Aggiungi Rapido con 1-Click (Strumenti Consigliati)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_POPULAR_APPS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleAddPreset(preset)}
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-xl p-3 text-left transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{preset.name}</span>
                    <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{preset.description}</p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-slate-400">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Web App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span>{editingAppId ? 'Modifica Web App' : 'Aggiungi Nuova Web App'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white font-bold">
                ✕
              </button>
            </h3>

            <form onSubmit={handleSaveApp} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nome Applicazione</label>
                <input
                  type="text"
                  required
                  placeholder="es. Photopea, Notion, WhatsApp Web"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Indirizzo Web (URL)</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CustomWebApp['category'] })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'Tutte').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Apertura</label>
                  <select
                    value={formData.displayMode}
                    onChange={(e) =>
                      setFormData({ ...formData, displayMode: e.target.value as 'window' | 'new_tab' })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="window">Finestra WebOS</option>
                    <option value="new_tab">Nuova scheda browser</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Colore Icona</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormData({ ...formData, iconColor: col })}
                      className={`w-7 h-7 rounded-xl transition-transform ${
                        formData.iconColor === col ? 'scale-110 ring-2 ring-black dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.isPinnedDesktop}
                    onChange={(e) => setFormData({ ...formData, isPinnedDesktop: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Mostra icona sul Desktop</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md"
                >
                  Salva Web App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
