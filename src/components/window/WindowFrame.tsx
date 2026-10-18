import React, { useState, useRef } from 'react';
import {
  Minus,
  Square,
  Copy,
  X,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { WindowItem } from '../../types/os';
import { sound } from '../../utils/audio';

interface WindowFrameProps {
  window: WindowItem;
  isActive: boolean;
  tabletMode: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSnap: (type: 'left' | 'right' | 'maximize' | 'center') => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onUpdateSize: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  isActive,
  tabletMode,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onUpdatePosition,
  onUpdateSize,
  children,
}) => {
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const [showMovePad, setShowMovePad] = useState(false);

  // Bulletproof Pointer Capture Dragging (Works 100% on Tablet Touch & Desktop Mouse)
  const handleTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking on a button, do not drag
    if ((e.target as HTMLElement).closest('button, input, textarea, select')) return;

    onFocus();

    let initialX = win.position.x;
    let initialY = win.position.y;

    // If maximized, restore on touch drag down
    if (win.isMaximized) {
      onMaximize();
      initialX = Math.max(10, e.clientX - win.size.width / 2);
      initialY = Math.max(10, e.clientY - 20);
      onUpdatePosition({ x: initialX, y: initialY });
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const target = e.currentTarget;

    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      const maxX = Math.max(0, window.innerWidth - 100);
      const maxY = Math.max(0, window.innerHeight - 80);

      const nextX = Math.max(0, Math.min(maxX, initialX + dx));
      const nextY = Math.max(0, Math.min(maxY, initialY + dy));

      onUpdatePosition({ x: nextX, y: nextY });
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

  // Quick arrow movement helpers
  const nudgeWindow = (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    sound.playClick();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 50;

    if (direction === 'center') {
      const x = Math.max(10, Math.floor((screenW - win.size.width) / 2));
      const y = Math.max(10, Math.floor((screenH - win.size.height) / 2));
      onUpdatePosition({ x, y });
    } else if (direction === 'left') {
      onUpdatePosition({ x: Math.max(0, win.position.x - 70), y: win.position.y });
    } else if (direction === 'right') {
      onUpdatePosition({ x: Math.min(screenW - 100, win.position.x + 70), y: win.position.y });
    } else if (direction === 'up') {
      onUpdatePosition({ x: win.position.x, y: Math.max(0, win.position.y - 70) });
    } else if (direction === 'down') {
      onUpdatePosition({ x: win.position.x, y: Math.min(screenH - 70, win.position.y + 70) });
    }
  };

  if (!win.isOpen || win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100% - 50px)',
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : {
        position: 'absolute',
        top: `${win.position.y}px`,
        left: `${win.position.x}px`,
        width: `${win.size.width}px`,
        height: `${win.size.height}px`,
        zIndex: win.zIndex,
        borderRadius: '12px',
      };

  return (
    <div
      style={style}
      onPointerDown={onFocus}
      className={`flex flex-col bg-white dark:bg-slate-900 border transition-[box-shadow,border-color] duration-150 overflow-hidden shadow-2xl ${
        isActive
          ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.28)]'
          : 'border-slate-300 dark:border-slate-700 shadow-[0_8px_24px_rgba(0,0,0,0.15)]'
      }`}
    >
      {/* Title Bar - Clean Authentic Windows 11 Styling (Light & Dark with Genuine Contrast) */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={onMaximize}
        className={`flex items-center justify-between px-3 select-none touch-none cursor-grab active:cursor-grabbing border-b transition-colors ${
          tabletMode ? 'h-13' : 'h-11'
        } ${
          isActive
            ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-800'
            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Left: Window Icon and Clear Title */}
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
            style={{ backgroundColor: win.color }}
          >
            {win.title.charAt(0)}
          </div>
          <span className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">
            {win.title}
          </span>
        </div>

        {/* Center: Explicit Visual Drag Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold select-none pointer-events-none">
          <Move className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Trascina barra</span>
        </div>

        {/* Right: Quick Move Pad & Window Controls */}
        <div className="flex items-center shrink-0 gap-1">
          {/* Quick Positioning Tool */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMovePad(!showMovePad);
              }}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Posiziona con frecce"
            >
              <Move className="w-4 h-4" />
            </button>

            {showMovePad && (
              <div
                className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 shadow-2xl z-50 w-44 text-slate-800 dark:text-slate-100 flex flex-col items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                  Sposta Finestra
                </div>
                <button
                  onClick={() => nudgeWindow('up')}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => nudgeWindow('left')}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => nudgeWindow('center')}
                    className="px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
                  >
                    Centra
                  </button>
                  <button
                    onClick={() => nudgeWindow('right')}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => nudgeWindow('down')}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClose();
              onMinimize();
            }}
            className="w-9 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
            title="Riduci a icona"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Maximize / Restore + Snap */}
          <div
            className="relative"
            onMouseEnter={() => setShowSnapMenu(true)}
            onMouseLeave={() => setShowSnapMenu(false)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playOpen();
                onMaximize();
              }}
              className="w-9 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title={win.isMaximized ? 'Ripristina a finestra' : 'Ingrandisci a schermo intero'}
            >
              {win.isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            </button>

            {/* Snap Layout Flyout */}
            {showSnapMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 shadow-2xl z-50 w-48 flex flex-col gap-2 text-slate-800 dark:text-slate-100"
                onMouseEnter={() => setShowSnapMenu(true)}
              >
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Affianca Schermo
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSnap('left');
                      setShowSnapMenu(false);
                    }}
                    className="p-2 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex flex-col items-center gap-1 text-xs font-semibold"
                  >
                    <div className="w-8 h-5 border border-slate-400 rounded flex">
                      <div className="w-1/2 h-full bg-blue-500 border-r border-slate-400" />
                      <div className="w-1/2 h-full" />
                    </div>
                    <span>Sinistra</span>
                  </button>

                  <button
                    onClick={() => {
                      onSnap('right');
                      setShowSnapMenu(false);
                    }}
                    className="p-2 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex flex-col items-center gap-1 text-xs font-semibold"
                  >
                    <div className="w-8 h-5 border border-slate-400 rounded flex">
                      <div className="w-1/2 h-full" />
                      <div className="w-1/2 h-full bg-blue-500 border-l border-slate-400" />
                    </div>
                    <span>Destra</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onSnap('maximize');
                    setShowSnapMenu(false);
                  }}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  Schermo Intero
                </button>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClose();
              onClose();
            }}
            className="w-9 h-8 flex items-center justify-center hover:bg-rose-600 active:bg-rose-700 text-slate-700 dark:text-slate-300 hover:text-white rounded-lg transition-colors font-bold"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
};
