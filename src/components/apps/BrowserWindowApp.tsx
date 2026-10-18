import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Lock,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface BrowserWindowAppProps {
  initialUrl?: string;
  title?: string;
}

export const BrowserWindowApp: React.FC<BrowserWindowAppProps> = ({
  initialUrl = 'https://it.wikipedia.org',
  title = 'Web Browser',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    setUrl(target);
    setInputUrl(target);
    setHasError(false);
  };

  const handleReload = () => {
    sound.playClick();
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    setHasError(false);
  };

  const handleOpenExternal = () => {
    sound.playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-text overflow-hidden">
      {/* Browser Navigation Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <button
          onClick={handleReload}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors"
          title="Ricarica"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center min-w-0">
          <div className="flex items-center w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus-within:border-blue-500 rounded-lg px-2.5 py-1">
            <Lock className="w-3 h-3 text-emerald-400 mr-2 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
              placeholder="Inserisci indirizzo web o URL..."
            />
          </div>
        </form>

        <button
          onClick={handleOpenExternal}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors shrink-0"
          title="Apri in scheda esterna (consigliato se il sito blocca l'incorporamento)"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Apri Esterno</span>
        </button>
      </div>

      {/* Info notice about iframe limitations on some external domains */}
      <div className="px-3 py-1 bg-slate-900/40 border-b border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 truncate">
          <Globe className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Visualizzazione web protetta</span>
        </span>
        <button
          onClick={handleOpenExternal}
          className="text-blue-400 hover:underline shrink-0 ml-2"
        >
          Non vedi il sito? Clicca qui per aprirlo
        </button>
      </div>

      {/* Main Web View Canvas */}
      <div className="flex-1 relative bg-white">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 bg-white"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};
