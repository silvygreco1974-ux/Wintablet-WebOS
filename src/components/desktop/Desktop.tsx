import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
  HardDrive,
  Sliders,
  Calculator,
  Sparkles,
  Tablet,
  X,
  ExternalLink,
  Move,
  Sun,
  Moon,
  Plus,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppId, CustomWebApp, StickyNote, SystemSettings } from '../../types/os';
import { sound } from '../../utils/audio';

interface DesktopProps {
  settings: SystemSettings;
  webApps: CustomWebApp[];
  stickyNotes: StickyNote[];
  onOpenApp: (appId: AppId) => void;
  onLaunchWebApp: (app: CustomWebApp) => void;
  onUpdateStickyNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteStickyNote: (id: string) => void;
  onCreateStickyNote: () => void;
  onCreateNewFile: (type: 'doc' | 'code') => void;
  onOpenSettings: () => void;
  onToggleTabletMode: () => void;
  onToggleTheme: () => void;
}

const COLOR_MAP: Record<
  StickyNote['color'],
  { bg: string; border: string; text: string; header: string; tag: string }
> = {
  yellow: {
    bg: 'bg-[#FFFBEB] dark:bg-amber-950',
    border: 'border-amber-400 dark:border-amber-600',
    text: 'text-amber-950 dark:text-amber-100',
    header: 'bg-amber-300 dark:bg-amber-800 text-amber-950 dark:text-amber-100',
    tag: 'bg-amber-200 text-amber-900',
  },
  blue: {
    bg: 'bg-[#EFF6FF] dark:bg-sky-950',
    border: 'border-sky-400 dark:border-sky-600',
    text: 'text-sky-950 dark:text-sky-100',
    header: 'bg-sky-300 dark:bg-sky-800 text-sky-950 dark:text-sky-100',
    tag: 'bg-sky-200 text-sky-900',
  },
  green: {
    bg: 'bg-[#ECFDF5] dark:bg-emerald-950',
    border: 'border-emerald-400 dark:border-emerald-600',
    text: 'text-emerald-950 dark:text-emerald-100',
    header: 'bg-emerald-300 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100',
    tag: 'bg-emerald-200 text-emerald-900',
  },
  pink: {
    bg: 'bg-[#FFF1F2] dark:bg-rose-950',
    border: 'border-rose-400 dark:border-rose-600',
    text: 'text-rose-950 dark:text-rose-100',
    header: 'bg-rose-300 dark:bg-rose-800 text-rose-950 dark:text-rose-100',
    tag: 'bg-rose-200 text-rose-900',
  },
  purple: {
    bg: 'bg-[#FAF5FF] dark:bg-purple-950',
    border: 'border-purple-400 dark:border-purple-600',
    text: 'text-purple-950 dark:text-purple-100',
    header: 'bg-purple-300 dark:bg-purple-800 text-purple-950 dark:text-purple-100',
    tag: 'bg-purple-200 text-purple-900',
  },
  slate: {
    bg: 'bg-[#F8FAFC] dark:bg-slate-900',
    border: 'border-slate-400 dark:border-slate-600',
    text: 'text-slate-950 dark:text-slate-100',
    header: 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100',
    tag: 'bg-slate-200 text-slate-800',
  },
};

