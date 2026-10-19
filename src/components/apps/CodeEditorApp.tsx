import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Save,
  Download,
  Copy,
  Check,
  FolderOpen,
  FileCode,
  Layout,
  Terminal,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';

interface CodeEditorAppProps {
  initialFile?: VirtualFile | null;
  onSaveFile: (file: VirtualFile) => void;
  files: VirtualFile[];
}

const TEMPLATES: Record<string, { name: string; lang: string; code: string; desc: string }> = {
  clock: {
    name: 'Orologio Neon Live',
    lang: 'html',
    desc: 'Orologio digitale con lancette secondi e data',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      background: radial-gradient(circle at center, #1e293b, #0f172a);
      height: 100vh;
      margin: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #38bdf8;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      border: 3px solid #38bdf8;
      border-radius: 28px;
      padding: 36px 48px;
      text-align: center;
      box-shadow: 0 0 50px rgba(56, 189, 248, 0.35);
      max-width: 90%;
    }
    #time {
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: 3px;
      text-shadow: 0 0 30px rgba(56, 189, 248, 0.8);
      font-variant-numeric: tabular-nums;
    }
    #date {
      color: #f472b6;
      font-size: 1.3rem;
      margin-top: 14px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .badge {
      display: inline-block;
      margin-top: 18px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.15);
      color: #7dd3fc;
      font-size: 0.85rem;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="card">
    <div id="time">--:--:--</div>
    <div id="date">Oggi</div>
    <div class="badge">● In esecuzione su WinTablet</div>
  </div>
  <script>
    function update() {
      const now = new Date();
      document.getElementById('time').textContent = now.toLocaleTimeString('it-IT');
      document.getElementById('date').textContent = now.toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    setInterval(update, 1000);
    update();
  </script>
</body>
</html>`,
  },
  calculator: {
    name: 'Calcolatrice Touch',
    lang: 'html',
    desc: 'Calcolatrice interattiva con tasti a sfioramento',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      background: #090d16;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .calc {
      background: #1e293b;
      padding: 24px;
      border-radius: 28px;
      width: 320px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      border: 3px solid #3b82f6;
    }
    #display {
      width: 100%;
      height: 65px;
      background: #020617;
      color: #38bdf8;
      font-size: 2.2rem;
      text-align: right;
      padding: 12px 16px;
      border-radius: 16px;
      border: 2px solid #334155;
      margin-bottom: 20px;
      font-family: monospace;
      font-weight: bold;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    button {
      height: 56px;
      border-radius: 14px;
      border: none;
      font-size: 1.3rem;
      font-weight: bold;
      cursor: pointer;
      background: #334155;
      color: #ffffff;
      transition: all 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    button:active {
      transform: scale(0.92);
      background: #475569;
    }
    button.op {
      background: #2563eb;
      color: #ffffff;
    }
    button.op:active {
      background: #1d4ed8;
    }
    button.equal {
      background: #10b981;
      grid-column: span 2;
    }
    button.clear {
      background: #ef4444;
    }
  </style>
</head>
<body>
  <div class="calc">
    <input id="display" readonly value="0">
    <div class="grid">
      <button class="clear" onclick="clr()">C</button>
      <button class="op" onclick="add('/')">/</button>
      <button class="op" onclick="add('*')">×</button>
      <button class="op" onclick="del()">⌫</button>
      <button onclick="add('7')">7</button>
      <button onclick="add('8')">8</button>
      <button onclick="add('9')">9</button>
      <button class="op" onclick="add('-')">-</button>
      <button onclick="add('4')">4</button>
      <button onclick="add('5')">5</button>
      <button onclick="add('6')">6</button>
      <button class="op" onclick="add('+')">+</button>
      <button onclick="add('1')">1</button>
      <button onclick="add('2')">2</button>
      <button onclick="add('3')">3</button>
      <button onclick="add('.')">.</button>
      <button onclick="add('0')">0</button>
      <button class="equal" onclick="calc()">=</button>
    </div>
  </div>
  <script>
    const d = document.getElementById('display');
    function add(v) {
      if (d.value === '0' && v !== '.') d.value = v;
      else d.value += v;
    }
    function clr() { d.value = '0'; }
    function del() {
      d.value = d.value.length > 1 ? d.value.slice(0, -1) : '0';
    }
    function calc() {
      try {
        const expr = d.value.replace(/×/g, '*');
        const res = Function('"use strict"; return (' + expr + ')')();
        d.value = String(res);
      } catch(e) {
        d.value = 'Errore';
      }
    }
  </script>
</body>
</html>`,
  },
  particles: {
    name: 'Canvas Particelle',
    lang: 'html',
    desc: 'Animazione 60fps particelle interattive al tocco',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #050811;
    }
    canvas {
      display: block;
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const colors = ['#f43f5e', '#38bdf8', '#a855f7', '#facc15', '#10b981'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function loop() {
      ctx.fillStyle = 'rgba(5, 8, 17, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
  },
  jsTest: {
    name: 'Algoritmi JS',
    lang: 'javascript',
    desc: 'Script di benchmark memoria tablet e matematica',
    code: `// Test JavaScript nel browser con console a colori
console.log("=== BENVENUTO IN DEVSTUDIO LITE ===");
console.log("Sistema: WinTablet WebOS");
console.log("Data:", new Date().toLocaleString('it-IT'));

// 1. Calcolo Fattoriale
function calcolaFattoriale(n) {
  if (n <= 1) return 1;
  return n * calcolaFattoriale(n - 1);
}

console.log("--- TEST MATEMATICO ---");
for (let i = 1; i <= 6; i++) {
  console.log("Fattoriale di", i, "=>", calcolaFattoriale(i));
}

// 2. Calcolo Risparmio Memoria Tablet
const appPesantiMb = {
  officeDesk: 520,
  codeEditorNative: 450,
  browserStandalone: 380,
  socialApps: 900
};

const totaleMbRisparmiati = Object.values(appPesantiMb).reduce((a, b) => a + b, 0);

console.log("--- RISPARMIO SPAZIO TABLET ---");
console.log("Spazio app native evitate:", totaleMbRisparmiati + " MB (" + (totaleMbRisparmiati / 1024).toFixed(2) + " GB)");
console.log("Spazio occupato da WinTablet:", "< 2.5 MB nella cache PWA!");
console.log("Efficienza memoria:", "99.8% di memoria interna salvaguardata.");
`,
  },
};

export const CodeEditorApp: React.FC<CodeEditorAppProps> = ({
  initialFile,
  onSaveFile,
  files,
}) => {
  const [code, setCode] = useState<string>(() => {
    if (initialFile) return initialFile.content;
    return TEMPLATES.clock.code;
  });

  const [language, setLanguage] = useState<string>(() => {
    if (initialFile?.language) return initialFile.language;
    return 'html';
  });

  const [fileName, setFileName] = useState<string>(() => {
    if (initialFile) return initialFile.name;
    return 'app_orologio.html';
  });

  const [currentFileId, setCurrentFileId] = useState<string | null>(() => {
    return initialFile ? initialFile.id : null;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [fontSize, setFontSize] = useState<number>(18);
  const [previewCode, setPreviewCode] = useState<string>(() => {
    if (initialFile) return initialFile.content;
    return TEMPLATES.clock.code;
  });
  const [runKey, setRunKey] = useState<number>(0);
  const [savedStatus, setSavedStatus] = useState<boolean>(true);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; msg: string }[]>([]);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);

  // Editor internal canvas theme (Dark mode by default avoids eye strain, or Light mode with comfortable paper tone)
  const [isEditorDark, setIsEditorDark] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Core execution engine: works for HTML, JS, and all templates
  const executeCode = (codeToRun: string, lang: string) => {
    setActiveTab('split'); // Keep both code and live runner visible
    setConsoleLogs([]);

    if (lang === 'javascript' || lang === 'typescript') {
      const logs: { type: string; msg: string }[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          logs.push({
            type: 'log',
            msg: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
        error: (...args: any[]) => {
          logs.push({
            type: 'error',
            msg: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
        warn: (...args: any[]) => {
          logs.push({
            type: 'warn',
            msg: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
      };

      try {
        const runFn = new Function('console', codeToRun);
        runFn(customConsole);
        logs.push({ type: 'success', msg: '✓ Esecuzione JS completata con successo.' });
      } catch (err: any) {
        logs.push({ type: 'error', msg: `Errore Runtime: ${err.message}` });
      }
      setConsoleLogs(logs);
      return;
    }

    // HTML runner: update previewCode and increment runKey to re-render iframe smoothly
    setPreviewCode(codeToRun);
    setRunKey((k) => k + 1);
  };

  useEffect(() => {
    if (initialFile) {
      setCode(initialFile.content);
      setLanguage(initialFile.language || 'html');
      setFileName(initialFile.name);
      setCurrentFileId(initialFile.id);
      setSavedStatus(true);
      executeCode(initialFile.content, initialFile.language || 'html');
    }
  }, [initialFile]);

  const handleRun = () => {
    sound.playClick();
    executeCode(code, language);
  };

  const handleSave = () => {
    sound.playNotification();
    const fileId = currentFileId || `code-${Date.now()}`;
    const updatedFile: VirtualFile = {
      id: fileId,
      name: fileName,
      type: 'code',
      language,
      content: code,
      size: new Blob([code]).size,
      createdAt: initialFile?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSaveFile(updatedFile);
    setCurrentFileId(fileId);
    setSavedStatus(true);
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDownload = () => {
    sound.playClick();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Instant Template Loader: updates code, sets lang, and auto-executes immediately!
  const loadTemplate = (key: string) => {
    sound.playClick();
    const t = TEMPLATES[key];
    if (t) {
      setCode(t.code);
      setLanguage(t.lang);
      setFileName(t.lang === 'html' ? `${key}.html` : `${key}.js`);
      setCurrentFileId(null);
      setSavedStatus(false);
      executeCode(t.code, t.lang);
    }
  };

  const lineCount = code.split('\n').length;
  const codeFiles = files.filter((f) => f.type === 'code');

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 shadow-sm gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shrink-0">
            <FileCode className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setSavedStatus(false);
            }}
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 w-44 sm:w-60 truncate shadow-inner"
            title="Nome del file di codice"
          />

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setSavedStatus(false);
            }}
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="html">HTML / CSS / JS</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
          </select>

          <span className="text-xs font-bold hidden md:inline">
            {savedStatus ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Salvato
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">● Modificato</span>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Big RUN Button */}
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl font-black text-sm shadow-[0_4px_16px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            title="Esegui Codice (Play)"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>ESEGUI</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            title="Salva file"
          >
            <Save className="w-4 h-4" />
            <span>Salva</span>
          </button>

          {/* Open Existing File Modal */}
          <button
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            title="Apri file salvato"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Apri</span>
          </button>

          {/* Zoom Font Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 gap-1">
            <button
              onClick={() => setFontSize((f) => Math.max(14, f - 2))}
              className="p-1 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded font-bold"
              title="Riduci Carattere"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold px-1 font-mono text-slate-900 dark:text-slate-100">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize((f) => Math.min(32, f + 2))}
              className="p-1 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded font-bold"
              title="Ingrandisci Carattere"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Light/Dark Editor Canvas Toggle */}
          <button
            onClick={() => setIsEditorDark(!isEditorDark)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 transition-colors"
            title={isEditorDark ? 'Passa a sfondo editor chiaro' : 'Passa a sfondo editor scuro'}
          >
            {isEditorDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          {/* View Tab Switcher */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              Codice
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'split'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              Anteprima
            </button>
          </div>
        </div>
      </div>

      {/* Templates Quick Bar - 1-Click Working Examples */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-xs overflow-x-auto">
        <span className="text-amber-600 dark:text-amber-400 font-extrabold shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Esempi Funzionanti:
        </span>
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => loadTemplate(key)}
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-extrabold rounded-lg whitespace-nowrap transition-all border border-slate-300 dark:border-slate-700 shadow-sm hover:border-emerald-500 hover:scale-105 active:scale-95 flex items-center gap-1.5"
            title={`${t.desc} (Tocca per eseguire)`}
          >
            <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Workspace Area: Code Editor + Live Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Code Editor Column */}
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div
            className={`flex flex-col ${
              activeTab === 'split' ? 'w-full md:w-1/2 border-b md:border-b-0 md:border-r-2 border-slate-300 dark:border-slate-700' : 'w-full'
            } h-full ${isEditorDark ? 'bg-[#0d1117] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}
          >
            <div className="flex-1 flex overflow-hidden relative">
              {/* Line Numbers */}
              <div
                className={`w-14 select-none py-3 text-right pr-2 shrink-0 overflow-hidden font-mono font-bold leading-relaxed border-r ${
                  isEditorDark
                    ? 'bg-[#090d13] text-slate-500 border-slate-800'
                    : 'bg-slate-200/70 text-slate-500 border-slate-300'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {Array.from({ length: Math.min(lineCount, 600) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Native Code Editor Textarea (Large, Responsive, High Contrast) */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setSavedStatus(false);
                }}
                spellCheck={false}
                className={`flex-1 p-3.5 font-mono leading-relaxed resize-none focus:outline-none overflow-auto whitespace-pre tab-4 ${
                  isEditorDark
                    ? 'bg-[#0d1117] text-[#58a6ff] caret-white selection:bg-blue-600/60'
                    : 'bg-[#f8fafc] text-[#0969da] caret-black selection:bg-blue-200'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'JetBrains Mono', monospace",
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* Live Preview / Console Column */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`flex flex-col ${activeTab === 'split' ? 'w-full md:w-1/2' : 'w-full'} h-full bg-slate-100 dark:bg-slate-900`}>
            {language === 'javascript' || language === 'typescript' ? (
              // JS Console Panel with Color Logs
              <div className="flex flex-col h-full bg-[#030712] text-slate-100 font-mono">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-700 text-xs">
                  <span className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Terminal className="w-4 h-4" /> Console Output JavaScript
                  </span>
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                  >
                    Pulisci console
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2 text-base leading-relaxed">
                  {consoleLogs.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Nessun output registrato. Clicca <strong>▶ ESEGUI</strong> in alto per avviare il codice JS.
                    </div>
                  ) : (
                    consoleLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg font-mono text-sm ${
                          log.type === 'error'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : log.type === 'warn'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : log.type === 'success'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-bold'
                            : 'text-cyan-300'
                        }`}
                      >
                        {log.msg}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // HTML / CSS / JS Sandbox Runner
              <div className="flex flex-col h-full bg-white">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Anteprima Web Interattiva
                  </span>
                  <button
                    onClick={handleRun}
                    className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Ricarica Anteprima"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <iframe
                  key={runKey}
                  srcDoc={previewCode}
                  title="Live Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full flex-1 border-none bg-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Open Modal */}
      {showFileModal && (
        <div
          onClick={() => setShowFileModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <span>Apri File Codice</span>
              </h3>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {codeFiles.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nessun file di codice salvato nel disco.</p>
              ) : (
                codeFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      sound.playClick();
                      setCode(f.content);
                      setFileName(f.name);
                      setLanguage(f.language || 'html');
                      setCurrentFileId(f.id);
                      setSavedStatus(true);
                      setShowFileModal(false);
                      executeCode(f.content, f.language || 'html');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                      <FileCode className="w-4 h-4 text-emerald-500" />
                      <span>{f.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{f.language?.toUpperCase()}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
