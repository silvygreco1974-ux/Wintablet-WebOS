import { SystemSettings } from '../types/os';

export interface AccentThemeConfig {
  id: SystemSettings['accentColor'];
  name: string;
  hex: string;
  hoverHex: string;
  rgb: string;
  // Tailwind class strings
  bgClass: string;
  bgHoverClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
  lightBadgeClass: string;
}

export const ACCENT_CONFIGS: Record<SystemSettings['accentColor'], AccentThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Blu Windows',
    hex: '#2563eb',
    hoverHex: '#1d4ed8',
    rgb: '37, 99, 235',
    bgClass: 'bg-blue-600',
    bgHoverClass: 'hover:bg-blue-500',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
    ringClass: 'ring-blue-500/40',
    lightBadgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Smeraldo',
    hex: '#059669',
    hoverHex: '#047857',
    rgb: '5, 150, 105',
    bgClass: 'bg-emerald-600',
    bgHoverClass: 'hover:bg-emerald-500',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/40',
    lightBadgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
  },
  violet: {
    id: 'violet',
    name: 'Viola Profondo',
    hex: '#7c3aed',
    hoverHex: '#6d28d9',
    rgb: '124, 58, 237',
    bgClass: 'bg-violet-600',
    bgHoverClass: 'hover:bg-violet-500',
    borderClass: 'border-violet-500',
    textClass: 'text-violet-600 dark:text-violet-400',
    ringClass: 'ring-violet-500/40',
    lightBadgeClass: 'bg-violet-100 dark:bg-violet-950/60 text-violet-900 dark:text-violet-200 border-violet-300 dark:border-violet-800',
  },
  amber: {
    id: 'amber',
    name: 'Ambra Solare',
    hex: '#d97706',
    hoverHex: '#b45309',
    rgb: '217, 119, 6',
    bgClass: 'bg-amber-600',
    bgHoverClass: 'hover:bg-amber-500',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    ringClass: 'ring-amber-500/40',
    lightBadgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800',
  },
  rose: {
    id: 'rose',
    name: 'Rosa Magenta',
    hex: '#e11d48',
    hoverHex: '#be123c',
    rgb: '225, 29, 72',
    bgClass: 'bg-rose-600',
    bgHoverClass: 'hover:bg-rose-500',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    ringClass: 'ring-rose-500/40',
    lightBadgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800',
  },
  cyan: {
    id: 'cyan',
    name: 'Ciano Fluido',
    hex: '#0891b2',
    hoverHex: '#0e7490',
    rgb: '8, 145, 178',
    bgClass: 'bg-cyan-600',
    bgHoverClass: 'hover:bg-cyan-500',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    ringClass: 'ring-cyan-500/40',
    lightBadgeClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800',
  },
};

export function applyAccentToDocument(accent: SystemSettings['accentColor']) {
  const config = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.blue;
  const root = document.documentElement;
  root.style.setProperty('--accent-hex', config.hex);
  root.style.setProperty('--accent-hover', config.hoverHex);
  root.style.setProperty('--accent-rgb', config.rgb);
}
