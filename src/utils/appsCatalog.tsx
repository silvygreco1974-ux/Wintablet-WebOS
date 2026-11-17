import React from 'react';
import {
  FileText,
  FileCode,
  StickyNote as StickyIcon,
  Globe,
  HardDrive,
  Sliders,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { AppId } from '../types/os';

export interface SystemAppMeta {
  id: Exclude<AppId, 'browser-window'>;
  name: string;
  shortName: string;
  desc: string;
  color: string;
  glow: string;
  renderIcon: (className?: string) => React.ReactNode;
}

export const SYSTEM_APPS_CATALOG: SystemAppMeta[] = [
  {
    id: 'text-editor',
    name: 'Editor di Testo',
    shortName: 'Editor Testo',
    desc: 'Scrivi e formatta documenti',
    color: '#2563eb',
    glow: 'shadow-blue-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <FileText className={cls} />,
  },
  {
    id: 'code-editor',
    name: 'Editor di Codice',
    shortName: 'Editor Codice',
    desc: 'HTML, JS, TypeScript e anteprima live',
    color: '#059669',
    glow: 'shadow-emerald-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <FileCode className={cls} />,
  },
  {
    id: 'sticky-notes',
    name: 'Sticky Notes',
    shortName: 'Sticky Notes',
    desc: 'Note adesive sul desktop',
    color: '#d97706',
    glow: 'shadow-amber-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <StickyIcon className={cls} />,
  },
  {
    id: 'web-launcher',
    name: 'Web Hub',
    shortName: 'Web Hub',
    desc: 'Gestisci e aggiungi web app',
    color: '#0891b2',
    glow: 'shadow-cyan-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <Globe className={cls} />,
  },
  {
    id: 'file-explorer',
    name: 'Questo PC',
    shortName: 'Questo PC',
    desc: 'Esplora documenti e file virtuali',
    color: '#3b82f6',
    glow: 'shadow-indigo-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <HardDrive className={cls} />,
  },
  {
    id: 'storage-manager',
    name: 'Memoria Tablet',
    shortName: 'Memoria',
    desc: 'Analisi spazio, cache e backup',
    color: '#7c3aed',
    glow: 'shadow-purple-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <Sparkles className={cls} />,
  },
  {
    id: 'calculator',
    name: 'Calcolatrice',
    shortName: 'Calcolatrice',
    desc: 'Calcoli rapidi e percentuali',
    color: '#e11d48',
    glow: 'shadow-rose-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <Calculator className={cls} />,
  },
  {
    id: 'settings',
    name: 'Impostazioni',
    shortName: 'Impostazioni',
    desc: 'Sfondi, tema, barra e tablet',
    color: '#475569',
    glow: 'shadow-slate-500/40',
    renderIcon: (cls = 'w-5 h-5 text-white') => <Sliders className={cls} />,
  },
];
