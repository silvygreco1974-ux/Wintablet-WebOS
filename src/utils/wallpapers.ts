// Netlify & Static Hosting Wallpaper Asset Provider
// Direct Vite imports ensure 100% reliable bundling with cache-busting hashes on Netlify
import winBloomDark from '../assets/images/win_bloom_wallpaper_1792312140457.jpg';
import winBloomLight from '../assets/images/win_bloom_light_1792313311807.jpg';
import scenicMountain from '../assets/images/scenic_mountain_wallpaper_1792312140789.jpg';
import minimalGlass from '../assets/images/minimal_glass_wallpaper_1792312141047.jpg';

export interface WallpaperItem {
  id: string;
  name: string;
  url: string;
  fallbackUrl: string;
  category: 'Vibrante Soft' | 'Notturno' | 'Natura' | 'Design' | 'Gradiente';
  isGradient?: boolean;
}

export const WALLPAPER_LIST: WallpaperItem[] = [
  {
    id: 'bloom-dark',
    name: 'Windows 11 Bloom Dark',
    url: winBloomDark,
    fallbackUrl: '/wallpapers/win_bloom_dark.jpg',
    category: 'Notturno',
  },
  {
    id: 'bloom-light',
    name: 'Windows 11 Bloom Luce Naturale',
    url: winBloomLight,
    fallbackUrl: '/wallpapers/win_bloom_light.jpg',
    category: 'Vibrante Soft',
  },
  {
    id: 'mountain',
    name: 'Alba Alpina Riflesso',
    url: scenicMountain,
    fallbackUrl: '/wallpapers/scenic_mountain.jpg',
    category: 'Natura',
  },
  {
    id: 'glass',
    name: 'Scultura Minimal Vetro',
    url: minimalGlass,
    fallbackUrl: '/wallpapers/minimal_glass.jpg',
    category: 'Design',
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora Windows Fluida (CSS)',
    url: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #0369a1 70%, #06b6d4 100%)',
    fallbackUrl: '',
    category: 'Gradiente',
    isGradient: true,
  },
  {
    id: 'gradient-sunset',
    name: 'Tramonto Zaffiro & Rosa (CSS)',
    url: 'linear-gradient(135deg, #18181b 0%, #311042 40%, #831843 75%, #db2777 100%)',
    fallbackUrl: '',
    category: 'Gradiente',
    isGradient: true,
  },
];

export function resolveWallpaperUrl(inputUrl: string | undefined): string {
  if (!inputUrl) return winBloomDark;
  
  // If it's a CSS gradient, return directly
  if (inputUrl.startsWith('linear-gradient') || inputUrl.startsWith('radial-gradient')) {
    return inputUrl;
  }

  // Map legacy IDs or paths to bundled Vite assets
  if (inputUrl.includes('win_bloom_wallpaper') || inputUrl.includes('win_bloom_dark') || inputUrl === 'bloom' || inputUrl === 'bloom-dark') {
    return winBloomDark;
  }
  if (inputUrl.includes('win_bloom_light') || inputUrl === 'bloom-light') {
    return winBloomLight;
  }
  if (inputUrl.includes('scenic_mountain') || inputUrl === 'mountain') {
    return scenicMountain;
  }
  if (inputUrl.includes('minimal_glass') || inputUrl === 'glass') {
    return minimalGlass;
  }

  return inputUrl;
}
