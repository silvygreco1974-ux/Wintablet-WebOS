import React, { useState, useEffect } from 'react';
import { AppId, CustomWebApp, StickyNote, SystemSettings, VirtualFile, WindowItem } from './types/os';
import { StorageService } from './utils/storage';
import { sound } from './utils/audio';
import { applyAccentToDocument } from './utils/theme';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/startmenu/StartMenu';
import { ActionCenter } from './components/actioncenter/ActionCenter';
import { CalendarFlyout } from './components/calendar/CalendarFlyout';
import { WindowFrame } from './components/window/WindowFrame';

// App Components
import { TextEditorApp } from './components/apps/TextEditorApp';
import { CodeEditorApp } from './components/apps/CodeEditorApp';
import { StickyNotesApp } from './components/apps/StickyNotesApp';
import { WebLauncherApp } from './components/apps/WebLauncherApp';
import { BrowserWindowApp } from './components/apps/BrowserWindowApp';
import { FileExplorerApp } from './components/apps/FileExplorerApp';
import { StorageManagerApp } from './components/apps/StorageManagerApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { CalculatorApp } from './components/apps/CalculatorApp';

export default function App() {
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [files, setFiles] = useState<VirtualFile[]>(() => StorageService.getFiles());
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => StorageService.getStickyNotes());
  const [webApps, setWebApps] = useState<CustomWebApp[]>(() => StorageService.getWebApps());

  // Window manager state
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(30);

  // Shell flyouts state
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Active target files being edited
  const [activeDocFile, setActiveDocFile] = useState<VirtualFile | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<VirtualFile | null>(null);

  // Synchronize audio engine with saved settings on boot
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.systemVolume);
  }, [settings.soundEnabled, settings.systemVolume]);

  // Sync theme class with document root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Sync font size scale with document root
  useEffect(() => {
    const scale = settings.fontScale || 'large';
    document.documentElement.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.documentElement.classList.add(`font-scale-${scale}`);
  }, [settings.fontScale]);

  // Synchronize dynamic accent color with document styling
  useEffect(() => {
    applyAccentToDocument(settings.accentColor);
  }, [settings.accentColor]);

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    const nextWallpaper =
      nextTheme === 'light'
        ? '/wallpapers/win_bloom_light.jpg'
        : '/wallpapers/win_bloom_dark.jpg';
    handleUpdateSettings({ ...settings, theme: nextTheme, wallpaper: nextWallpaper });
  };



  // Save changes to storage
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleUpdateFiles = (newFiles: VirtualFile[]) => {
    setFiles(newFiles);
    StorageService.saveFiles(newFiles);
  };

  const handleUpdateStickyNotes = (newNotes: StickyNote[]) => {
    setStickyNotes(newNotes);
    StorageService.saveStickyNotes(newNotes);
  };

  const handleUpdateWebApps = (newApps: CustomWebApp[]) => {
    setWebApps(newApps);
    StorageService.saveWebApps(newApps);
  };

  const handleRefreshAll = () => {
    setSettings(StorageService.getSettings());
    setFiles(StorageService.getFiles());
    setStickyNotes(StorageService.getStickyNotes());
    setWebApps(StorageService.getWebApps());
  };

  // Window Management Functions
  const bringToFront = (id: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  const openWindow = (
    appId: AppId,
    title: string,
    color: string,
    defaultW: number = 780,
    defaultH: number = 540,
    customData?: any
  ) => {
    sound.playOpen();
    const existing = windows.find((w) => w.appId === appId && appId !== 'browser-window');

    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                isOpen: true,
                isMinimized: false,
                zIndex: nextZ,
                title,
                customData: customData || w.customData,
              }
            : w
        )
      );
      setActiveWindowId(existing.id);
      return;
    }

    // Determine initial position
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const w = Math.min(defaultW, viewportW - 40);
    const h = Math.min(defaultH, viewportH - 80);
    const offset = (windows.length % 5) * 28;
    const initialX = Math.max(20, Math.min(viewportW - w - 20, 60 + offset));
    const initialY = Math.max(20, Math.min(viewportH - h - 70, 30 + offset));

    const newWin: WindowItem = {
      id: `${appId}-${Date.now()}`,
      appId,
      title,
      icon: title.charAt(0),
      color,
      isOpen: true,
      isMinimized: false,
      isMaximized: false, // Default to floating window so it can immediately be moved and repositioned
      position: { x: initialX, y: initialY },
      size: { width: w, height: h },
      zIndex: nextZ,
      customData,
    };

    setWindows((prev) => [...prev, newWin]);
    setActiveWindowId(newWin.id);
  };

  const closeWindow = (id: string) => {
    sound.playClose();
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
    if (activeWindowId === id) {
      const openRemaining = windows.filter((w) => w.id !== id && w.isOpen && !w.isMinimized);
      if (openRemaining.length > 0) {
        const topOne = openRemaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev));
        setActiveWindowId(topOne.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: string) => {
    sound.playClose();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      const visible = windows.filter((w) => w.id !== id && w.isOpen && !w.isMinimized);
      if (visible.length > 0) {
        const top = visible.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev));
        setActiveWindowId(top.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const toggleMaximize = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (!w.isMaximized) {
          return {
            ...w,
            isMaximized: true,
            prevPosition: { ...w.position },
            prevSize: { ...w.size },
          };
        } else {
          return {
            ...w,
            isMaximized: false,
            position: w.prevPosition || { x: 80, y: 40 },
            size: w.prevSize || { width: 780, height: 540 },
          };
        }
      })
    );
  };

  const snapWindow = (id: string, type: 'left' | 'right' | 'maximize' | 'center') => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight - 48; // subtract taskbar

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (type === 'maximize') {
          return { ...w, isMaximized: true };
        }
        if (type === 'left') {
          return {
            ...w,
            isMaximized: false,
            position: { x: 0, y: 0 },
            size: { width: Math.floor(screenW / 2), height: screenH },
          };
        }
        if (type === 'right') {
          return {
            ...w,
            isMaximized: false,
            position: { x: Math.floor(screenW / 2), y: 0 },
            size: { width: Math.floor(screenW / 2), height: screenH },
          };
        }
        // center
        return {
          ...w,
          isMaximized: false,
          position: { x: Math.floor((screenW - 780) / 2), y: Math.floor((screenH - 540) / 2) },
          size: { width: 780, height: 540 },
        };
      })
    );
  };

  const updateWindowPos = (id: string, pos: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position: pos } : w)));
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)));
  };

  // Launch Core App
  const handleLaunchApp = (appId: AppId, windowId?: string) => {
    if (windowId) {
      const win = windows.find((w) => w.id === windowId);
      if (win) {
        if (win.isMinimized) {
          bringToFront(windowId);
        } else if (activeWindowId === windowId) {
          minimizeWindow(windowId);
        } else {
          bringToFront(windowId);
        }
        return;
      }
    }

    switch (appId) {
      case 'text-editor':
        openWindow('text-editor', 'WinNote - Editor di Testo', '#2563eb', 820, 560);
        break;
      case 'code-editor':
        openWindow('code-editor', 'DevStudio - Editor di Codice', '#10b981', 860, 580);
        break;
      case 'sticky-notes':
        openWindow('sticky-notes', 'Sticky Notes Hub', '#f59e0b', 760, 520);
        break;
      case 'web-launcher':
        openWindow('web-launcher', 'Web Hub - Applicazioni Web', '#06b6d4', 860, 580);
        break;
      case 'file-explorer':
        openWindow('file-explorer', 'Questo PC - Esplora File', '#3b82f6', 820, 540);
        break;
      case 'storage-manager':
        openWindow('storage-manager', 'Gestione Memoria Tablet', '#6366f1', 780, 540);
        break;
      case 'calculator':
        openWindow('calculator', 'Calcolatrice', '#ec4899', 340, 480);
        break;
      case 'settings':
        openWindow('settings', 'Impostazioni', '#64748b', 800, 560);
        break;
      default:
        break;
    }
  };

  // Launch Custom Web App
  const handleLaunchWebApp = (app: CustomWebApp) => {
    sound.playOpen();
    if (app.displayMode === 'new_tab') {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } else {
      openWindow(
        'browser-window',
        app.name,
        app.iconColor || '#06b6d4',
        860,
        580,
        { url: app.url, appName: app.name }
      );
    }
  };

  // File Operations
  const handleOpenFile = (file: VirtualFile) => {
    sound.playOpen();
    if (file.type === 'doc') {
      setActiveDocFile(file);
      openWindow('text-editor', `WinNote - ${file.name}`, '#2563eb', 820, 560, { file });
    } else if (file.type === 'code') {
      setActiveCodeFile(file);
      openWindow('code-editor', `DevStudio - ${file.name}`, '#10b981', 860, 580, { file });
    }
  };

  const handleSaveFile = (file: VirtualFile) => {
    const existingIndex = files.findIndex((f) => f.id === file.id);
    let updated: VirtualFile[];
    if (existingIndex >= 0) {
      updated = files.map((f) => (f.id === file.id ? file : f));
    } else {
      updated = [file, ...files];
    }
    handleUpdateFiles(updated);
  };

  const handleDeleteFile = (id: string) => {
    handleUpdateFiles(files.filter((f) => f.id !== id));
  };

  const handleCreateNewFile = (type: 'doc' | 'code') => {
    sound.playOpen();
    if (type === 'doc') {
      const newDoc: VirtualFile = {
        id: `doc-${Date.now()}`,
        name: `Nuovo_Documento_${files.length + 1}.doc`,
        type: 'doc',
        content: `<h2>Nuovo Documento</h2><p>Inizia a scrivere...</p>`,
        size: 80,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      handleSaveFile(newDoc);
      handleOpenFile(newDoc);
    } else {
      const newCode: VirtualFile = {
        id: `code-${Date.now()}`,
        name: `script_${files.length + 1}.html`,
        type: 'code',
        language: 'html',
        content: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Nuovo Script</h1>\n</body>\n</html>`,
        size: 60,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      handleSaveFile(newCode);
      handleOpenFile(newCode);
    }
  };

  const handleCreateStickyNote = () => {
    sound.playOpen();
    const newNote: StickyNote = {
      id: `sticky-${Date.now()}`,
      title: 'Nuova Nota',
      content: '',
      color: 'yellow',
      position: { x: 60 + (stickyNotes.length % 5) * 40, y: 60 + (stickyNotes.length % 5) * 30 },
      size: { width: 250, height: 220 },
      isPinnedOnDesktop: true,
      updatedAt: Date.now(),
    };
    handleUpdateStickyNotes([newNote, ...stickyNotes]);
  };

  const handleUpdateStickyNote = (id: string, updates: Partial<StickyNote>) => {
    const updated = stickyNotes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    handleUpdateStickyNotes(updated);
  };

  const handleDeleteStickyNote = (id: string) => {
    sound.playClose();
    handleUpdateStickyNotes(stickyNotes.filter((n) => n.id !== id));
  };

  // Minimize all windows (show desktop)
  const handleMinimizeAll = () => {
    setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    setActiveWindowId(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased">
      <OfflineIndicator />
      {/* Desktop Surface */}
      <Desktop
        settings={settings}
        webApps={webApps}
        stickyNotes={stickyNotes}
        onOpenApp={handleLaunchApp}
        onLaunchWebApp={handleLaunchWebApp}
        onUpdateStickyNote={handleUpdateStickyNote}
        onDeleteStickyNote={handleDeleteStickyNote}
        onCreateStickyNote={handleCreateStickyNote}
        onCreateNewFile={handleCreateNewFile}
        onOpenSettings={() => handleLaunchApp('settings')}
        onToggleTabletMode={() => handleUpdateSettings({ ...settings, tabletMode: !settings.tabletMode })}
        onToggleTheme={handleToggleTheme}
      />

      {/* Window Manager: Render all active windows */}
      {windows.map((win) => {
        if (!win.isOpen) return null;
        const isActive = win.id === activeWindowId;

        return (
          <WindowFrame
            key={win.id}
            window={win}
            isActive={isActive}
            tabletMode={settings.tabletMode}
            onFocus={() => bringToFront(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onSnap={(snapType) => snapWindow(win.id, snapType)}
            onUpdatePosition={(pos) => updateWindowPos(win.id, pos)}
            onUpdateSize={(sz) => updateWindowSize(win.id, sz)}
          >
            {win.appId === 'text-editor' && (
              <TextEditorApp
                initialFile={win.customData?.file || activeDocFile}
                onSaveFile={handleSaveFile}
                files={files}
              />
            )}

            {win.appId === 'code-editor' && (
              <CodeEditorApp
                initialFile={win.customData?.file || activeCodeFile}
                onSaveFile={handleSaveFile}
                files={files}
              />
            )}

            {win.appId === 'sticky-notes' && (
              <StickyNotesApp
                notes={stickyNotes}
                onUpdateNotes={handleUpdateStickyNotes}
              />
            )}

            {win.appId === 'web-launcher' && (
              <WebLauncherApp
                webApps={webApps}
                onUpdateWebApps={handleUpdateWebApps}
                onLaunchWebApp={handleLaunchWebApp}
              />
            )}

            {win.appId === 'file-explorer' && (
              <FileExplorerApp
                files={files}
                stickyNotes={stickyNotes}
                webApps={webApps}
                onOpenFile={handleOpenFile}
                onDeleteFile={handleDeleteFile}
                onOpenStickyNotes={() => handleLaunchApp('sticky-notes')}
                onOpenWebLauncher={() => handleLaunchApp('web-launcher')}
                onNewFile={handleCreateNewFile}
              />
            )}

            {win.appId === 'storage-manager' && (
              <StorageManagerApp onRefreshAll={handleRefreshAll} />
            )}

            {win.appId === 'calculator' && <CalculatorApp />}

            {win.appId === 'settings' && (
              <SettingsApp
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {win.appId === 'browser-window' && (
              <BrowserWindowApp
                initialUrl={win.customData?.url}
                title={win.customData?.appName || win.title}
              />
            )}
          </WindowFrame>
        );
      })}

      {/* Flyout Menus */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onLaunchApp={handleLaunchApp}
        onLaunchWebApp={handleLaunchWebApp}
        onOpenFile={handleOpenFile}
        webApps={webApps}
        recentFiles={files}
        taskbarAlign={settings.taskbarAlign}
      />

      <ActionCenter
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenStorageManager={() => handleLaunchApp('storage-manager')}
      />

      <CalendarFlyout
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Windows 11 Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        settings={settings}
        isStartOpen={isStartOpen}
        isActionCenterOpen={isActionCenterOpen}
        isCalendarOpen={isCalendarOpen}
        onToggleStart={() => {
          setIsStartOpen(!isStartOpen);
          setIsActionCenterOpen(false);
          setIsCalendarOpen(false);
        }}
        onToggleActionCenter={() => {
          setIsActionCenterOpen(!isActionCenterOpen);
          setIsStartOpen(false);
          setIsCalendarOpen(false);
        }}
        onToggleCalendar={() => {
          setIsCalendarOpen(!isCalendarOpen);
          setIsStartOpen(false);
          setIsActionCenterOpen(false);
        }}
        onToggleTabletMode={() => handleUpdateSettings({ ...settings, tabletMode: !settings.tabletMode })}
        onAppClick={handleLaunchApp}
        onMinimizeAll={handleMinimizeAll}
      />
    </div>
  );
}