export const Desktop: React.FC<DesktopProps> = ({
  settings,
  webApps,
  stickyNotes,
  onOpenApp,
  onLaunchWebApp,
  onUpdateStickyNote,
  onDeleteStickyNote,
  onCreateStickyNote,
  onCreateNewFile,
  onOpenSettings,
  onToggleTabletMode,
  onToggleTheme,
}) => {
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  // Lock icons toggle prevents accidental sliding on touch
  const [isIconsLocked, setIsIconsLocked] = useState<boolean>(true);

  // Core desktop icons definition with vibrant colors
  const coreApps = [
    {
      id: 'text-editor',
      name: 'Editor Testo',
      icon: <FileText className="w-8 h-8 text-white" />,
      color: '#2563eb',
      glow: 'shadow-blue-500/50',
    },
    {
      id: 'code-editor',
      name: 'Editor Codice',
      icon: <FileCode className="w-8 h-8 text-white" />,
      color: '#059669',
      glow: 'shadow-emerald-500/50',
    },
    {
      id: 'sticky-notes',
      name: 'Sticky Notes',
      icon: <StickyIcon className="w-8 h-8 text-white" />,
      color: '#d97706',
      glow: 'shadow-amber-500/50',
    },
    {
      id: 'web-launcher',
      name: 'Web Hub',
      icon: <Globe className="w-8 h-8 text-white" />,
      color: '#0284c7',
      glow: 'shadow-sky-500/50',
    },
    {
      id: 'file-explorer',
      name: 'Questo PC',
      icon: <HardDrive className="w-8 h-8 text-white" />,
      color: '#4f46e5',
      glow: 'shadow-indigo-500/50',
    },
    {
      id: 'storage-manager',
      name: 'Memoria Tablet',
      icon: <Sparkles className="w-8 h-8 text-white" />,
      color: '#7c3aed',
      glow: 'shadow-purple-500/50',
    },
    {
      id: 'calculator',
      name: 'Calcolatrice',
      icon: <Calculator className="w-8 h-8 text-white" />,
      color: '#e11d48',
      glow: 'shadow-rose-500/50',
    },
    {
      id: 'settings',
      name: 'Impostazioni',
      icon: <Sliders className="w-8 h-8 text-white" />,
      color: '#475569',
      glow: 'shadow-slate-500/50',
    },
  ];

  const pinnedWebApps = webApps.filter((w) => w.isPinnedDesktop !== false);

  // Grid layout calculator for orderly icons
  const getGridPos = (index: number) => {
    const col = Math.floor(index / 5);
    const row = index % 5;
    return { x: 24 + col * 115, y: 30 + row * 115 };
  };

  // Draggable icon positions state
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('win_tablet_icon_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, { x: number; y: number }> = {};
    coreApps.forEach((app, idx) => {
      initial[app.id] = getGridPos(idx);
    });
    return initial;
  });

  const saveIconPositions = (next: Record<string, { x: number; y: number }>) => {
    setIconPositions(next);
    try {
      localStorage.setItem('win_tablet_icon_pos', JSON.stringify(next));
    } catch {}
  };

  const handleResetIconGrid = () => {
    sound.playClick();
    const next: Record<string, { x: number; y: number }> = {};
    coreApps.forEach((app, idx) => {
      next[app.id] = getGridPos(idx);
    });
    pinnedWebApps.forEach((w, idx) => {
      next[`web-${w.id}`] = getGridPos(coreApps.length + idx);
    });
    saveIconPositions(next);
  };

  // Safe icon click / drag handler:
  // If user taps, it OPENS immediately. Only if dragged beyond 25px in unlocked mode does it move!
  const handleIconPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    iconId: string,
    onOpen: () => void
  ) => {
    setSelectedIconId(iconId);
    const startX = e.clientX;
    const startY = e.clientY;
    const currentPos = iconPositions[iconId] || { x: 24, y: 30 };
    const initialX = currentPos.x;
    const initialY = currentPos.y;
    let didDrag = false;

    // If icons are locked, clicking or tapping immediately opens the app on release!
    const target = e.currentTarget;

    const onPointerMove = (moveEv: PointerEvent) => {
      if (isIconsLocked) return; // Prevent movement when locked!

      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      // Only enter drag mode if moved more than 25px
      if (Math.abs(dx) > 25 || Math.abs(dy) > 25) {
        didDrag = true;
        const nextX = Math.max(10, Math.min(window.innerWidth - 100, initialX + dx));
        const nextY = Math.max(10, Math.min(window.innerHeight - 140, initialY + dy));
        setIconPositions((prev) => ({
          ...prev,
          [iconId]: { x: nextX, y: nextY },
        }));
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (!didDrag) {
        // Normal Tap or Click -> Open App!
        sound.playOpen();
        onOpen();
      } else {
        saveIconPositions(iconPositions);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Rock-solid Sticky Note Dragging with Pointer Capture
  const handleNoteDragStart = (
    e: React.PointerEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    // Only drag from drag handle or header background, not buttons or inputs
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const noteX = note.position.x;
    const noteY = note.position.y;
    const target = e.currentTarget;

    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 290, noteX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 260, noteY + dy));
      onUpdateStickyNote(note.id, { position: { x: newX, y: newY } });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      try {
        target.releasePointerCapture(upEv.pointerId);
      } catch {}
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
      target.removeEventListener('pointercancel', onPointerUp);
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
    target.addEventListener('pointercancel', onPointerUp);
  };

  // Nudge sticky note by arrows (ultra easy on tablet)
  const nudgeStickyNote = (id: string, dx: number, dy: number, note: StickyNote) => {
    sound.playClick();
    const newX = Math.max(10, Math.min(window.innerWidth - 290, note.position.x + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 260, note.position.y + dy));
    onUpdateStickyNote(id, { position: { x: newX, y: newY } });
  };

  // Only open context menu on explicit mouse right-click (button === 2).
  // Touch events are completely blocked from opening accidental context menu!
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ignore touch-based contextmenu triggers to stop unexpected popups
    if ((e.nativeEvent as any).pointerType === 'touch') {
      return;
    }
    sound.playClick();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 260),
      y: Math.min(e.clientY, window.innerHeight - 280),
    });
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIconId(null);
      setContextMenu(null);
    }
  };

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="absolute inset-0 overflow-hidden select-none bg-slate-100 dark:bg-slate-950"
      style={{
        backgroundImage: `url(${settings.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `brightness(${settings.brightness / 100})`,
      }}
    >
      {/* Top Quick Controls Bar - High Contrast, Big Tablet Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
        {/* Lock/Unlock Desktop Icons to prevent moving by mistake */}
        <button
          onClick={() => {
            sound.playClick();
            setIsIconsLocked(!isIconsLocked);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md border shadow-md text-sm font-bold transition-all ${
            isIconsLocked
              ? 'bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100'
              : 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse'
          }`}
          title={isIconsLocked ? 'Icone bloccate (tocca per sbloccare spostamento)' : 'Icone sbloccate (trascina liberamente)'}
        >
          {isIconsLocked ? <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-950" />}
          <span className="hidden sm:inline">{isIconsLocked ? 'Icone Fisse' : 'Sposta Icone'}</span>
        </button>

        {/* Re-align in clean grid */}
        {!isIconsLocked && (
          <button
            onClick={handleResetIconGrid}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white shadow-md text-xs font-bold hover:bg-blue-500 transition-all"
            title="Allinea in griglia ordinata"
          >
            <span>Allinea Griglia</span>
          </button>
        )}

        {/* Clear Light / Dark Mode Switcher */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleTheme();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 shadow-lg text-sm font-extrabold text-slate-900 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all"
          title="Alterna Tema Chiaro / Scuro"
        >
          {settings.theme === 'light' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>☀️ Tema Chiaro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span>🌙 Tema Scuro</span>
            </>
          )}
        </button>

        {/* New Sticky Note */}
        <button
          onClick={() => {
            sound.playClick();
            onCreateStickyNote();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black shadow-lg text-sm transition-all hover:scale-105"
          title="Aggiungi una nuova Sticky Note sul desktop"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nota</span>
        </button>

        {/* Desktop Menu button for tablet touch */}
        <button
          onClick={(e) => {
            sound.playClick();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu({ x: Math.max(10, rect.left - 180), y: rect.bottom + 8 });
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-md text-xs font-bold hover:scale-105 transition-all"
          title="Opzioni desktop"
        >
          <Sliders className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">Opzioni</span>
        </button>
      </div>

      {/* Desktop App Icons - Tapping immediately opens; no accidental moves! */}
      {coreApps.map((app, index) => {
        const isSelected = selectedIconId === app.id;
        const pos = isIconsLocked
          ? getGridPos(index)
          : iconPositions[app.id] || getGridPos(index);

        return (
          <div
            key={app.id}
            onPointerDown={(e) =>
              handleIconPointerDown(e, app.id, () => onOpenApp(app.id as AppId))
            }
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              touchAction: isIconsLocked ? 'auto' : 'none',
            }}
            className={`w-24 p-2.5 rounded-2xl flex flex-col items-center text-center select-none cursor-pointer active:scale-95 transition-all z-10 ${
              isSelected
                ? 'bg-blue-600/35 backdrop-blur-md ring-2 ring-blue-400 shadow-2xl scale-105'
                : 'hover:bg-white/25 dark:hover:bg-black/25'
            }`}
            title={`${app.name} (Tocca per aprire)`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/40 transition-transform ${app.glow}`}
              style={{ backgroundColor: app.color }}
            >
              {app.icon}
            </div>
            <span className="text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-2 leading-tight truncate w-full tracking-wide">
              {app.name}
            </span>
          </div>
        );
      })}

      {/* Pinned Custom Web Apps */}
      {pinnedWebApps.map((w, index) => {
        const isSelected = selectedIconId === `web-${w.id}`;
        const offsetIndex = coreApps.length + index;
        const pos = isIconsLocked
          ? getGridPos(offsetIndex)
          : iconPositions[`web-${w.id}`] || getGridPos(offsetIndex);

        return (
          <div
            key={w.id}
            onPointerDown={(e) =>
              handleIconPointerDown(e, `web-${w.id}`, () => onLaunchWebApp(w))
            }
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              touchAction: isIconsLocked ? 'auto' : 'none',
            }}
            className={`w-24 p-2.5 rounded-2xl flex flex-col items-center text-center select-none cursor-pointer active:scale-95 transition-all z-10 ${
              isSelected
                ? 'bg-blue-600/35 backdrop-blur-md ring-2 ring-blue-400 shadow-2xl scale-105'
                : 'hover:bg-white/25 dark:hover:bg-black/25'
            }`}
            title={`${w.name} (Tocca per aprire)`}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg border-2 border-white/40"
              style={{ backgroundColor: w.iconColor }}
            >
              {w.name.charAt(0)}
            </div>
            <span className="text-xs font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-2 leading-tight truncate w-full tracking-wide">
              {w.name}
            </span>
          </div>
        );
      })}

      {/* Floating Desktop Sticky Notes - 100% Movable with Dedicated Handle + Touch Nudge Controls */}
      {stickyNotes
        .filter((n) => n.isPinnedOnDesktop)
        .map((note) => {
          const col = COLOR_MAP[note.color] || COLOR_MAP.yellow;
          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: `${note.position.y}px`,
                left: `${note.position.x}px`,
                width: `${Math.max(280, note.size.width)}px`,
                minHeight: '250px',
                zIndex: 25,
              }}
              className={`rounded-2xl border-2 shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col select-text ${col.bg} ${col.border}`}
            >
              {/* Note Header: Clean, Dedicated Drag Bar with Big Move Handle */}
              <div
                onPointerDown={(e) => handleNoteDragStart(e, note)}
                className={`px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none border-b border-black/10 ${col.header}`}
                style={{ touchAction: 'none' }}
              >
                {/* Drag Handle with Text */}
                <div className="flex items-center gap-1.5 font-bold text-xs shrink-0 cursor-grab px-1 py-0.5 rounded bg-black/10">
                  <Move className="w-3.5 h-3.5" />
                  <span>Trascina</span>
                </div>

                {/* Touch Nudge Arrows for instant tablet movement */}
                <div className="flex items-center gap-0.5 bg-black/10 rounded px-1 py-0.5">
                  <button
                    onClick={() => nudgeStickyNote(note.id, -40, 0, note)}
                    className="p-1 hover:bg-black/20 rounded text-current"
                    title="Sposta a Sinistra"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeStickyNote(note.id, 0, -40, note)}
                    className="p-1 hover:bg-black/20 rounded text-current"
                    title="Sposta in Alto"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeStickyNote(note.id, 0, 40, note)}
                    className="p-1 hover:bg-black/20 rounded text-current"
                    title="Sposta in Basso"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeStickyNote(note.id, 40, 0, note)}
                    className="p-1 hover:bg-black/20 rounded text-current"
                    title="Sposta a Destra"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenApp('sticky-notes');
                    }}
                    className="p-1 hover:bg-black/15 rounded text-current"
                    title="Apri gestione Sticky Notes"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      sound.playClose();
                      onUpdateStickyNote(note.id, { isPinnedOnDesktop: false });
                    }}
                    className="p-1 hover:bg-black/15 rounded text-current"
                    title="Nascondi dal desktop"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Title Input Bar */}
              <div className="px-3 pt-2.5">
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => onUpdateStickyNote(note.id, { title: e.target.value })}
                  placeholder="Titolo nota..."
                  className={`w-full bg-transparent font-extrabold text-base focus:outline-none border-b border-black/10 pb-1 ${col.text}`}
                />
              </div>

              {/* Note Content - Large 16px Font with Great Contrast */}
              <div className="p-3.5 flex-1 flex flex-col">
                <textarea
                  value={note.content}
                  onChange={(e) => onUpdateStickyNote(note.id, { content: e.target.value })}
                  placeholder="Scrivi qui gli appunti..."
                  className={`w-full flex-1 bg-transparent resize-none focus:outline-none text-base font-semibold leading-relaxed ${col.text}`}
                  rows={5}
                />
              </div>
            </div>
          );
        })}

      {/* Desktop Context Menu (Only when triggered via right mouse button or Opzioni button) */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 w-64 text-sm font-bold text-slate-800 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-1.5 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">
            Azioni Desktop
          </div>

          <button
            onClick={() => {
              onCreateNewFile('doc');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Nuovo Documento Testo</span>
          </button>

          <button
            onClick={() => {
              onCreateNewFile('code');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Nuovo File Codice</span>
          </button>

          <button
            onClick={() => {
              onCreateStickyNote();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <StickyIcon className="w-4 h-4 text-amber-500" />
            <span>Nuova Sticky Note</span>
          </button>

          <button
            onClick={() => {
              onOpenApp('web-launcher');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Globe className="w-4 h-4 text-cyan-600" />
            <span>Aggiungi Web App...</span>
          </button>

          <div className="border-t border-slate-200 dark:border-slate-800 my-1.5" />

          <button
            onClick={() => {
              onToggleTheme();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            {settings.theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-slate-500" />
                <span>Passa a Tema Scuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Passa a Tema Chiaro</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onToggleTabletMode();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Tablet className="w-4 h-4 text-blue-600" />
            <span>{settings.tabletMode ? 'Disattiva Modalità Tablet' : 'Attiva Modalità Tablet'}</span>
          </button>

          <button
            onClick={() => {
              handleResetIconGrid();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Riorganizza Griglia Icone</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Personalizza Sfondo & Colori</span>
          </button>
        </div>
      )}
    </div>
  );
};
