import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Pin,
  PinOff,
  Palette,
  Search,
  Check,
  StickyNote as StickyIcon,
  Move,
  ExternalLink,
} from 'lucide-react';
import { StickyNote } from '../../types/os';
import { sound } from '../../utils/audio';

interface StickyNotesAppProps {
  notes: StickyNote[];
  onUpdateNotes: (notes: StickyNote[]) => void;
  onOpenDesktopNote?: (noteId: string) => void;
}

const COLOR_MAP: Record<
  StickyNote['color'],
  { bg: string; border: string; text: string; header: string; label: string; dot: string }
> = {
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-950 dark:text-amber-100',
    header: 'bg-amber-300 dark:bg-amber-900',
    label: 'Giallo Sole',
    dot: 'bg-amber-400',
  },
  blue: {
    bg: 'bg-sky-100 dark:bg-sky-950',
    border: 'border-sky-400 dark:border-sky-600',
    text: 'text-sky-950 dark:text-sky-100',
    header: 'bg-sky-300 dark:bg-sky-900',
    label: 'Azzurro Cielo',
    dot: 'bg-sky-400',
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    border: 'border-emerald-400 dark:border-emerald-600',
    text: 'text-emerald-950 dark:text-emerald-100',
    header: 'bg-emerald-300 dark:bg-emerald-900',
    label: 'Verde Menta',
    dot: 'bg-emerald-400',
  },
  pink: {
    bg: 'bg-rose-100 dark:bg-rose-950',
    border: 'border-rose-400 dark:border-rose-600',
    text: 'text-rose-950 dark:text-rose-100',
    header: 'bg-rose-300 dark:bg-rose-900',
    label: 'Rosa Corallo',
    dot: 'bg-rose-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-950 dark:text-purple-100',
    header: 'bg-purple-300 dark:bg-purple-900',
    label: 'Lavanda',
    dot: 'bg-purple-400',
  },
  slate: {
    bg: 'bg-slate-200 dark:bg-slate-800',
    border: 'border-slate-400 dark:border-slate-600',
    text: 'text-slate-900 dark:text-slate-100',
    header: 'bg-slate-300 dark:bg-slate-700',
    label: 'Carbone',
    dot: 'bg-slate-400',
  },
};

export const StickyNotesApp: React.FC<StickyNotesAppProps> = ({
  notes,
  onUpdateNotes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    notes.length > 0 ? notes[0].id : ''
  );

  const handleCreateNote = (color: StickyNote['color'] = 'yellow') => {
    sound.playOpen();
    const newNote: StickyNote = {
      id: `sticky-${Date.now()}`,
      title: 'Nuova Nota',
      content: '',
      color,
      position: { x: 60 + (notes.length % 4) * 45, y: 60 + (notes.length % 4) * 35 },
      size: { width: 280, height: 240 },
      isPinnedOnDesktop: true,
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    onUpdateNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<StickyNote>) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    onUpdateNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    sound.playClose();
    const updated = notes.filter((n) => n.id !== id);
    onUpdateNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Sidebar: Notes List - High Contrast */}
      <div className="w-72 sm:w-80 border-r border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg text-white shadow-sm">
              <StickyIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Sticky Notes</h2>
          </div>
          <button
            onClick={() => handleCreateNote('yellow')}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl text-xs font-black transition-all shadow-sm"
            title="Crea nuova sticky note"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca nelle note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* List of Notes */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              Nessuna nota trovata. Clicca <strong>+ Nuova</strong> per crearne una!
            </div>
          ) : (
            filteredNotes.map((note) => {
              const col = COLOR_MAP[note.color] || COLOR_MAP.yellow;
              const isSelected = note.id === selectedNoteId;

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-md scale-[1.01]'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${col.dot}`} />
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {note.title || 'Senza titolo'}
                      </span>
                    </div>

                    {note.isPinnedOnDesktop && (
                      <span className="text-[10px] bg-amber-400/20 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        Desktop
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content || '(Vuota)'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Active Note View & Editor - Large 16px Font */}
      {activeNote ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
          {/* Top Bar for Note */}
          <div className="flex items-center justify-between p-3 border-b border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                placeholder="Titolo nota..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Color Picker */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                {(Object.keys(COLOR_MAP) as StickyNote['color'][]).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleUpdateNote(activeNote.id, { color: c })}
                    className={`w-6 h-6 rounded-lg ${COLOR_MAP[c].dot} transition-transform hover:scale-110 flex items-center justify-center`}
                    title={COLOR_MAP[c].label}
                  >
                    {activeNote.color === c && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </div>

              {/* Pin to Desktop Toggle */}
              <button
                onClick={() => {
                  sound.playClick();
                  handleUpdateNote(activeNote.id, { isPinnedOnDesktop: !activeNote.isPinnedOnDesktop });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeNote.isPinnedOnDesktop
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
                title="Mostra o nascondi questa nota direttamente sul Desktop"
              >
                {activeNote.isPinnedOnDesktop ? (
                  <>
                    <Pin className="w-3.5 h-3.5" />
                    <span>Sul Desktop</span>
                  </>
                ) : (
                  <>
                    <PinOff className="w-3.5 h-3.5" />
                    <span>Metti sul Desktop</span>
                  </>
                )}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                title="Elimina nota"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Note Big Writing Area */}
          <div className="flex-1 p-6 flex flex-col">
            <div
              className={`flex-1 rounded-2xl border-2 p-5 flex flex-col shadow-inner transition-colors ${
                COLOR_MAP[activeNote.color]?.bg || 'bg-amber-100'
              } ${COLOR_MAP[activeNote.color]?.border || 'border-amber-400'}`}
            >
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
                placeholder="Scrivi qui i tuoi appunti, promemoria o idee..."
                className={`w-full flex-1 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed ${
                  COLOR_MAP[activeNote.color]?.text || 'text-amber-950'
                }`}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <StickyIcon className="w-16 h-16 mb-4 text-amber-400 opacity-60" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nessuna nota selezionata</h3>
          <p className="text-sm mt-1 max-w-sm">Crea una nuova nota o selezionala dall'elenco a sinistra per visualizzarla o modificarla.</p>
        </div>
      )}
    </div>
  );
};
