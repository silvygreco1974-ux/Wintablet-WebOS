import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Save,
  Copy,
  Check,
  FolderOpen,
  FileCode,
  Terminal,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Sun,
  Moon,
  Trash2,
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
      padding: 28px 40px;
      text-align: center;
      box-shadow: 0 0 50px rgba(56, 189, 248, 0.35);
      max-width: 92%;
    }
    #time {
      font-size: clamp(2.2rem, 8vw, 4rem);
      font-weight: 900;
      letter-spacing: 3px;
      text-shadow: 0 0 30px rgba(56, 189, 248, 0.8);
      font-variant-numeric: tabular-nums;
    }
    #date {
      color: #f472b6;
      font-size: 1.15rem;
      margin-top: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .badge {
      display: inline-block;
      margin-top: 16px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.15);
      color: #7dd3fc;
      font-size: 0.8rem;
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
      padding: 12px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .calc {
      background: #1e293b;
      padding: 18px;
      border-radius: 24px;
      width: 100%;
      max-width: 300px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      border: 2px solid #3b82f6;
    }
    #display {
      width: 100%;
      height: 56px;
      background: #020617;
      color: #38bdf8;
      font-size: 1.8rem;
      text-align: right;
      padding: 10px 14px;
      border-radius: 14px;
      border: 2px solid #334155;
      margin-bottom: 14px;
      font-family: monospace;
      font-weight: bold;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    button {
      height: 48px;
      border-radius: 12px;
      border: none;
      font-size: 1.2rem;
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
    desc: 'Animazione 60fps particelle interattive',
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

    for (let i = 0; i < 70; i++) {
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

function calcolaFattoriale(n) {
  if (n <= 1) return 1;
  return n * calcolaFattoriale(n - 1);
}

console.log("--- TEST MATEMATICO ---");
for (let i = 1; i <= 6; i++) {
  console.log("Fattoriale di", i, "=>", calcolaFattoriale(i));
}

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

// Lightweight TypeScript annotation stripper so common TS snippets execute cleanly in-browser
function transpileBasicTypeScript(tsCode: string): string {
  return tsCode
    // Remove interface declarations (single-level balanced braces)
    .replace(/^\s*(?:export\s+)?interface\s+\w+(?:\s*<[^>]*>)?(?:\s+extends\s+[^{]+)?\s*\{[^}]*\}\s*;?/gm, '')
    // Remove type aliases
    .replace(/^\s*(?:export\s+)?type\s+\w+(?:\s*<[^>]*>)?\s*=\s*[^;\n]+;?/gm, '')
    // Remove import type lines
    .replace(/^\s*import\s+type\s+.*;?\s*$/gm, '')
    // Strip export keyword for inline execution
    .replace(/^\s*export\s+(?=(?:const|let|var|function|class|async)\b)/gm, '')
    // Strip variable type annotations: const x: Type = ... -> const x = ...
    .replace(/\b(const|let|var)\s+([a-zA-Z_$][\w$]*)\s*:\s*[^=;]+(?==)/g, '$1 $2 ')
    // Strip function parameter type annotations: (a: number, b: string) -> (a, b)
    .replace(/(\(|,)\s*([a-zA-Z_$][\w$]*)\??\s*:\s*[a-zA-Z_$][\w$<>\[\]\s|&]*(?=[,)=])/g, '$1 $2')
    // Strip function return type annotations before '{' or '=>'
    .replace(/\)\s*:\s*[a-zA-Z_$][\w$<>\[\]\s|&]*(?=\s*(?:\{|=>))/g, ')')
    // Strip `as Type` assertions
    .replace(/\s+as\s+[a-zA-Z_$][\w$<>\[\]|&]*/g, '');
}

// Wrap HTML code with safe postMessage console & error bridge
function buildHtmlSrcDoc(rawHtml: string): string {
  const bridgeScript = `<script>
(function(){
  function fmt(a){
    if(typeof a==='string') return a;
    try{ return JSON.stringify(a); }catch(e){ return String(a); }
  }
  function send(type, args){
    try{
      window.parent.postMessage({
        source: 'wintablet-html-runner',
        type: type,
        msg: Array.prototype.slice.call(args).map(fmt).join(' ')
      }, '*');
    }catch(e){}
  }
  var origLog=console.log, origWarn=console.warn, origErr=console.error, origInfo=console.info;
  console.log=function(){ send('log', arguments); origLog.apply(console, arguments); };
  console.info=function(){ send('log', arguments); origInfo.apply(console, arguments); };
  console.warn=function(){ send('warn', arguments); origWarn.apply(console, arguments); };
  console.error=function(){ send('error', arguments); origErr.apply(console, arguments); };
  window.addEventListener('error', function(ev){
    send('error', ['Errore JS: ' + ev.message + (ev.lineno ? ' (riga ' + ev.lineno + ')' : '')]);
  });
  window.addEventListener('unhandledrejection', function(ev){
    send('error', ['Promise rifiutata: ' + (ev.reason && ev.reason.message ? ev.reason.message : ev.reason)]);
  });
})();
</script>`;

  if (/<head[^>]*>/i.test(rawHtml)) {
    return rawHtml.replace(/<head([^>]*)>/i, `<head$1>${bridgeScript}`);
  }
  if (/<html[^>]*>/i.test(rawHtml)) {
    return rawHtml.replace(/<html([^>]*)>/i, `<html$1><head>${bridgeScript}</head>`);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${bridgeScript}</head><body>${rawHtml}</body></html>`;
}

function formatLogArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

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
  const [fontSize, setFontSize] = useState<number>(16);
  const [previewCode, setPreviewCode] = useState<string>(() => {
    if (initialFile) return initialFile.content;
    return TEMPLATES.clock.code;
  });
  const [runKey, setRunKey] = useState<number>(0);
  const [savedStatus, setSavedStatus] = useState<boolean>(true);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; msg: string }[]>([]);
  const [htmlLogs, setHtmlLogs] = useState<{ type: string; msg: string }[]>([]);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const [isEditorDark, setIsEditorDark] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Listen to logs & runtime errors coming from HTML preview iframe
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.source === 'wintablet-html-runner') {
        setHtmlLogs((prev) => [...prev.slice(-49), { type: ev.data.type, msg: ev.data.msg }]);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const executeCode = useCallback((codeToRun: string, lang: string) => {
    setActiveTab((prev) => (prev === 'editor' ? 'split' : prev));
    setConsoleLogs([]);
    setHtmlLogs([]);

    if (lang === 'json') {
      try {
        const parsed = JSON.parse(codeToRun);
        const pretty = JSON.stringify(parsed, null, 2);
        setConsoleLogs([
          { type: 'success', msg: '✓ JSON valido!' },
          { type: 'log', msg: pretty },
        ]);
      } catch (err: any) {
        setConsoleLogs([{ type: 'error', msg: `Errore sintassi JSON: ${err.message}` }]);
      }
      return;
    }

    if (lang === 'javascript' || lang === 'typescript') {
      const logs: { type: string; msg: string }[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push({ type: 'log', msg: args.map(formatLogArg).join(' ') });
        },
        info: (...args: unknown[]) => {
          logs.push({ type: 'log', msg: args.map(formatLogArg).join(' ') });
        },
        error: (...args: unknown[]) => {
          logs.push({ type: 'error', msg: args.map(formatLogArg).join(' ') });
        },
        warn: (...args: unknown[]) => {
          logs.push({ type: 'warn', msg: args.map(formatLogArg).join(' ') });
        },
        table: (data: unknown) => {
          logs.push({ type: 'log', msg: formatLogArg(data) });
        },
      };

      try {
        const jsToRun =
          lang === 'typescript' ? transpileBasicTypeScript(codeToRun) : codeToRun;
        const runFn = new Function('console', `"use strict";\n${jsToRun}`);
        const returnVal = runFn(customConsole);
        if (returnVal !== undefined) {
          logs.push({ type: 'log', msg: `↳ Ritorno: ${formatLogArg(returnVal)}` });
        }
        logs.push({
          type: 'success',
          msg: `✓ Esecuzione ${lang === 'typescript' ? 'TypeScript' : 'JavaScript'} completata.`,
        });
      } catch (err: any) {
        logs.push({ type: 'error', msg: `Errore Runtime: ${err.message}` });
      }
      setConsoleLogs(logs);
      return;
    }

    // HTML / CSS / JS runner
    setPreviewCode(codeToRun);
    setRunKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (initialFile) {
      setCode(initialFile.content);
      setLanguage(initialFile.language || 'html');
      setFileName(initialFile.name);
      setCurrentFileId(initialFile.id);
      setSavedStatus(true);
      executeCode(initialFile.content, initialFile.language || 'html');
    }
  }, [initialFile, executeCode]);

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

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(nextCode);
      setSavedStatus(false);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const lineCount = code.split('\n').length;
  const codeFiles = files.filter((f) => f.type === 'code');
  const isConsoleLang = language === 'javascript' || language === 'typescript' || language === 'json';

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Row 1: Primary File & Core Actions Bar */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="hidden sm:flex p-1.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
            <FileCode className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setSavedStatus(false);
            }}
            className="min-w-0 w-28 sm:w-44 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 truncate"
            title="Nome del file di codice"
          />

          <select
            value={language}
            onChange={(e) => {
              const nextLang = e.target.value;
              setLanguage(nextLang);
              setSavedStatus(false);
            }}
            className="shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="html">HTML / CSS / JS</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
          </select>

          <span className="text-xs font-bold hidden lg:inline shrink-0">
            {savedStatus ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Salvato
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">● Modificato</span>
            )}
          </span>
        </div>

        {/* Core Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-sm transition-all shrink-0"
            title="Esegui Codice (Ctrl+Invio)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>ESEGUI</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
            title="Salva file"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salva</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors shrink-0"
            title="Apri file salvato"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Apri</span>
          </button>
        </div>
      </div>

      {/* Row 2: View Switcher, Horizontally Scrollable Templates & Editor Tools */}
      <div className="shrink-0 flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-xs overflow-x-auto whitespace-nowrap">
        {/* View Tab Switcher */}
        <div className="shrink-0 flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Codice
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              activeTab === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Anteprima
          </button>
        </div>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

        {/* Templates */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-amber-600 dark:text-amber-400 font-extrabold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Esempi:
          </span>
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadTemplate(key)}
              className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-extrabold rounded-lg whitespace-nowrap transition-all border border-slate-300 dark:border-slate-700 shadow-sm hover:border-emerald-500 active:scale-95 flex items-center gap-1.5"
              title={`${t.desc} (Tocca per eseguire)`}
            >
              <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 shrink-0 ml-auto" />

        {/* Secondary Editor Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setFontSize((f) => Math.max(12, f - 2))}
              className="p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold"
              title="Riduci Carattere"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-extrabold px-1 font-mono text-slate-900 dark:text-slate-100">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => setFontSize((f) => Math.min(28, f + 2))}
              className="p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold"
              title="Ingrandisci Carattere"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditorDark(!isEditorDark)}
            className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 transition-colors"
            title={isEditorDark ? 'Sfondo editor chiaro' : 'Sfondo editor scuro'}
          >
            {isEditorDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            title="Copia codice"
          >
            {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Workspace Area: Code Editor + Live Preview (Fixes mobile/tablet split height!) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Code Editor Column */}
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div
            className={`flex flex-col min-h-0 ${
              activeTab === 'split'
                ? 'w-full md:w-1/2 h-1/2 md:h-full border-b-2 md:border-b-0 md:border-r-2 border-slate-300 dark:border-slate-700'
                : 'w-full h-full'
            } ${isEditorDark ? 'bg-[#0d1117] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}
          >
            <div className="flex-1 min-h-0 flex overflow-hidden relative">
              {/* Line Numbers */}
              <div
                ref={lineNumbersRef}
                className={`w-12 select-none py-3 text-right pr-2 shrink-0 overflow-hidden font-mono font-bold leading-relaxed border-r ${
                  isEditorDark
                    ? 'bg-[#090d13] text-slate-500 border-slate-800'
                    : 'bg-slate-200/70 text-slate-500 border-slate-300'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {Array.from({ length: Math.min(lineCount, 800) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Native Code Editor Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setSavedStatus(false);
                }}
                onScroll={handleTextareaScroll}
                onKeyDown={handleTextareaKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                className={`flex-1 p-3 font-mono leading-relaxed resize-none focus:outline-none overflow-auto whitespace-pre ${
                  isEditorDark
                    ? 'bg-[#0d1117] text-[#58a6ff] caret-white selection:bg-blue-600/60'
                    : 'bg-[#f8fafc] text-[#0969da] caret-black selection:bg-blue-200'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'JetBrains Mono', monospace",
                  tabSize: 2,
                  touchAction: 'manipulation',
                }}
              />
            </div>
          </div>
        )}

        {/* Live Preview / Console Column */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div
            className={`flex flex-col min-h-0 ${
              activeTab === 'split' ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full'
            } bg-slate-100 dark:bg-slate-900`}
          >
            {isConsoleLang ? (
              // JS / TS / JSON Console Panel
              <div className="flex flex-col h-full min-h-0 bg-[#030712] text-slate-100 font-mono">
                <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700 text-xs">
                  <span className="flex items-center gap-2 text-amber-400 font-extrabold text-xs sm:text-sm">
                    <Terminal className="w-4 h-4" />
                    {language === 'json'
                      ? 'Validatore & Output JSON'
                      : language === 'typescript'
                      ? 'Console Output TypeScript'
                      : 'Console Output JavaScript'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRun}
                      className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> Esegui
                    </button>
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                    >
                      Pulisci
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-2 text-sm leading-relaxed">
                  {consoleLogs.length === 0 ? (
                    <div className="text-slate-400 italic">
                      Premi <strong className="text-emerald-400">▶ ESEGUI</strong> per eseguire il codice e vedere il risultato qui.
                    </div>
                  ) : (
                    consoleLogs.map((log, index) => (
                      <pre
                        key={index}
                        className={`p-2.5 rounded-lg font-mono text-xs sm:text-sm whitespace-pre-wrap break-words ${
                          log.type === 'error'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800'
                            : log.type === 'warn'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                            : log.type === 'success'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 font-bold'
                            : 'text-cyan-300 bg-slate-900/60 border border-slate-800'
                        }`}
                      >
                        {log.msg}
                      </pre>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // HTML / CSS / JS Sandbox Runner with Live Error & Console Feed
              <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-950">
                <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Anteprima Web Interattiva
                  </span>
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1 px-2 py-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Ricarica Anteprima"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ricarica</span>
                  </button>
                </div>

                <iframe
                  key={runKey}
                  srcDoc={buildHtmlSrcDoc(previewCode)}
                  title="Live Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full flex-1 min-h-0 border-none bg-white"
                />

                {htmlLogs.length > 0 && (
                  <div className="shrink-0 max-h-28 overflow-y-auto bg-slate-950 border-t border-slate-700 p-2 font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold pb-1 border-b border-slate-800">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-amber-400" /> Console HTML ({htmlLogs.length})
                      </span>
                      <button
                        onClick={() => setHtmlLogs([])}
                        className="hover:text-white flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Pulisci
                      </button>
                    </div>
                    {htmlLogs.map((l, idx) => (
                      <div
                        key={idx}
                        className={
                          l.type === 'error'
                            ? 'text-rose-400'
                            : l.type === 'warn'
                            ? 'text-amber-300'
                            : 'text-cyan-300'
                        }
                      >
                        {l.msg}
                      </div>
                    ))}
                  </div>
                )}
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
