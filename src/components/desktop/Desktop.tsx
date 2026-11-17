import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
  Sliders,
  Tablet,
  X,
  ExternalLink,
  Sun,
  Moon,
  Lock,
  Unlock,
  Grid,
  Search,
  Image as ImageIcon,
  ArrowRight,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Edit2,
  MoreHorizontal,
} from 'lucide-react';
import { AppId, CustomWebApp, StickyNote, SystemSettings } from '../../types/os';
import { sound } from '../../utils/audio';
import { resolveWallpaperUrl } from '../../utils/wallpapers';
import { SYSTEM_APPS_CATALOG } from '../../utils/appsCatalog';

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
  const [isIconsLocked, setIsIconsLocked] = useState<boolean>(true);
  const [showAllAppsModal, setShowAllAppsModal] = useState<boolean>(false);
  const [appsSearchQuery, setAppsSearchQuery] = useState<string>('');

  // Sticky note dragging live state
  const [activeDraggingNoteId, setActiveDraggingNoteId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  // System apps only appear on Desktop if user explicitly pinned them (they live in Start Menu by default)
  const pinnedDesktopIds = settings.pinnedDesktopApps || [];
  const visibleDesktopSystemApps = SYSTEM_APPS_CATALOG.filter((app) =>
    pinnedDesktopIds.includes(app.id)
  );

  // Pre-installed & user web apps pinned to Desktop
  const pinnedWebApps = webApps.filter((w) => w.isPinnedDesktop !== false);

  // Dynamic grid calculator: Arrange in vertical columns down the left side
  const getGridPos = (index: number) => {
    const availableHeight = typeof window !== 'undefined' ? window.innerHeight - 80 : 600;
    const maxRows = Math.max(6, Math.floor(availableHeight / 96));
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    return { x: 20 + col * 104, y: 24 + row * 94 };
  };

  // Draggable icon positions state
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('win_tablet_icon_pos_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, { x: number; y: number }> = {};
    pinnedWebApps.forEach((w, idx) => {
      initial[`web-${w.id}`] = getGridPos(idx);
    });
    visibleDesktopSystemApps.forEach((app, idx) => {
      initial[app.id] = getGridPos(pinnedWebApps.length + idx);
    });
    return initial;
  });

  const saveIconPositions = (next: Record<string, { x: number; y: number }>) => {
    setIconPositions(next);
    try {
      localStorage.setItem('win_tablet_icon_pos_v3', JSON.stringify(next));
    } catch {}
  };

  const handleResetIconGrid = () => {
    sound.playClick();
    const next: Record<string, { x: number; y: number }> = {};
    pinnedWebApps.forEach((w, idx) => {
      next[`web-${w.id}`] = getGridPos(idx);
    });
    visibleDesktopSystemApps.forEach((app, idx) => {
      next[app.id] = getGridPos(pinnedWebApps.length + idx);
    });
    saveIconPositions(next);
  };

  // Safe icon click / drag handler
  const handleIconPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    iconId: string,
    onOpen: () => void
  ) => {
    setSelectedIconId(iconId);
    const startX = e.clientX;
    const startY = e.clientY;
    const currentPos = iconPositions[iconId] || { x: 20, y: 22 };
    const initialX = currentPos.x;
    const initialY = currentPos.y;
    let didDrag = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      if (isIconsLocked) return;

      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

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

  // STICKY NOTE DRAGGING: Rock-solid window-level listener with touchAction none
  const handleNoteDragStart = (
    e: React.PointerEvent<HTMLDivElement>,
    note: StickyNote
  ) => {
    // Ignore clicks on buttons, inputs or textarea
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;

    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const noteX = note.position.x;
    const noteY = note.position.y;
    setActiveDraggingNoteId(note.id);

    let currentX = noteX;
    let currentY = noteY;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      currentX = Math.max(10, Math.min(window.innerWidth - 300, noteX + dx));
      currentY = Math.max(10, Math.min(window.innerHeight - 270, noteY + dy));
      setDragOffset({ id: note.id, x: currentX, y: currentY });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      setActiveDraggingNoteId(null);
      setDragOffset(null);
      onUpdateStickyNote(note.id, { position: { x: currentX, y: currentY } });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Nudge sticky note by arrows (ultra easy on tablet)
  const nudgeNote = (note: StickyNote, dx: number, dy: number) => {
    sound.playClick();
    const newX = Math.max(10, Math.min(window.innerWidth - 300, note.position.x + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 270, note.position.y + dy));
    onUpdateStickyNote(note.id, { position: { x: newX, y: newY } });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.nativeEvent as any).pointerType === 'touch') {
      return;
    }
    sound.playClick();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 260),
      y: Math.min(e.clientY, window.innerHeight - 340),
    });
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIconId(null);
      setContextMenu(null);
    }
  };

  // Filtered lists for "Tutte le App" drawer
  const allCoreFiltered = SYSTEM_APPS_CATALOG.filter(
    (a) =>
      a.name.toLowerCase().includes(appsSearchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(appsSearchQuery.toLowerCase())
  );
  const allWebFiltered = webApps.filter(
    (w) =>
      w.name.toLowerCase().includes(appsSearchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(appsSearchQuery.toLowerCase())
  );

  const resolvedWallpaper = resolveWallpaperUrl(settings.wallpaper);
  const isGradient = resolvedWallpaper.startsWith('linear-gradient') || resolvedWallpaper.startsWith('radial-gradient');

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="absolute inset-0 overflow-hidden select-none bg-slate-900"
      style={{
        backgroundImage: isGradient ? resolvedWallpaper : `url(${resolvedWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `brightness(${settings.brightness / 100})`,
      }}
    >
      {/* Eye-friendly backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/15 dark:bg-black/35 pointer-events-none" />

      {/* Minimal Top-Right Corner Menu Trigger */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu(
              contextMenu
                ? null
                : { x: Math.max(10, rect.right - 256), y: rect.bottom + 8 }
            );
          }}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-slate-100 shadow-md hover:scale-105 active:scale-95 transition-all"
          title="Azioni Desktop"
          aria-label="Azioni Desktop"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Pre-Installed Apps (Web Apps) */}
      {pinnedWebApps.map((w, index) => {
        const isSelected = selectedIconId === `web-${w.id}`;
        const pos = isIconsLocked
          ? getGridPos(index)
          : iconPositions[`web-${w.id}`] || getGridPos(index);

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
            className={`w-22 p-1.5 rounded-2xl flex flex-col items-center text-center select-none cursor-pointer active:scale-95 transition-all z-10 ${
              isSelected
                ? 'bg-blue-600/35 backdrop-blur-md ring-2 ring-[var(--accent-hex,#2563eb)] shadow-2xl scale-105'
                : 'hover:scale-105'
            }`}
            title={`${w.name} (Tocca per aprire)`}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md border-2 border-white/40"
              style={{ backgroundColor: w.iconColor }}
            >
              {w.name.charAt(0)}
            </div>

            <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-300/80 dark:border-white/15 shadow-sm max-w-full">
              <span className="text-[10px] font-bold leading-tight truncate block">
                {w.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Optional User-Pinned System Apps on Desktop */}
      {visibleDesktopSystemApps.map((app, index) => {
        const isSelected = selectedIconId === app.id;
        const offsetIndex = pinnedWebApps.length + index;
        const pos = isIconsLocked
          ? getGridPos(offsetIndex)
          : iconPositions[app.id] || getGridPos(offsetIndex);

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
            className={`w-22 p-1.5 rounded-2xl flex flex-col items-center text-center select-none cursor-pointer active:scale-95 transition-all z-10 ${
              isSelected
                ? 'bg-blue-600/35 backdrop-blur-md ring-2 ring-[var(--accent-hex,#2563eb)] shadow-2xl scale-105'
                : 'hover:scale-105'
            }`}
            title={`${app.name} (Tocca per aprire)`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md border-2 border-white/40 transition-transform ${app.glow}`}
              style={{ backgroundColor: app.color }}
            >
              {app.renderIcon('w-6 h-6 text-white')}
            </div>

            <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-300/80 dark:border-white/15 shadow-sm max-w-full">
              <span className="text-[10px] font-bold leading-tight truncate block">
                {app.shortName}
              </span>
            </div>
          </div>
        );
      })}

      {/* Floating Desktop Sticky Notes - 100% Movable by Dragging Grip Bar OR 1-Tap Arrows */}
      {stickyNotes
        .filter((n) => n.isPinnedOnDesktop)
        .map((note) => {
          const col = COLOR_MAP[note.color] || COLOR_MAP.yellow;
          const isDraggingThis = activeDraggingNoteId === note.id;
          const currentPosX = isDraggingThis && dragOffset ? dragOffset.x : note.position.x;
          const currentPosY = isDraggingThis && dragOffset ? dragOffset.y : note.position.y;

          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: `${currentPosY}px`,
                left: `${currentPosX}px`,
                width: `${Math.max(280, note.size.width)}px`,
                minHeight: '260px',
                zIndex: isDraggingThis ? 40 : 25,
                transition: isDraggingThis ? 'none' : 'box-shadow 0.2s',
              }}
              className={`rounded-2xl border-2 shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col select-text ${col.bg} ${col.border}`}
            >
              {/* Note Header: Dedicated Drag Bar with Touch-Action None */}
              <div
                onPointerDown={(e) => handleNoteDragStart(e, note)}
                style={{ touchAction: 'none' }}
                className={`px-2.5 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none border-b border-black/10 ${col.header}`}
                title="Trascina la barra per spostare la nota sul desktop"
              >
                {/* Drag Grip Handle */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/15 font-black text-xs pointer-events-none">
                    <GripHorizontal className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Trascina</span>
                  </div>

                  {editingTitleId === note.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={note.title}
                      onBlur={() => setEditingTitleId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingTitleId(null);
                      }}
                      onChange={(e) => onUpdateStickyNote(note.id, { title: e.target.value })}
                      className="bg-white/40 border border-black/20 rounded px-1.5 py-0.5 text-xs font-bold w-24 text-slate-900 focus:outline-none"
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(note.id);
                      }}
                      className="text-xs font-extrabold truncate max-w-[90px] cursor-pointer hover:underline flex items-center gap-1"
                      title="Clicca per rinominare nota"
                    >
                      <span>{note.title}</span>
                      <Edit2 className="w-2.5 h-2.5 opacity-50 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Touch Nudge Buttons: Move Note 1-Tap Without Dragging */}
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => nudgeNote(note, -35, 0)}
                    className="p-1 hover:bg-black/15 rounded text-[10px] font-bold"
                    title="Sposta nota a sinistra"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeNote(note, 0, -35)}
                    className="p-1 hover:bg-black/15 rounded text-[10px] font-bold"
                    title="Sposta nota in alto"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeNote(note, 0, 35)}
                    className="p-1 hover:bg-black/15 rounded text-[10px] font-bold"
                    title="Sposta nota in basso"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => nudgeNote(note, 35, 0)}
                    className="p-1 hover:bg-black/15 rounded text-[10px] font-bold"
                    title="Sposta nota a destra"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateStickyNote(note.id, { isPinnedOnDesktop: false })}
                    className="p-1 hover:bg-black/15 rounded ml-1"
                    title="Nascondi dal desktop"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteStickyNote(note.id)}
                    className="p-1 hover:bg-black/20 text-rose-700 dark:text-rose-300 rounded"
                    title="Elimina Nota"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Note Content Area */}
              <textarea
                value={note.content}
                onChange={(e) => onUpdateStickyNote(note.id, { content: e.target.value })}
                placeholder="Scrivi qui i tuoi appunti..."
                className={`flex-1 p-3.5 bg-transparent resize-none focus:outline-none text-base leading-relaxed font-sans ${col.text}`}
                style={{ minHeight: '160px' }}
              />

              {/* Color Bar */}
              <div className="px-3 py-1.5 border-t border-black/10 flex items-center justify-between bg-black/5">
                <span className="text-[10px] font-bold opacity-60">
                  {new Date(note.updatedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1.5">
                  {(['yellow', 'blue', 'green', 'pink', 'purple', 'slate'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateStickyNote(note.id, { color })}
                      className={`w-4 h-4 rounded-full border border-black/20 ${
                        note.color === color ? 'ring-2 ring-black/40 scale-110' : ''
                      }`}
                      style={{
                        backgroundColor:
                          color === 'yellow'
                            ? '#fef08a'
                            : color === 'blue'
                            ? '#bae6fd'
                            : color === 'green'
                            ? '#a7f3d0'
                            : color === 'pink'
                            ? '#fecdd3'
                            : color === 'purple'
                            ? '#e9d5ff'
                            : '#cbd5e1',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

      {/* ALL APPS MODAL DRAWER */}
      {showAllAppsModal && (
        <div
          onClick={() => setShowAllAppsModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 space-y-4 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md">
                  <Grid className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Tutte le Applicazioni</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tutti gli strumenti di sistema e le app web in un solo posto</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllAppsModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cerca qualsiasi app per nome o categoria..."
                value={appsSearchQuery}
                onChange={(e) => setAppsSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Scrollable list of all applications */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* System Apps */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Applicazioni di Sistema ({allCoreFiltered.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allCoreFiltered.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        sound.playOpen();
                        onOpenApp(app.id as AppId);
                        setShowAllAppsModal(false);
                      }}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-all group hover:scale-[1.01]"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md border border-white/20"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.renderIcon('w-6 h-6 text-white')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {app.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {app.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Web Apps */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Web App & Hub ({allWebFiltered.length})
                  </h3>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenApp('web-launcher');
                      setShowAllAppsModal(false);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    + Aggiungi nuova app
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allWebFiltered.map((wa) => (
                    <button
                      key={wa.id}
                      onClick={() => {
                        sound.playOpen();
                        onLaunchWebApp(wa);
                        setShowAllAppsModal(false);
                      }}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-all group hover:scale-[1.01]"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shrink-0 shadow-md border border-white/20"
                        style={{ backgroundColor: wa.iconColor }}
                      >
                        {wa.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{wa.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            {wa.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {wa.description || wa.url}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl py-2 w-64 text-slate-800 dark:text-slate-100 font-bold text-xs"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Azioni Desktop
          </div>

          <button
            onClick={() => {
              onCreateNewFile('doc');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Nuovo Documento Testo</span>
          </button>

          <button
            onClick={() => {
              onCreateNewFile('code');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Nuovo File Codice</span>
          </button>

          <button
            onClick={() => {
              onCreateStickyNote();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <StickyIcon className="w-4 h-4 text-amber-500" />
            <span>Nuova Sticky Note</span>
          </button>

          <button
            onClick={() => {
              onOpenApp('web-launcher');
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Globe className="w-4 h-4 text-cyan-600" />
            <span>Aggiungi Web App...</span>
          </button>

          <div className="border-t border-slate-200 dark:border-slate-800 my-1.5" />

          <button
            onClick={() => {
              setShowAllAppsModal(true);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Grid className="w-4 h-4 text-indigo-500" />
            <span>Visualizza Tutte le App</span>
          </button>

          <button
            onClick={() => {
              onToggleTheme();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
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
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Tablet className="w-4 h-4 text-blue-600" />
            <span>{settings.tabletMode ? 'Disattiva Modalità Tablet' : 'Attiva Modalità Tablet'}</span>
          </button>

          <button
            onClick={() => {
              setIsIconsLocked(!isIconsLocked);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            {isIconsLocked ? (
              <>
                <Unlock className="w-4 h-4 text-amber-500" />
                <span>Sblocca Spostamento Icone</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Blocca Posizione Icone</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              handleResetIconGrid();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Allinea Icone in Colonne</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-purple-600" />
            <span>Sfondi, Colori e Barra</span>
          </button>
        </div>
      )}
    </div>
  );
};
