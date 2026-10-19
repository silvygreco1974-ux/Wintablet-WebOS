import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Download,
  FilePlus,
  FolderOpen,
  Printer,
  Check,
  FileText,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Highlighter,
  Undo,
  Redo,
} from 'lucide-react';
import { VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';

interface TextEditorAppProps {
  initialFile?: VirtualFile | null;
  onSaveFile: (file: VirtualFile) => void;
  files: VirtualFile[];
}

export const TextEditorApp: React.FC<TextEditorAppProps> = ({
  initialFile,
  onSaveFile,
  files,
}) => {
  const [docTitle, setDocTitle] = useState(
    initialFile ? initialFile.name : 'Nuovo_Documento.doc'
  );
  const [currentFileId, setCurrentFileId] = useState<string | null>(
    initialFile ? initialFile.id : null
  );
  const [savedStatus, setSavedStatus] = useState<boolean>(true);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ words: 0, chars: 0, readTime: 1 });
  const [paperTone, setPaperTone] = useState<'natural' | 'pure' | 'ivory'>('natural');
  const [isWidePage, setIsWidePage] = useState<boolean>(false);
  const [docFontSize, setDocFontSize] = useState<number>(18);

  useEffect(() => {
    if (editorRef.current) {
      if (initialFile) {
        editorRef.current.innerHTML = initialFile.content;
        setDocTitle(initialFile.name);
        setCurrentFileId(initialFile.id);
      } else if (!editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = `<h2>Documento di Testo</h2><p>Questo foglio è ottimizzato per <strong>lettura e scrittura senza affaticamento visivo</strong> su tablet.</p><p>Usa la barra degli strumenti in alto per formattare con titoli, elenchi, grassetto, evidenziatore e corsivo.</p>`;
      }
      updateStats();
    }
  }, [initialFile]);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    setStats({ words, chars, readTime });
    setSavedStatus(false);
  };

  // Safe formatting command executor: prevents losing selection when clicking buttons
  const executeCmd = (command: string, value: string | undefined = undefined) => {
    sound.playClick();
    if (!editorRef.current) return;

    editorRef.current.focus();
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      console.warn('execCommand failed', e);
    }
    updateStats();
  };

  const handleSave = () => {
    sound.playNotification();
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const fileId = currentFileId || `doc-${Date.now()}`;
    const nameWithExt =
      docTitle.endsWith('.doc') || docTitle.endsWith('.txt') || docTitle.endsWith('.md')
        ? docTitle
        : `${docTitle}.doc`;

    const updatedFile: VirtualFile = {
      id: fileId,
      name: nameWithExt,
      type: 'doc',
      content,
      size: new Blob([content]).size,
      createdAt: initialFile?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveFile(updatedFile);
    setCurrentFileId(fileId);
    setSavedStatus(true);
  };

  const handleNew = () => {
    sound.playClick();
    if (editorRef.current) {
      editorRef.current.innerHTML = `<h2>Nuovo Documento</h2><p></p>`;
      setDocTitle('Nuovo_Documento.doc');
      setCurrentFileId(null);
      editorRef.current.focus();
      updateStats();
    }
  };

  const handleOpenFromDrive = (file: VirtualFile) => {
    sound.playClick();
    if (editorRef.current) {
      editorRef.current.innerHTML = file.content;
      setDocTitle(file.name);
      setCurrentFileId(file.id);
      setShowFileModal(false);
      editorRef.current.focus();
      updateStats();
      setSavedStatus(true);
    }
  };

  const handleDownloadFile = (format: 'html' | 'txt' | 'md') => {
    sound.playClick();
    if (!editorRef.current) return;
    let content = '';
    let mime = 'text/plain';

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.75;color:#0f172a;background:#faf9f6;}h1,h2,h3{color:#1e293b;}blockquote{border-left:4px solid #3b82f6;padding-left:1em;color:#475569;}</style></head><body>${editorRef.current.innerHTML}</body></html>`;
      mime = 'text/html';
    } else if (format === 'txt') {
      content = editorRef.current.innerText || '';
      mime = 'text/plain';
    } else if (format === 'md') {
      content = editorRef.current.innerText || '';
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docTitle.replace(/\.[^/.]+$/, '') + `.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // Eye-friendly natural paper tone styles
  const paperClass =
    paperTone === 'natural'
      ? 'bg-[#FAF8F3] text-[#0F172A] border-[#E8E2D5]'
      : paperTone === 'ivory'
      ? 'bg-[#FBF6ED] text-[#1C1917] border-[#EADFCB]'
      : 'bg-[#FFFFFF] text-[#0F172A] border-slate-300';

  const docFiles = files.filter((f) => f.type === 'doc');

  return (
    <div className="flex flex-col h-full bg-slate-200/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Action Ribbon - High Contrast with Finger-Friendly Buttons */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 shadow-sm gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setSavedStatus(false);
            }}
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64 truncate shadow-inner"
            title="Nome del documento"
          />

          <span className="text-xs font-bold hidden sm:inline">
            {savedStatus ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" /> Salvato
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">● Modificato</span>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
            title="Nuovo Documento"
          >
            <FilePlus className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">Nuovo</span>
          </button>

          <button
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
            title="Apri dal disco virtuale"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Apri</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-hex,#2563eb)] hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
            title="Salva file"
          >
            <Save className="w-4 h-4" />
            <span>Salva</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              title="Esporta file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl py-1.5 z-30 min-w-44 text-slate-800 dark:text-slate-200 font-bold">
              <button
                onClick={() => handleDownloadFile('txt')}
                className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                File Testo (.txt)
              </button>
              <button
                onClick={() => handleDownloadFile('html')}
                className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                Pagina Web (.html)
              </button>
              <button
                onClick={() => handleDownloadFile('md')}
                className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                Markdown (.md)
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-400" /> Stampa / PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar - Buttons use onMouseDown preventDefault to preserve selection */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('undo')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Annulla (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('redo')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Ripristina (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          {/* Bold, Italic, Underline */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('bold')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors font-bold"
            title="Grassetto"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('italic')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Corsivo"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('underline')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Sottolineato"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('strikeThrough')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Barrato"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Highlighter */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('hiliteColor', '#fef08a')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500 rounded-lg transition-colors"
            title="Evidenzia Testo"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          {/* Headings */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('formatBlock', '<h1>')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 rounded-lg transition-colors font-bold text-xs"
            title="Titolo H1 (Grande)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('formatBlock', '<h2>')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 rounded-lg transition-colors font-bold text-xs"
            title="Titolo H2 (Medio)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('formatBlock', '<h3>')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 rounded-lg transition-colors font-bold text-xs"
            title="Titolo H3 (Sottotitolo)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          {/* Lists */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('insertUnorderedList')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-600 rounded-lg transition-colors"
            title="Elenco puntato"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('insertOrderedList')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-600 rounded-lg transition-colors"
            title="Elenco numerato"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('formatBlock', '<blockquote>')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-purple-600 rounded-lg transition-colors"
            title="Citazione"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('formatBlock', '<pre>')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 rounded-lg transition-colors"
            title="Blocco Codice"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          {/* Alignment */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('justifyLeft')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Allinea a sinistra"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('justifyCenter')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Centra"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('justifyRight')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Allinea a destra"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Paper tone selector & Font Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom font */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 gap-1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setDocFontSize((s) => Math.max(14, s - 2))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Riduci Carattere"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-1 text-slate-800 dark:text-slate-200">
              {docFontSize}px
            </span>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setDocFontSize((s) => Math.min(32, s + 2))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Ingrandisci Carattere"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Paper Tone Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setPaperTone('natural')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                paperTone === 'natural' ? 'bg-amber-100 text-amber-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Carta Naturale
            </button>
            <button
              onClick={() => setPaperTone('pure')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                paperTone === 'pure' ? 'bg-slate-200 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Bianco Puro
            </button>
          </div>

          {/* Page Width Toggle */}
          <button
            onClick={() => setIsWidePage(!isWidePage)}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
            title={isWidePage ? 'Larghezza foglio standard' : 'Larghezza foglio estesa'}
          >
            {isWidePage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Document Workspace (Natural Paper Sheet with Full Focus & Typing) */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/90 dark:bg-slate-950 cursor-text"
        onClick={() => editorRef.current?.focus()}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            editorRef.current?.focus();
          }}
          className={`w-full ${
            isWidePage ? 'max-w-4xl' : 'max-w-2xl'
          } min-h-[700px] shadow-[0_12px_45px_rgba(0,0,0,0.18)] rounded-2xl p-8 sm:p-12 border transition-all duration-200 ${paperClass}`}
        >
          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={updateStats}
            spellCheck={false}
            tabIndex={0}
            role="textbox"
            aria-multiline="true"
            style={{
              fontSize: `${docFontSize}px`,
              lineHeight: '1.75',
            }}
            className="rich-editor-content focus:outline-none min-h-[550px] font-sans antialiased text-slate-900 select-text"
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>{stats.words} parole</span>
          <span>{stats.chars} caratteri</span>
          <span>~{stats.readTime} min lettura</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Foglio: {paperTone === 'natural' ? 'Carta Naturale (Antiriflesso)' : 'Bianco Puro'}</span>
          <span>• Carattere: {docFontSize}px</span>
        </div>
      </div>

      {/* Open File Modal */}
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
                <span>Apri Documento</span>
              </h3>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {docFiles.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nessun documento salvato nel disco.</p>
              ) : (
                docFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleOpenFromDrive(f)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5 font-bold text-sm text-slate-800 dark:text-slate-200">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{f.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(f.updatedAt).toLocaleDateString('it-IT')}
                    </span>
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
