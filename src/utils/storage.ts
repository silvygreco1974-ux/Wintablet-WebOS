import { CustomWebApp, StickyNote, SystemSettings, VirtualFile } from '../types/os';

export const WALLPAPERS = [
  {
    id: 'bloom-light',
    name: 'Windows 11 Bloom Luce & Colori',
    url: '/src/assets/images/win_bloom_light_1792313311807.jpg',
    category: 'Vibrante',
  },
  {
    id: 'bloom',
    name: 'Windows 11 Bloom Dark',
    url: '/src/assets/images/win_bloom_wallpaper_1792312140457.jpg',
    category: 'Notturno',
  },
  {
    id: 'mountain',
    name: 'Alba Alpina Riflesso',
    url: '/src/assets/images/scenic_mountain_wallpaper_1792312140789.jpg',
    category: 'Natura',
  },
  {
    id: 'glass',
    name: 'Scultura Minimal Vetro',
    url: '/src/assets/images/minimal_glass_wallpaper_1792312141047.jpg',
    category: 'Design',
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'light',
  accentColor: 'blue',
  wallpaper: '/src/assets/images/win_bloom_light_1792313311807.jpg',
  taskbarAlign: 'center',
  tabletMode: false,
  soundEnabled: true,
  systemVolume: 0.7,
  brightness: 100,
  fontScale: 'large',
};

const DEFAULT_STICKY_NOTES: StickyNote[] = [
  {
    id: 'note-welcome',
    title: 'Benvenuto sul tuo Web OS!',
    content: 'Questo ambiente è concepito apposta per il tuo tablet:\n- Non occupa spazio su disco\n- Funziona offline nella cache\n- Salva testi, codice e note al volo\n- Puoi aggiungere tutte le tue web app preferite dal menu Start o Web Hub!',
    color: 'yellow',
    position: { x: 32, y: 40 },
    size: { width: 260, height: 230 },
    isPinnedOnDesktop: true,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'note-ideas',
    title: 'Idee & Progetti',
    content: '1. Scrivere bozza articolo\n2. Testare script canvas HTML5\n3. Salvare scorciatoia dizionario online\n4. Fare backup file con 1 click',
    color: 'blue',
    position: { x: 310, y: 70 },
    size: { width: 240, height: 210 },
    isPinnedOnDesktop: true,
    updatedAt: Date.now() - 1800000,
  },
];

const DEFAULT_FILES: VirtualFile[] = [
  {
    id: 'doc-intro',
    name: 'Benvenuto_su_WinTablet.doc',
    type: 'doc',
    content: `<h1>WinTablet WebOS</h1><p>Benvenuto nel tuo nuovo ambiente di lavoro leggero e veloce, progettato specificamente per <strong>tablet e dispositivi con memoria limitata</strong>!</p><h3>Perché questa app è perfetta per il tuo tablet?</h3><ul><li><strong>Ingombro zero:</strong> Nessuna app pesante da installare sul tablet. Tutto gira direttamente nel browser sfruttando la tecnologia web moderna.</li><li><strong>Editor di testo completo:</strong> Scrivi appunti, saggi o elenchi con formattazione ricca e salva su disco virtuale.</li><li><strong>Editor di codice integrato:</strong> Scrivi HTML, CSS, JavaScript o Python ed esegui subito l'anteprima in tempo reale!</li><li><strong>Sticky Notes:</strong> Note adesive colorate sempre a portata di mano sul desktop.</li><li><strong>Web Hub:</strong> Aggiungi qualsiasi sito o web app con link esterno per avere tutti i tuoi strumenti in una sola schermata stile Windows.</li><li><strong>Gestione Memoria:</strong> Controlla i byte usati, esporta backup e pulisci la cache quando vuoi.</li></ul><p><em>Inizia aprendo le app dalla barra delle applicazioni o facendo doppio tocco sul desktop!</em></p>`,
    size: 980,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'code-canvas',
    name: 'orologio_digitale.html',
    type: 'code',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #090d16;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, sans-serif;
      color: #38bdf8;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 16px;
      padding: 32px 48px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    #clock {
      font-size: 3.5rem;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 0;
      text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
    }
    #date {
      color: #94a3b8;
      font-size: 1.1rem;
      margin-top: 8px;
    }
    .badge {
      display: inline-block;
      margin-top: 16px;
      padding: 4px 12px;
      background: rgba(56, 189, 248, 0.15);
      border-radius: 20px;
      font-size: 0.8rem;
      color: #7dd3fc;
    }
  </style>
</head>
<body>
  <div class="card">
    <div id="clock">00:00:00</div>
    <div id="date">Caricamento...</div>
    <div class="badge">Eseguito in WinTablet Code Runner</div>
  </div>

  <script>
    function update() {
      const now = new Date();
      document.getElementById('clock').textContent = now.toLocaleTimeString('it-IT');
      document.getElementById('date').textContent = now.toLocaleDateString('it-IT', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    update();
    setInterval(update, 1000);
  </script>
</body>
</html>`,
    size: 1340,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 1200000,
  },
  {
    id: 'code-js-snippet',
    name: 'calcolo_spazio.js',
    type: 'code',
    language: 'javascript',
    content: `// Script di utilità per calcolare il risparmio di spazio del tablet
const appsNormaliMb = {
  office: 450,
  vscode: 380,
  notepadPlus: 45,
  spotifyApp: 120,
  socialApps: 850
};

const totaleMbRisparmiati = Object.values(appsNormaliMb).reduce((a, b) => a + b, 0);

console.log("=== RISPARMIO MEMORIA TABLET ===");
console.log("Spazio app native evitate:", totaleMbRisparmiati + " MB (" + (totaleMbRisparmiati / 1024).toFixed(2) + " GB)");
console.log("Spazio occupato da WinTablet:", "< 2 MB di cache browser");
console.log("Risparmio effettivo:", "99.8% di memoria risparmiata!");
`,
    size: 512,
    createdAt: Date.now() - 25000000,
    updatedAt: Date.now() - 900000,
  },
];

const DEFAULT_WEB_APPS: CustomWebApp[] = [
  {
    id: 'web-wikipedia',
    name: 'Wikipedia Italia',
    url: 'https://it.wikipedia.org',
    iconName: 'BookOpen',
    iconColor: '#3b82f6',
    category: 'Studio',
    displayMode: 'window',
    description: "L'enciclopedia libera",
    isPinnedDesktop: true,
    isPinnedTaskbar: true,
  },
  {
    id: 'web-excalidraw',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    iconName: 'PenTool',
    iconColor: '#a855f7',
    category: 'Strumenti',
    displayMode: 'window',
    description: 'Lavagna virtuale per schizzi e diagrammi',
    isPinnedDesktop: true,
    isPinnedTaskbar: false,
  },
  {
    id: 'web-photopea',
    name: 'Photopea (Editor Foto)',
    url: 'https://www.photopea.com',
    iconName: 'Image',
    iconColor: '#10b981',
    category: 'Grafica & Design',
    displayMode: 'window',
    description: 'Alternativa leggera a Photoshop nel browser',
    isPinnedDesktop: true,
    isPinnedTaskbar: false,
  },
  {
    id: 'web-devdocs',
    name: 'DevDocs',
    url: 'https://devdocs.io',
    iconName: 'Terminal',
    iconColor: '#f59e0b',
    category: 'Sviluppo',
    displayMode: 'window',
    description: 'Documentazione veloce per sviluppatori offline',
    isPinnedDesktop: false,
    isPinnedTaskbar: false,
  },
  {
    id: 'web-github',
    name: 'GitHub',
    url: 'https://github.com',
    iconName: 'GitBranch',
    iconColor: '#64748b',
    category: 'Sviluppo',
    displayMode: 'new_tab',
    description: 'Piattaforma di collaborazione codice',
    isPinnedDesktop: false,
    isPinnedTaskbar: false,
  },
];

export const StorageService = {
  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem('win_tablet_settings');
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Errore lettura settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: SystemSettings) {
    try {
      localStorage.setItem('win_tablet_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Errore salvataggio settings', e);
    }
  },

  getStickyNotes(): StickyNote[] {
    try {
      const data = localStorage.getItem('win_tablet_sticky_notes');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Errore lettura sticky notes', e);
    }
    return DEFAULT_STICKY_NOTES;
  },

  saveStickyNotes(notes: StickyNote[]) {
    try {
      localStorage.setItem('win_tablet_sticky_notes', JSON.stringify(notes));
    } catch (e) {
      console.error('Errore salvataggio sticky notes', e);
    }
  },

  getFiles(): VirtualFile[] {
    try {
      const data = localStorage.getItem('win_tablet_files');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Errore lettura file virtuali', e);
    }
    return DEFAULT_FILES;
  },

  saveFiles(files: VirtualFile[]) {
    try {
      localStorage.setItem('win_tablet_files', JSON.stringify(files));
    } catch (e) {
      console.error('Errore salvataggio file', e);
    }
  },

  getWebApps(): CustomWebApp[] {
    try {
      const data = localStorage.getItem('win_tablet_web_apps');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Errore lettura web apps', e);
    }
    return DEFAULT_WEB_APPS;
  },

  saveWebApps(apps: CustomWebApp[]) {
    try {
      localStorage.setItem('win_tablet_web_apps', JSON.stringify(apps));
    } catch (e) {
      console.error('Errore salvataggio web apps', e);
    }
  },

  // Calculate memory stats in localStorage
  getStorageStats() {
    let totalBytes = 0;
    const items: Record<string, number> = {};

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('win_tablet_')) {
          const val = localStorage.getItem(key) || '';
          const bytes = (key.length + val.length) * 2; // UTF-16
          items[key] = bytes;
          totalBytes += bytes;
        }
      }
    } catch (e) {
      console.warn('Errore calcolo spazio', e);
    }

    const estimatedQuota = 5 * 1024 * 1024; // 5 MB typical localStorage limit
    const freeQuota = Math.max(0, estimatedQuota - totalBytes);
    const usedPercent = Math.min(100, (totalBytes / estimatedQuota) * 100);

    return {
      totalBytes,
      totalKb: (totalBytes / 1024).toFixed(1),
      freeKb: (freeQuota / 1024).toFixed(1),
      usedPercent: usedPercent.toFixed(1),
      items,
    };
  },

  // Export full backup
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      files: this.getFiles(),
      stickyNotes: this.getStickyNotes(),
      webApps: this.getWebApps(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import backup
  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.files) this.saveFiles(data.files);
      if (data.stickyNotes) this.saveStickyNotes(data.stickyNotes);
      if (data.webApps) this.saveWebApps(data.webApps);
      return true;
    } catch (e) {
      console.error('Errore importazione backup', e);
      return false;
    }
  },

  resetAllToDefault() {
    localStorage.removeItem('win_tablet_settings');
    localStorage.removeItem('win_tablet_files');
    localStorage.removeItem('win_tablet_sticky_notes');
    localStorage.removeItem('win_tablet_web_apps');
  },
};
