import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Highlighter,
  Undo,
  Redo,
  Type,
  Palette,
  Minus,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { VirtualFile } from '../../types/os';
import { sound } from '../../utils/audio';

interface TextEditorAppProps {
  initialFile?: VirtualFile | null;
  onSaveFile: (file: VirtualFile) => void;
  files: VirtualFile[];
}

const FONT_OPTIONS = [
  { label: 'Plus Jakarta', matchKey: 'plus', value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { label: 'Playfair Serif', matchKey: 'playfair', value: "'Playfair Display', Georgia, serif" },
  { label: 'Roboto Slab', matchKey: 'roboto', value: "'Roboto Slab', serif" },
  { label: 'Oswald Compatto', matchKey: 'oswald', value: "'Oswald', sans-serif" },
  { label: 'Caveat (Mano)', matchKey: 'caveat', value: "'Caveat', cursive" },
  { label: 'JetBrains Mono', matchKey: 'jetbrains', value: "'JetBrains Mono', monospace" },
];

const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48];

const COLOR_SWATCHES = [
  '#0f172a',
  '#334155',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
];

type ActiveBlockType = 'p' | 'h1' | 'h2' | 'h3' | 'pre' | 'blockquote' | 'ul' | 'ol';

const BLOCK_LABELS: Record<ActiveBlockType, string> = {
  p: 'Normale',
  h1: 'Titolo H1',
  h2: 'Titolo H2',
  h3: 'Titolo H3',
  pre: 'Codice',
  blockquote: 'Citazione',
  ul: 'Elenco',
  ol: 'Lista Num.',
};

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#0f172a';
  const r = Number(match[0]).toString(16).padStart(2, '0');
  const g = Number(match[1]).toString(16).padStart(2, '0');
  const b = Number(match[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
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
  const savedRangeRef = useRef<Range | null>(null);
  const isComposingRef = useRef<boolean>(false);
  const statsTimerRef = useRef<number | null>(null);
  const initializedRef = useRef<string | null>(null);

  const [stats, setStats] = useState({ words: 0, chars: 0, readTime: 1 });
  const [paperTone, setPaperTone] = useState<'natural' | 'pure' | 'ivory'>('natural');
  const [isWidePage, setIsWidePage] = useState<boolean>(false);

  // Touch-safe custom popover menus (never blur contentEditable on tablet!)
  const [openMenu, setOpenMenu] = useState<'font' | 'size' | 'color' | 'export' | null>(null);

  // Selective formatting inspector states
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [selectedFontSize, setSelectedFontSize] = useState<number>(18);
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a');
  const [activeBlock, setActiveBlock] = useState<ActiveBlockType>('p');

  const inspectorRef = useRef({
    font: FONT_OPTIONS[0].value,
    size: 18,
    color: '#0f172a',
    block: 'p' as ActiveBlockType,
  });

  const computeStatsNow = useCallback((markDirty = true) => {
    if (!editorRef.current) return;
    const text = (editorRef.current.innerText || '').replace(/\u200B/g, '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    setStats({ words, chars, readTime });
    if (markDirty) setSavedStatus(false);
  }, []);

  // Debounced stats update so tablet typing never stutters or loses cursor focus
  const scheduleStatsUpdate = useCallback(
    (markDirty = true) => {
      if (statsTimerRef.current) window.clearTimeout(statsTimerRef.current);
      statsTimerRef.current = window.setTimeout(() => {
        computeStatsNow(markDirty);
      }, 220);
    },
    [computeStatsNow]
  );

  useEffect(() => {
    return () => {
      if (statsTimerRef.current) window.clearTimeout(statsTimerRef.current);
    };
  }, []);

  const styleLockUntilRef = useRef<number>(0);

  const syncSelectionInspector = useCallback(() => {
    if (isComposingRef.current) return;
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    savedRangeRef.current = range.cloneRange();

    // If a toolbar change just set the style & re-bound selection, let it settle cleanly
    if (Date.now() < styleLockUntilRef.current) return;

    let anchorNode: Node | null = sel.anchorNode;
    if (!range.collapsed && anchorNode === editor) {
      anchorNode = range.startContainer;
    }

    let anchorEl: HTMLElement | null =
      anchorNode?.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : (anchorNode as HTMLElement | null);

    // If range starts at an element boundary (e.g., <p> wrapping a <span>), inspect the inner styled child first
    if (anchorEl && anchorEl === range.startContainer && range.startOffset < anchorEl.childNodes.length) {
      const childAtOffset = anchorEl.childNodes[range.startOffset];
      if (childAtOffset?.nodeType === Node.ELEMENT_NODE) {
        anchorEl = childAtOffset as HTMLElement;
      } else if (childAtOffset?.nodeType === Node.TEXT_NODE && childAtOffset.parentElement) {
        anchorEl = childAtOffset.parentElement;
      }
    }

    if (anchorEl && editor.contains(anchorEl)) {
      const computed = window.getComputedStyle(anchorEl);
      const inlinePx = anchorEl.style?.fontSize ? parseFloat(anchorEl.style.fontSize) : NaN;
      const rawPx = !Number.isNaN(inlinePx) ? inlinePx : parseFloat(computed.fontSize) || 18;
      const px = Math.max(10, Math.min(72, Math.round(rawPx)));
      const hex = rgbToHex(computed.color);

      const inlineFamily = (anchorEl.style?.fontFamily || '').toLowerCase();
      const cf = inlineFamily || computed.fontFamily.toLowerCase();
      const matchedFont = FONT_OPTIONS.find((opt) => cf.includes(opt.matchKey));
      const fontVal = matchedFont ? matchedFont.value : FONT_OPTIONS[0].value;

      let node: HTMLElement | null = anchorEl;
      let detected: ActiveBlockType = 'p';
      while (node && node !== editor) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'pre') {
          detected = 'pre';
          break;
        }
        if (tag === 'blockquote') {
          detected = 'blockquote';
          break;
        }
        if (tag === 'ul') {
          detected = 'ul';
          break;
        }
        if (tag === 'ol') {
          detected = 'ol';
          break;
        }
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
          detected = tag;
          break;
        }
        node = node.parentElement;
      }

      if (inspectorRef.current.size !== px) {
        inspectorRef.current.size = px;
        setSelectedFontSize(px);
      }
      if (inspectorRef.current.color !== hex) {
        inspectorRef.current.color = hex;
        setSelectedColor(hex);
      }
      if (inspectorRef.current.font !== fontVal) {
        inspectorRef.current.font = fontVal;
        setSelectedFontFamily(fontVal);
      }
      if (inspectorRef.current.block !== detected) {
        inspectorRef.current.block = detected;
        setActiveBlock(detected);
      }
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => syncSelectionInspector();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [syncSelectionInspector]);

  // Only load initialFile into editorRef when its ID changes (prevents overwriting edits or losing focus)
  useEffect(() => {
    const targetKey = initialFile ? initialFile.id : '__default__';
    if (editorRef.current && initializedRef.current !== targetKey) {
      initializedRef.current = targetKey;
      if (initialFile) {
        editorRef.current.innerHTML = initialFile.content;
        setDocTitle(initialFile.name);
        setCurrentFileId(initialFile.id);
        setSavedStatus(true);
      } else if (!editorRef.current.innerHTML.trim()) {
        editorRef.current.innerHTML = `<h2>Documento di Testo</h2><p>Tocca qui e inizia a scrivere sul tuo tablet. Seleziona qualsiasi parola per cambiare <strong>font</strong>, <strong>dimensione</strong> o <strong>colore</strong> in modo selettivo.</p><p>Per uscire da un blocco codice, citazione o elenco usa il tasto <strong>Normale</strong> nella barra in alto.</p>`;
      }
      computeStatsNow(false);
    }
  }, [initialFile, computeStatsNow]);

  // Restore saved range without stealing tablet keyboard focus unnecessarily
  const ensureEditorSelection = (): Selection | null => {
    const editor = editorRef.current;
    if (!editor) return null;

    if (document.activeElement !== editor) {
      editor.focus({ preventScroll: true });
    }
    const sel = window.getSelection();
    if (!sel) return null;

    const hasLiveRange =
      sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).commonAncestorContainer);

    if (!hasLiveRange && savedRangeRef.current) {
      try {
        if (editor.contains(savedRangeRef.current.commonAncestorContainer)) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      } catch {}
    }

    if (sel.rangeCount === 0 || !editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }

    return sel;
  };

  const getClosestBlock = (tags: string[]): HTMLElement | null => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return null;

    let node: Node | null = sel.anchorNode;
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (tags.includes(el.tagName.toLowerCase())) {
          return el;
        }
      }
      node = node.parentNode;
    }
    return null;
  };

  const moveCaretIntoElement = (el: HTMLElement, atEnd = false) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(!atEnd);
    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
    el.scrollIntoView({ block: 'nearest' });
    syncSelectionInspector();
  };

  const replaceBlockTagDirect = (
    blockEl: HTMLElement,
    targetTag: 'p' | 'h1' | 'h2' | 'h3'
  ) => {
    const newEl = document.createElement(targetTag);
    const cleaned = (blockEl.textContent || '').replace(/\u200B/g, '').trim();
    if (!cleaned) {
      newEl.innerHTML = '<br>';
      blockEl.parentNode?.replaceChild(newEl, blockEl);
      inspectorRef.current.block = targetTag;
      setActiveBlock(targetTag);
      moveCaretIntoElement(newEl, false);
    } else {
      while (blockEl.firstChild) {
        newEl.appendChild(blockEl.firstChild);
      }
      if (targetTag !== 'p') {
        newEl.querySelectorAll<HTMLElement>('[style*="font-size"]').forEach((child) => {
          child.style.fontSize = '';
        });
      }
      blockEl.parentNode?.replaceChild(newEl, blockEl);
      inspectorRef.current.block = targetTag;
      setActiveBlock(targetTag);
      moveCaretIntoElement(newEl, true);
    }
    scheduleStatsUpdate();
  };

  const applyHeadingBlock = (targetTag: 'h1' | 'h2' | 'h3') => {
    sound.playClick();
    setOpenMenu(null);
    const editor = editorRef.current;
    const sel = ensureEditorSelection();
    if (!editor || !sel) return;

    // Toggle off if already in that heading
    const currentHeading = getClosestBlock(['h1', 'h2', 'h3']);
    if (currentHeading && currentHeading.tagName.toLowerCase() === targetTag) {
      replaceBlockTagDirect(currentHeading, 'p');
      return;
    }

    // If inside a list item, unwrap out of list first
    const listBlock = getClosestBlock(['ul', 'ol']);
    if (listBlock) {
      const currentLi = getClosestBlock(['li']);
      const headingEl = document.createElement(targetTag);
      if (currentLi) {
        while (currentLi.firstChild) {
          headingEl.appendChild(currentLi.firstChild);
        }
        currentLi.remove();
        if (listBlock.children.length === 0) {
          listBlock.parentNode?.replaceChild(headingEl, listBlock);
        } else {
          listBlock.insertAdjacentElement('afterend', headingEl);
        }
        if (!(headingEl.textContent || '').replace(/\u200B/g, '').trim()) {
          headingEl.innerHTML = '<br>';
        }
        inspectorRef.current.block = targetTag;
        setActiveBlock(targetTag);
        moveCaretIntoElement(headingEl, true);
        scheduleStatsUpdate();
        return;
      }
    }

    const existingBlock = getClosestBlock(['h1', 'h2', 'h3', 'p', 'div', 'blockquote']);
    if (existingBlock && existingBlock !== editor) {
      replaceBlockTagDirect(existingBlock, targetTag);
      return;
    }

    // Bare text or empty editor fallback: create or wrap into target heading
    const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const headingEl = document.createElement(targetTag);

    if (!editor.firstChild || (editor.textContent || '').replace(/\u200B/g, '').trim() === '') {
      editor.innerHTML = '';
      headingEl.innerHTML = '<br>';
      editor.appendChild(headingEl);
      inspectorRef.current.block = targetTag;
      setActiveBlock(targetTag);
      moveCaretIntoElement(headingEl, false);
      scheduleStatsUpdate();
      return;
    }

    // Wrap direct inline node/selection inside editor
    if (range && range.startContainer.parentNode === editor) {
      const nodeAtCaret =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer
          : range.startContainer.childNodes[range.startOffset] || editor.firstChild;
      if (nodeAtCaret && nodeAtCaret.parentNode === editor) {
        editor.insertBefore(headingEl, nodeAtCaret);
        headingEl.appendChild(nodeAtCaret);
        inspectorRef.current.block = targetTag;
        setActiveBlock(targetTag);
        moveCaretIntoElement(headingEl, true);
        scheduleStatsUpdate();
        return;
      }
    }

    try {
      document.execCommand('formatBlock', false, `<${targetTag}>`);
    } catch {}
    syncSelectionInspector();
    scheduleStatsUpdate();
  };

  const exitBlockToParagraph = () => {
    sound.playClick();
    const editor = editorRef.current;
    const sel = ensureEditorSelection();
    if (!editor || !sel) return;

    const headingBlock = getClosestBlock(['h1', 'h2', 'h3']);
    if (headingBlock) {
      replaceBlockTagDirect(headingBlock, 'p');
      return;
    }

    const specialBlock = getClosestBlock(['pre', 'blockquote']);
    if (specialBlock) {
      const textContent = (specialBlock.innerText || '').replace(/\u200B/g, '').trim();
      const newP = document.createElement('p');
      newP.innerHTML = '<br>';

      if (!textContent) {
        specialBlock.parentNode?.replaceChild(newP, specialBlock);
      } else {
        const nextEl = specialBlock.nextElementSibling as HTMLElement | null;
        if (
          nextEl &&
          nextEl.tagName.toLowerCase() === 'p' &&
          nextEl.textContent?.trim() === ''
        ) {
          moveCaretIntoElement(nextEl, false);
          scheduleStatsUpdate();
          return;
        }
        specialBlock.insertAdjacentElement('afterend', newP);
      }

      moveCaretIntoElement(newP, false);
      scheduleStatsUpdate();
      return;
    }

    const listBlock = getClosestBlock(['ul', 'ol']);
    if (listBlock) {
      const currentLi = getClosestBlock(['li']);
      if (currentLi && (currentLi.textContent || '').replace(/\u200B/g, '').trim() === '') {
        const parentList = listBlock;
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        currentLi.remove();
        if (parentList.children.length === 0) {
          parentList.parentNode?.replaceChild(newP, parentList);
        } else {
          parentList.insertAdjacentElement('afterend', newP);
        }
        moveCaretIntoElement(newP, false);
        scheduleStatsUpdate();
        return;
      }

      try {
        document.execCommand(
          listBlock.tagName.toLowerCase() === 'ol' ? 'insertOrderedList' : 'insertUnorderedList'
        );
        document.execCommand('formatBlock', false, '<p>');
      } catch {}
      syncSelectionInspector();
      scheduleStatsUpdate();
      return;
    }

    try {
      document.execCommand('formatBlock', false, '<p>');
    } catch {}
    syncSelectionInspector();
    scheduleStatsUpdate();
  };

  const executeCmd = (command: string, value: string | undefined = undefined) => {
    sound.playClick();
    setOpenMenu(null);
    const editor = editorRef.current;
    if (!editor) return;

    if (command === 'formatBlock' && (value === '<h1>' || value === '<h2>' || value === '<h3>')) {
      applyHeadingBlock(value.replace(/[<>]/g, '') as 'h1' | 'h2' | 'h3');
      return;
    }

    ensureEditorSelection();

    if (command === 'formatBlock' && (value === '<pre>' || value === '<blockquote>')) {
      const targetTag = value.replace(/[<>]/g, '');
      const existing = getClosestBlock([targetTag]);
      if (existing) {
        exitBlockToParagraph();
        return;
      }
    }

    try {
      document.execCommand(command, false, value);
    } catch (e) {
      console.warn('execCommand failed', e);
    }

    if (command === 'formatBlock' && (value === '<pre>' || value === '<blockquote>')) {
      const targetTag = value === '<pre>' ? 'pre' : 'blockquote';
      const block = getClosestBlock([targetTag]);
      if (block && !block.nextElementSibling) {
        const trailingP = document.createElement('p');
        trailingP.innerHTML = '<br>';
        block.insertAdjacentElement('afterend', trailingP);
      }
    }

    syncSelectionInspector();
    scheduleStatsUpdate();
  };

  // Direct DOM inline styling for selective fontSize / fontFamily / color (reliable across Android/iPad WebKit)
  const applyInlineStyleToRange = (
    prop: 'fontSize' | 'fontFamily' | 'color',
    value: string
  ) => {
    const editor = editorRef.current;
    const sel = ensureEditorSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;

    styleLockUntilRef.current = Date.now() + 260;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const anchorEl =
        sel.anchorNode?.nodeType === Node.TEXT_NODE
          ? sel.anchorNode.parentElement
          : (sel.anchorNode as HTMLElement | null);

      if (
        anchorEl &&
        anchorEl !== editor &&
        anchorEl.dataset.typingSpan === 'true' &&
        (anchorEl.textContent || '').replace(/\u200B/g, '').length === 0
      ) {
        anchorEl.style[prop] = value;
        savedRangeRef.current = range.cloneRange();
        return;
      }

      const span = document.createElement('span');
      span.dataset.typingSpan = 'true';
      // Preserve active inspector styles when creating a fresh typing span
      span.style.fontFamily = inspectorRef.current.font;
      span.style.fontSize = `${inspectorRef.current.size}px`;
      span.style.color = inspectorRef.current.color;
      span.style[prop] = value;

      const zwsp = document.createTextNode('\u200B');
      span.appendChild(zwsp);
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(zwsp, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
      return;
    }

    // Collect intersecting Text nodes statically before splitting
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const selectedTextNodes: Text[] = [];
    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      const txt = currentNode as Text;
      if (txt.length > 0 && range.intersectsNode(txt)) {
        const skipEndZero = txt === range.endContainer && range.endOffset === 0;
        const skipStartEnd = txt === range.startContainer && range.startOffset >= txt.length;
        if (!skipEndZero && !skipStartEnd) {
          selectedTextNodes.push(txt);
        }
      }
      currentNode = walker.nextNode();
    }

    const styledTextNodes: Text[] = [];

    selectedTextNodes.forEach((txt) => {
      const isStart = txt === range.startContainer;
      const isEnd = txt === range.endContainer;
      let target = txt;
      let endOffset = isEnd ? range.endOffset : txt.length;

      if (isStart && range.startOffset > 0 && range.startOffset < txt.length) {
        target = txt.splitText(range.startOffset);
        if (isEnd) {
          endOffset = range.endOffset - range.startOffset;
        }
      }

      if ((isEnd || (isStart && isEnd)) && endOffset > 0 && endOffset < target.length) {
        target.splitText(endOffset);
      }

      if (target.length === 0) return;

      const parent = target.parentElement;
      if (
        parent &&
        parent !== editor &&
        parent.tagName === 'SPAN' &&
        parent.childNodes.length === 1
      ) {
        parent.style[prop] = value;
      } else {
        const span = document.createElement('span');
        span.style[prop] = value;
        target.parentNode?.insertBefore(span, target);
        span.appendChild(target);
      }
      styledTextNodes.push(target);
    });

    // Select directly inside the first and last styled Text nodes so anchorEl & toolbar stay synced
    if (styledTextNodes.length > 0) {
      const firstTxt = styledTextNodes[0];
      const lastTxt = styledTextNodes[styledTextNodes.length - 1];
      const newRange = document.createRange();
      newRange.setStart(firstTxt, 0);
      newRange.setEnd(lastTxt, lastTxt.length);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();
    }

    scheduleStatsUpdate();
  };

  const applySelectiveFontSize = (pxSize: number) => {
    sound.playClick();
    setOpenMenu(null);
    inspectorRef.current.size = pxSize;
    setSelectedFontSize(pxSize);
    applyInlineStyleToRange('fontSize', `${pxSize}px`);
  };

  const applySelectiveFontFamily = (fontValue: string) => {
    sound.playClick();
    setOpenMenu(null);
    inspectorRef.current.font = fontValue;
    setSelectedFontFamily(fontValue);
    applyInlineStyleToRange('fontFamily', fontValue);
  };

  const applySelectiveColor = (hex: string) => {
    sound.playClick();
    setOpenMenu(null);
    inspectorRef.current.color = hex;
    setSelectedColor(hex);
    applyInlineStyleToRange('color', hex);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    const headingBlock = getClosestBlock(['h1', 'h2', 'h3']);
    const preBlock = getClosestBlock(['pre']);
    const quoteBlock = getClosestBlock(['blockquote']);
    const listLi = getClosestBlock(['li']);

    // Pressing Enter inside an H1/H2/H3 drops cleanly into a normal <p> so the user never gets stuck in heading mode
    if (e.key === 'Enter' && headingBlock) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        e.preventDefault();
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
          range.deleteContents();
        }
        const tailRange = document.createRange();
        tailRange.selectNodeContents(headingBlock);
        tailRange.setStart(range.endContainer, range.endOffset);
        const tailFragment = tailRange.extractContents();

        const newP = document.createElement('p');
        newP.appendChild(tailFragment);
        if ((newP.textContent || '').replace(/\u200B/g, '').trim() === '') {
          newP.innerHTML = '<br>';
        }
        headingBlock.insertAdjacentElement('afterend', newP);
        moveCaretIntoElement(newP, false);
        scheduleStatsUpdate();
        return;
      }
    }

    if (e.key === 'Tab' && preBlock) {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      scheduleStatsUpdate();
      return;
    }

    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey) && (preBlock || quoteBlock)) {
      e.preventDefault();
      exitBlockToParagraph();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && preBlock) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const beforeRange = document.createRange();
        beforeRange.selectNodeContents(preBlock);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = beforeRange.toString();

        const afterRange = document.createRange();
        afterRange.selectNodeContents(preBlock);
        afterRange.setStart(range.endContainer, range.endOffset);
        const textAfter = afterRange.toString();

        const preEndEl =
          range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as Element).childNodes[range.startOffset - 1]
            : null;
        const endsWithBr = preEndEl?.nodeName === 'BR' || preBlock.lastChild?.nodeName === 'BR';

        if (
          textAfter.trim() === '' &&
          (textBefore.endsWith('\n') || endsWithBr || textBefore.trim() === '')
        ) {
          e.preventDefault();
          if (textBefore.endsWith('\n') && preBlock.lastChild?.nodeType === Node.TEXT_NODE) {
            const txt = preBlock.lastChild as Text;
            txt.textContent = (txt.textContent || '').replace(/\n+$/, '');
          } else if (preBlock.lastChild?.nodeName === 'BR') {
            preBlock.lastChild.remove();
          }
          exitBlockToParagraph();
          return;
        }
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && quoteBlock) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
        const blockEl = getClosestBlock(['p', 'div', 'blockquote']);
        const lineText = (blockEl?.textContent || '').replace(/\u200B/g, '').trim();
        if (lineText === '') {
          e.preventDefault();
          if (blockEl && blockEl !== quoteBlock) {
            blockEl.remove();
          }
          exitBlockToParagraph();
          return;
        }
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && listLi) {
      const liText = (listLi.textContent || '').replace(/\u200B/g, '').trim();
      if (liText === '') {
        e.preventDefault();
        exitBlockToParagraph();
        return;
      }
    }
  };

  const handleSave = () => {
    sound.playNotification();
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML.replace(/\u200B/g, '');
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
      editorRef.current.innerHTML = `<h2>Nuovo Documento</h2><p><br></p>`;
      setDocTitle('Nuovo_Documento.doc');
      setCurrentFileId(null);
      initializedRef.current = '__new__';
      editorRef.current.focus();
      computeStatsNow(false);
    }
  };

  const handleOpenFromDrive = (file: VirtualFile) => {
    sound.playClick();
    if (editorRef.current) {
      editorRef.current.innerHTML = file.content;
      setDocTitle(file.name);
      setCurrentFileId(file.id);
      initializedRef.current = file.id;
      setShowFileModal(false);
      editorRef.current.focus();
      computeStatsNow(false);
      setSavedStatus(true);
    }
  };

  const handleDownloadFile = (format: 'html' | 'txt' | 'md') => {
    sound.playClick();
    setOpenMenu(null);
    if (!editorRef.current) return;
    let content = '';
    let mime = 'text/plain';

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.75;color:#0f172a;background:#faf9f6;}h1,h2,h3{color:#1e293b;}blockquote{border-left:4px solid #3b82f6;padding-left:1em;color:#475569;}pre{background:#0f172a;color:#38bdf8;padding:1rem;border-radius:0.5rem;overflow-x:auto;}</style></head><body>${editorRef.current.innerHTML.replace(/\u200B/g, '')}</body></html>`;
      mime = 'text/html';
    } else {
      content = (editorRef.current.innerText || '').replace(/\u200B/g, '');
      mime = format === 'md' ? 'text/markdown' : 'text/plain';
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
    setOpenMenu(null);
    if (!editorRef.current) {
      window.print();
      return;
    }

    const existingSheet = document.getElementById('wt-print-sheet');
    if (existingSheet) existingSheet.remove();

    const printSheet = document.createElement('div');
    printSheet.id = 'wt-print-sheet';
    printSheet.className = 'rich-editor-content';
    printSheet.innerHTML = editorRef.current.innerHTML.replace(/\u200B/g, '');
    document.body.appendChild(printSheet);
    document.body.classList.add('wt-printing');

    const cleanupPrint = () => {
      document.body.classList.remove('wt-printing');
      printSheet.remove();
      window.removeEventListener('afterprint', cleanupPrint);
    };

    window.addEventListener('afterprint', cleanupPrint);

    window.setTimeout(() => {
      window.print();
      // Fallback cleanup for browsers where afterprint is delayed or skipped
      window.setTimeout(() => {
        if (document.body.classList.contains('wt-printing')) {
          cleanupPrint();
        }
      }, 1500);
    }, 80);
  };

  const paperClass =
    paperTone === 'natural'
      ? 'bg-[#FAF8F3] text-[#0F172A] border-[#E8E2D5]'
      : paperTone === 'ivory'
      ? 'bg-[#FBF6ED] text-[#1C1917] border-[#EADFCB]'
      : 'bg-[#FFFFFF] text-[#0F172A] border-slate-300';

  const docFiles = files.filter((f) => f.type === 'doc');
  const currentFontLabel =
    FONT_OPTIONS.find((f) => f.value === selectedFontFamily)?.label || 'Plus Jakarta';

  // Capture editor range before touch/click while avoiding focus loss on mouse and scroll-blocking on touch
  const captureSelectionOnPointer = (e: React.PointerEvent) => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (editor && sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (editor.contains(r.commonAncestorContainer)) {
        savedRangeRef.current = r.cloneRange();
      }
    }
    if (e.pointerType === 'mouse') {
      e.preventDefault();
    }
  };

  const keepFocus = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-slate-200/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text overflow-hidden font-sans"
      onClick={() => {
        if (openMenu) setOpenMenu(null);
      }}
    >
      {/* Top Action Ribbon */}
      <div className="shrink-0 flex flex-wrap items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 shadow-sm gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-md shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setSavedStatus(false);
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-36 sm:w-56 truncate shadow-inner"
            title="Nome del documento"
          />

          <span className="text-xs font-bold hidden sm:inline shrink-0">
            {savedStatus ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Salvato
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">● Modificato</span>
            )}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
            title="Nuovo Documento"
          >
            <FilePlus className="w-4 h-4 text-blue-600" />
            <span className="hidden md:inline">Nuovo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
            title="Apri dal disco virtuale"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Apri</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent-hex,#2563eb)] hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
            title="Salva file"
          >
            <Save className="w-4 h-4" />
            <span>Salva</span>
          </button>

          {/* Touch-friendly Export Popover */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'export' ? null : 'export')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              title="Esporta file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
            {openMenu === 'export' && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl py-1.5 z-40 min-w-44 text-slate-800 dark:text-slate-200 font-bold">
                <button
                  type="button"
                  onClick={() => handleDownloadFile('txt')}
                  className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  File Testo (.txt)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('html')}
                  className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Pagina Web (.html)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('md')}
                  className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Markdown (.md)
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-400" /> Stampa / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formatting Toolbar - Every control uses preventDefault on pointerdown/mousedown so tablet keyboard NEVER loses focus */}
      <div
        className="shrink-0 flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 gap-1.5 relative z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo / Redo */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('undo')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Annulla"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('redo')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Ripristina"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Touch-Safe Selective Font Family Picker */}
          <div className="relative">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => setOpenMenu(openMenu === 'font' ? null : 'font')}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500"
              title="Font selettivo (testo selezionato)"
            >
              <span className="max-w-28 truncate" style={{ fontFamily: selectedFontFamily }}>
                {currentFontLabel}
              </span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {openMenu === 'font' && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 w-52">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    tabIndex={-1}
                    onPointerDown={captureSelectionOnPointer}
                    onMouseDown={keepFocus}
                    onClick={() => applySelectiveFontFamily(f.value)}
                    style={{ fontFamily: f.value }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                      selectedFontFamily === f.value ? 'font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-slate-800/70' : ''
                    }`}
                  >
                    <span>{f.label}</span>
                    {selectedFontFamily === f.value && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Touch-Safe Selective Font Size Controls */}
          <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-1 py-0.5 gap-0.5">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => applySelectiveFontSize(Math.max(10, selectedFontSize - 2))}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Riduci testo selezionato"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => setOpenMenu(openMenu === 'size' ? null : 'size')}
              className="px-2 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-0.5"
              title="Dimensione testo selezionato"
            >
              <span>{selectedFontSize}px</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => applySelectiveFontSize(Math.min(72, selectedFontSize + 2))}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Ingrandisci testo selezionato"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {openMenu === 'size' && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 w-52 grid grid-cols-3 gap-1.5">
                {FONT_SIZE_OPTIONS.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    tabIndex={-1}
                    onPointerDown={captureSelectionOnPointer}
                    onMouseDown={keepFocus}
                    onClick={() => applySelectiveFontSize(sz)}
                    className={`px-2 py-2 rounded-lg text-xs font-extrabold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors border ${
                      selectedFontSize === sz
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Touch-Safe Selective Color Swatch Picker */}
          <div className="relative">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
              className="flex items-center gap-1 px-1.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500"
              title="Colore testo selezionato"
            >
              <Palette className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: selectedColor }}
              />
            </button>
            {openMenu === 'color' && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-2 z-50 grid grid-cols-4 gap-1.5 w-36">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    tabIndex={-1}
                    onPointerDown={captureSelectionOnPointer}
                    onMouseDown={keepFocus}
                    onClick={() => applySelectiveColor(hex)}
                    className={`w-7 h-7 rounded-lg border border-black/20 transition-transform hover:scale-110 ${
                      selectedColor === hex ? 'ring-2 ring-blue-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Bold, Italic, Underline, Strike, Highlighter */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('bold')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors font-bold"
            title="Grassetto"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('italic')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Corsivo"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('underline')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Sottolineato"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('strikeThrough')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-colors"
            title="Barrato"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('hiliteColor', '#fef08a')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500 rounded-lg transition-colors"
            title="Evidenzia Testo"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Normal Paragraph / Exit Block Button (fixed in toolbar, zero layout shift) */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={exitBlockToParagraph}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors border ${
              activeBlock === 'p'
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                : 'bg-blue-600 border-blue-600 text-white shadow-sm'
            }`}
            title="Torna a Testo Normale / Esci da Codice, Elenco o Citazione"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{activeBlock === 'p' ? 'Normale' : `Esci da ${BLOCK_LABELS[activeBlock]}`}</span>
          </button>

          {/* Headings */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => applyHeadingBlock('h1')}
            className={`p-1.5 rounded-lg transition-colors font-bold text-xs ${
              activeBlock === 'h1'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600'
            }`}
            title="Titolo H1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => applyHeadingBlock('h2')}
            className={`p-1.5 rounded-lg transition-colors font-bold text-xs ${
              activeBlock === 'h2'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600'
            }`}
            title="Titolo H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => applyHeadingBlock('h3')}
            className={`p-1.5 rounded-lg transition-colors font-bold text-xs ${
              activeBlock === 'h3'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600'
            }`}
            title="Titolo H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Lists, Quote, Code Block */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('insertUnorderedList')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeBlock === 'ul'
                ? 'bg-amber-500 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-amber-600'
            }`}
            title="Elenco puntato"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('insertOrderedList')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeBlock === 'ol'
                ? 'bg-amber-500 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-amber-600'
            }`}
            title="Elenco numerato"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('formatBlock', '<blockquote>')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeBlock === 'blockquote'
                ? 'bg-purple-600 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-purple-600'
            }`}
            title="Citazione"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('formatBlock', '<pre>')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeBlock === 'pre'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600'
            }`}
            title="Blocco Codice"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('justifyLeft')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Allinea a sinistra"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('justifyCenter')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Centra"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => executeCmd('justifyRight')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Allinea a destra"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Paper tone selector & Page Width */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => setPaperTone('natural')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                paperTone === 'natural' ? 'bg-amber-100 text-amber-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Naturale
            </button>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={captureSelectionOnPointer}
              onMouseDown={keepFocus}
              onClick={() => setPaperTone('pure')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                paperTone === 'pure' ? 'bg-slate-200 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Bianco
            </button>
          </div>

          <button
            type="button"
            tabIndex={-1}
            onPointerDown={captureSelectionOnPointer}
            onMouseDown={keepFocus}
            onClick={() => setIsWidePage(!isWidePage)}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
            title={isWidePage ? 'Larghezza foglio standard' : 'Larghezza foglio estesa'}
          >
            {isWidePage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Document Workspace - Direct touch target without focus-stealing wrapper onClick */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/90 dark:bg-slate-950 cursor-text"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            editorRef.current?.focus();
          }
        }}
      >
        <div
          className={`w-full ${
            isWidePage ? 'max-w-4xl' : 'max-w-2xl'
          } min-h-[560px] h-fit shadow-[0_12px_45px_rgba(0,0,0,0.18)] rounded-2xl p-6 sm:p-10 border transition-colors duration-200 ${paperClass}`}
        >
          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
              scheduleStatsUpdate();
              syncSelectionInspector();
            }}
            onInput={() => {
              if (!isComposingRef.current) {
                scheduleStatsUpdate();
              }
            }}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            tabIndex={0}
            role="textbox"
            aria-multiline="true"
            style={{
              fontSize: '18px',
              lineHeight: '1.75',
              fontFamily: FONT_OPTIONS[0].value,
              touchAction: 'manipulation',
            }}
            className="rich-editor-content focus:outline-none min-h-[460px] antialiased text-slate-900 select-text"
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="shrink-0 px-4 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>{stats.words} parole</span>
          <span>{stats.chars} caratteri</span>
          <span className="hidden sm:inline">~{stats.readTime} min lettura</span>
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="hidden sm:inline">Blocco: {BLOCK_LABELS[activeBlock]}</span>
          <span>• Selezione: {selectedFontSize}px</span>
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
                type="button"
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
                    type="button"
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
