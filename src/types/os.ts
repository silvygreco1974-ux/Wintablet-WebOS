export type AppId =
  | 'text-editor'
  | 'code-editor'
  | 'sticky-notes'
  | 'web-launcher'
  | 'file-explorer'
  | 'storage-manager'
  | 'calculator'
  | 'settings'
  | 'browser-window';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: string;
  color: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  category: 'essenziali' | 'produttivita' | 'sistema';
}

export interface WindowItem {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  color: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
  zIndex: number;
  customData?: any; // e.g. active file ID or external web URL
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'slate';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isPinnedOnDesktop: boolean;
  updatedAt: number;
}

export interface VirtualFile {
  id: string;
  name: string;
  type: 'doc' | 'code' | 'note' | 'web';
  content: string;
  language?: string; // for code files: html, js, py, css, json, md
  size: number; // in bytes
  createdAt: number;
  updatedAt: number;
}

export interface CustomWebApp {
  id: string;
  name: string;
  url: string;
  iconName: string;
  iconColor: string;
  category: 'Produttività' | 'Strumenti' | 'Sviluppo' | 'Studio' | 'Grafica & Design' | 'Social' | 'Altro';
  displayMode: 'window' | 'new_tab';
  description?: string;
  isPinnedDesktop?: boolean;
  isPinnedTaskbar?: boolean;
}

export interface SystemSettings {
  theme: 'dark' | 'light';
  accentColor: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';
  wallpaper: string; // image URL or identifier
  taskbarAlign: 'center' | 'left';
  tabletMode: boolean;
  soundEnabled: boolean;
  systemVolume: number;
  brightness: number;
  fontScale?: 'normal' | 'large' | 'xlarge';
}
