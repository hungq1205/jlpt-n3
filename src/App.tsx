import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { Volume2, Search, RotateCw, RefreshCw, ChevronLeft, ChevronRight, Menu, Settings, ArrowLeft, BookOpen, Layers, List, Sliders } from 'lucide-react';
import { LESSONS, Lesson, Flashcard, FlashcardType } from './data/flashcards';
import { speakJapanese, speakVietnamese } from './utils/speech';
import { getHanViet, getKanjiMeaning } from './data/hanVietDict';
import { getSnapCoords, findNearestSnapPosition, findSnapPositionWithinRange, getSwipeCorner, SnapPosition, Point, SNAP_RANGE } from './utils/snapLayout';

export type FrontFaceOption = 'kanji' | 'kana' | 'hanviet' | 'meaning' | 'audio-jp' | 'audio-vn';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'flashcard' | 'list' | 'lessons' | 'settings'>('flashcard');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson-1');

  // Retrieve current active lesson and its cards
  const currentLesson: Lesson = useMemo(() => {
    return LESSONS.find((l) => l.id === selectedLessonId) || LESSONS[0];
  }, [selectedLessonId]);

  const cards: Flashcard[] = currentLesson.cards;

  // Study Settings (stored in local storage)
  const [frontFaceOption, setFrontFaceOption] = useState<FrontFaceOption>(() => {
    return (localStorage.getItem('kanji_front_face') as FrontFaceOption) || 'kanji';
  });
  const [audioVolume, setAudioVolume] = useState<number>(() => {
    const saved = localStorage.getItem('kanji_audio_volume');
    return saved !== null ? parseFloat(saved) : 1.0;
  });
  const [autoReadEnabled, setAutoReadEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kanji_auto_read');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoReadLang, setAutoReadLang] = useState<'jp' | 'vn'>(() => {
    return (localStorage.getItem('kanji_auto_read_lang') as 'jp' | 'vn') || 'jp';
  });

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('kanji_front_face', frontFaceOption);
  }, [frontFaceOption]);

  useEffect(() => {
    localStorage.setItem('kanji_audio_volume', audioVolume.toString());
  }, [audioVolume]);

  useEffect(() => {
    localStorage.setItem('kanji_auto_read', autoReadEnabled.toString());
  }, [autoReadEnabled]);

  useEffect(() => {
    localStorage.setItem('kanji_auto_read_lang', autoReadLang);
  }, [autoReadLang]);

  // Card deck order & position
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [mode, setMode] = useState<'jp-vi' | 'vi-jp'>('jp-vi');
  const [showKana, setShowKana] = useState<boolean>(false);
  const [isFabPressed, setIsFabPressed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // When lesson changes, reset order and position
  useEffect(() => {
    setOrder(cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
  }, [selectedLessonId, cards]);

  // Draggable FAB snap positions
  const [snapKana, setSnapKana] = useState<SnapPosition>('BR');
  const [snapHanViet, setSnapHanViet] = useState<SnapPosition>('BR');
  const [snapRead, setSnapRead] = useState<SnapPosition>('BR');
  const [dragBtn, setDragBtn] = useState<'kana' | 'hanviet' | 'read' | null>(null);
  const [dragPos, setDragPos] = useState<Point | null>(null);
  const [dragOrigin, setDragOrigin] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProjecting, setIsProjecting] = useState<boolean>(false);
  const [projPoint, setProjPoint] = useState<Point | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number; moved: boolean; swipeStartTime: number }>({ x: 0, y: 0, time: 0, moved: false, swipeStartTime: 0 });
  const pointerHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);

  // Window viewport size tracking
  const [winSize, setWinSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 400,
    h: typeof window !== 'undefined' ? window.innerHeight : 700,
  });

  // Han-Viet bubble inspection & tap-mode state
  const [isHanVietMode, setIsHanVietMode] = useState<boolean>(false);
  const [activeBubble, setActiveBubble] = useState<{
    kanji: string;
    kana?: string;
    hanViet: string;
    meaning?: string;
    rect: DOMRect;
    element: HTMLElement;
    isFlipped: boolean;
  } | null>(null);

  const suppressClickUntilRef = useRef<number>(0);

  // Global event guard: suppress click/pointer events if they originated from dismissing Han-Viet mode
  useEffect(() => {
    const blockSuppressed = (e: Event) => {
      if (Date.now() < suppressClickUntilRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('click', blockSuppressed, true);
    window.addEventListener('pointerup', blockSuppressed, true);
    window.addEventListener('touchend', blockSuppressed, true);

    return () => {
      window.removeEventListener('click', blockSuppressed, true);
      window.removeEventListener('pointerup', blockSuppressed, true);
      window.removeEventListener('touchend', blockSuppressed, true);
    };
  }, []);

  // List view search & filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listFilter, setListFilter] = useState<'all' | 'kanji' | 'vocab'>('all');

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });
  const cardWrapRef = useRef<HTMLDivElement>(null);

  // Current active card
  const currentCard: Flashcard = cards[order[pos]] || cards[0];

  // Actions
  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setPos((prev) => (prev + 1) % order.length);
  }, [order.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setPos((prev) => (prev - 1 + order.length) % order.length);
  }, [order.length]);

  const handleShuffle = useCallback(() => {
    setFlipped(false);
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
    setPos(0);
  }, []);

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'jp-vi' ? 'vi-jp' : 'jp-vi'));
    setFlipped(false);
  }, []);

  // Auto-read on card change
  const isFirstMountRef = useRef<boolean>(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (!autoReadEnabled || activeView !== 'flashcard' || !currentCard) return;

    const timer = setTimeout(() => {
      if (autoReadLang === 'jp') {
        speakJapanese(currentCard.kanji, 0.9, audioVolume);
      } else {
        speakVietnamese(currentCard.viet, 0.95, audioVolume);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [pos, selectedLessonId, autoReadEnabled, autoReadLang, activeView, audioVolume, currentCard]);

  // Audio trigger helper with volume
  const playAudio = useCallback((e: React.MouseEvent | React.TouchEvent, text: string, isVn = false) => {
    e.stopPropagation();
    if (isVn) {
      speakVietnamese(text, 0.95, audioVolume);
    } else {
      speakJapanese(text, 0.9, audioVolume);
    }
  }, [audioVolume]);

  // Floating read button action:
  // - If front face: reads based on front face / selected language
  // - If back face: reads sentence (always Japanese)
  const handleReadClick = useCallback(() => {
    if (activeView !== 'flashcard' || !currentCard) return;

    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 900);

    if (!flipped) {
      if (frontFaceOption === 'meaning' || frontFaceOption === 'audio-vn') {
        speakVietnamese(currentCard.viet, 0.95, audioVolume);
      } else if (frontFaceOption === 'kana') {
        speakJapanese(currentCard.kana.split('/')[0].trim() || currentCard.kanji, 0.9, audioVolume);
      } else {
        // default kanji or audio-jp
        speakJapanese(currentCard.kanji, 0.9, audioVolume);
      }
    } else {
      speakJapanese(currentCard.example, 0.9, audioVolume);
    }
  }, [activeView, currentCard, flipped, frontFaceOption, audioVolume]);

  // Furigana hold reveal
  const startReveal = useCallback(() => {
    setShowKana(true);
    setIsFabPressed(true);
  }, []);

  const stopReveal = useCallback(() => {
    setShowKana(false);
    setIsFabPressed(false);
  }, []);

  // Global pointer release guard for Kana reveal
  useEffect(() => {
    const handleGlobalRelease = () => {
      stopReveal();
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
    };
  }, [stopReveal]);

  // Keyboard navigation on PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (activeView === 'flashcard') handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeView === 'flashcard') handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeView === 'flashcard') handlePrev();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMode();
      } else if (e.key.toLowerCase() === 'k' && !e.repeat) {
        startReveal();
      } else if (e.key.toLowerCase() === 'a') {
        if (activeView === 'flashcard' && currentCard) speakJapanese(currentCard.kanji, 0.9, audioVolume);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k') {
        stopReveal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeView, handleFlip, handleNext, handlePrev, handleToggleMode, currentCard, startReveal, stopReveal, audioVolume]);

  // Window resize tracking
  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to find nearest kanji word on screen
  const findNearestKanji = useCallback((x: number, y: number, maxDist = 70) => {
    // 1. Direct hit check via elementFromPoint
    const hitEl = document.elementFromPoint(x, y);
    if (hitEl) {
      const directTarget = hitEl.closest<HTMLElement>('[data-kanji-target="true"]');
      if (directTarget) {
        const face = directTarget.closest('.face');
        const isVisible = !face || (face.classList.contains('back') ? flipped : !flipped);
        if (isVisible) {
          const rect = directTarget.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const kanji = directTarget.getAttribute('data-kanji') || directTarget.innerText || '';
            const kana = directTarget.getAttribute('data-kana') || '';
            const hanViet = directTarget.getAttribute('data-hanviet') || getHanViet(kanji);
            const meaning = directTarget.getAttribute('data-meaning') || getKanjiMeaning(kanji);
            return {
              element: directTarget,
              kanji,
              kana,
              hanViet,
              meaning,
              rect,
              isFlipped: rect.top < 95,
            };
          }
        }
      }
    }

    // 2. Proximity search among all kanji targets
    const elements = document.querySelectorAll<HTMLElement>('[data-kanji-target="true"]');
    let closestEl: HTMLElement | null = null;
    let closestDist = Infinity;
    let closestRect: DOMRect | null = null;

    elements.forEach((el) => {
      const face = el.closest('.face');
      if (face) {
        if (face.classList.contains('back') && !flipped) return;
        if (face.classList.contains('front') && flipped) return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const d = Math.hypot(dx, dy);
      if (d < closestDist && (maxDist === Infinity || d <= maxDist)) {
        closestDist = d;
        closestEl = el;
        closestRect = rect;
      }
    });

    if (closestEl && closestRect) {
      const el = closestEl as HTMLElement;
      const targetRect = closestRect as DOMRect;
      const kanji = el.getAttribute('data-kanji') || el.innerText || '';
      const kana = el.getAttribute('data-kana') || '';
      const hanViet = el.getAttribute('data-hanviet') || getHanViet(kanji);
      const meaning = el.getAttribute('data-meaning') || getKanjiMeaning(kanji);
      return {
        element: el,
        kanji,
        kana,
        hanViet,
        meaning,
        rect: targetRect,
        isFlipped: targetRect.top < 95,
      };
    }
    return null;
  }, [flipped]);

  // Highlight active target kanji
  useEffect(() => {
    if (activeBubble?.element) {
      const el = activeBubble.element;
      el.classList.add('kanji-target-highlighted');
      return () => {
        el.classList.remove('kanji-target-highlighted');
      };
    }
  }, [activeBubble]);

  // Intercept taps when tap-selecting kanji word for Han-Viet
  useEffect(() => {
    if (!isHanVietMode) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('.fab') || target.closest('.topbar') || target.closest('.controls-dock') || target.closest('.controls'))) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX;
        clientY = (e as TouchEvent).touches[0].clientY;
      } else if ('changedTouches' in e && (e as TouchEvent).changedTouches.length > 0) {
        clientX = (e as TouchEvent).changedTouches[0].clientX;
        clientY = (e as TouchEvent).changedTouches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const found = findNearestKanji(clientX, clientY, 70);
      if (found) {
        setActiveBubble(found);
      } else {
        suppressClickUntilRef.current = Date.now() + 350;
        setIsHanVietMode(false);
        setActiveBubble(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isHanVietMode, findNearestKanji]);

  // Compute resting coordinates for draggable FABs
  const snapCoords = useMemo(() => {
    return getSnapCoords(
      snapKana,
      snapHanViet,
      activeView === 'flashcard' ? snapRead : undefined,
      winSize.w,
      winSize.h
    );
  }, [snapKana, snapHanViet, snapRead, activeView, winSize.w, winSize.h]);

  // Compute predicted release snap destination while dragging
  const targetSnapCoords = useMemo(() => {
    if (!isDragging || !dragBtn || !dragPos) return null;
    const currentCenterX = dragPos.x + 25;
    const currentCenterY = dragPos.y + 25;
    const matchedSnap = findSnapPositionWithinRange(
      currentCenterX,
      currentCenterY,
      winSize.w,
      winSize.h,
      dragBtn,
      {
        kana: snapKana,
        hanViet: snapHanViet,
        read: activeView === 'flashcard' ? snapRead : undefined,
      }
    );
    if (!matchedSnap) return null;
    const coords = getSnapCoords(
      dragBtn === 'kana' ? matchedSnap : snapKana,
      dragBtn === 'hanviet' ? matchedSnap : snapHanViet,
      activeView === 'flashcard' ? (dragBtn === 'read' ? matchedSnap : snapRead) : undefined,
      winSize.w,
      winSize.h
    );
    const targetPt = dragBtn === 'kana' ? coords.kana : dragBtn === 'hanviet' ? coords.hanViet : coords.read;
    if (!targetPt) return null;
    return { x: targetPt.x + 25, y: targetPt.y + 25 };
  }, [isDragging, dragBtn, dragPos, snapKana, snapHanViet, snapRead, activeView, winSize.w, winSize.h]);

  // Sync kana class with body
  useEffect(() => {
    if (showKana) {
      document.body.classList.add('show-kana');
    } else {
      document.body.classList.remove('show-kana');
    }
  }, [showKana]);

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      moved: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      touchStartRef.current.moved = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 48 && absDx > absDy) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Helper to render plain segment so any individual Kanji is interactive for Han-Viet
  const renderPlainSegment = (text: string, keyPrefix: string, elements: React.ReactNode[]) => {
    // Kanji Unicode range: \u4e00-\u9faf
    const kanjiRegex = /([\u4e00-\u9faf]+)/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = kanjiRegex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        elements.push(
          <span key={`${keyPrefix}-txt-${lastIdx}`}>
            {text.substring(lastIdx, m.index)}
          </span>
        );
      }
      const kanji = m[1];
      elements.push(
        <span
          key={`${keyPrefix}-kj-${m.index}`}
          className="jp-word-container"
          data-kanji-target="true"
          data-kanji={kanji}
          data-hanviet={getHanViet(kanji)}
          data-meaning={getKanjiMeaning(kanji)}
          style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
        >
          <span className="kanji-text">{kanji}</span>
        </span>
      );
      lastIdx = kanjiRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      elements.push(
        <span key={`${keyPrefix}-txt-end`}>
          {text.substring(lastIdx)}
        </span>
      );
    }
  };

  // Helper to render ruby text for Japanese sentences using native ruby elements on exact same text baseline
  const renderRubySentence = (rubyStr?: string, plainStr?: string) => {
    const textToRender = rubyStr || plainStr || '';
    if (!textToRender) return null;

    // Pattern to match Kanji followed by [reading]
    const rubyRegex = /([\u4e00-\u9faf\u3400-\u4dbf々〆ヵヶ]+)\[(.*?)\]/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rubyRegex.exec(textToRender)) !== null) {
      if (match.index > lastIndex) {
        const plainPart = textToRender.substring(lastIndex, match.index);
        renderPlainSegment(plainPart, `plain-${lastIndex}`, elements);
      }

      const kanjiText = match[1];
      const rubyText = match[2];
      const matchIndex = match.index;

      elements.push(
        <ruby
          key={`ruby-${matchIndex}`}
          className="jp-word-container"
          data-kanji-target="true"
          data-kanji={kanjiText}
          data-hanviet={getHanViet(kanjiText)}
          data-meaning={getKanjiMeaning(kanjiText)}
          style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
        >
          <span className="kanji-text">{kanjiText}</span>
          <rt className="ruby-text">{rubyText}</rt>
        </ruby>
      );

      lastIndex = rubyRegex.lastIndex;
    }

    if (lastIndex < textToRender.length) {
      const remaining = textToRender.substring(lastIndex);
      renderPlainSegment(remaining, `plain-end`, elements);
    }

    return elements;
  };

  // Helper to render Japanese word with kana overlay
  const renderJapaneseWord = (card: Flashcard, large = true) => {
    const hasKana = card.kanji !== card.kana;
    const kanaText = card.type === 'kanji' ? card.onyomi || card.kana : card.kana;

    return (
      <ruby
        className="jp-word-container"
        data-kanji-target="true"
        data-kanji={card.kanji}
        data-kana={kanaText}
        data-hanviet={card.hanViet}
        data-meaning={card.viet}
        style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
      >
        <span className="kanji-text" style={{ fontSize: large ? 'clamp(38px, 11vw, 68px)' : 'inherit' }}>
          {card.kanji}
        </span>
        {hasKana && (
          <rt
            className="ruby-text kana-overlay"
            style={{ fontSize: large ? '0.42em' : '0.52em' }}
          >
            {kanaText}
          </rt>
        )}
      </ruby>
    );
  };

  // Render Front Face content based on user settings
  const renderFrontFaceContent = () => {
    switch (frontFaceOption) {
      case 'kana':
        if (currentCard.type === 'kanji') {
          return (
            <div className="front-kana-kanji">
              {currentCard.onyomi && (
                <div className="reading-line">
                  <span className="reading-badge on">On</span>
                  <span>{currentCard.onyomi}</span>
                </div>
              )}
              {currentCard.kunyomi && (
                <div className="reading-line">
                  <span className="reading-badge kun">Kun</span>
                  <span>{currentCard.kunyomi}</span>
                </div>
              )}
            </div>
          );
        }
        return <span style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '700' }}>{currentCard.kana}</span>;

      case 'hanviet':
        return (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 'clamp(32px, 8.5vw, 54px)', fontWeight: '800', color: '#7c3aed', letterSpacing: '1px' }}>
              {currentCard.hanViet}
            </span>
          </div>
        );

      case 'meaning':
        return (
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <span style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: '700', color: '#1f2937', lineHeight: 1.35 }}>
              {currentCard.viet}
            </span>
          </div>
        );

      case 'audio-jp':
        return (
          <div className="audio-prompt-container">
            <Volume2 className="w-14 h-14 text-blue-500 animate-pulse" />
            <div className="audio-prompt-text">Listen to Japanese</div>
            <button
              type="button"
              className="audio-replay-btn"
              onClick={(e) => {
                e.stopPropagation();
                speakJapanese(currentCard.kanji, 0.9, audioVolume);
              }}
            >
              Replay
            </button>
          </div>
        );

      case 'audio-vn':
        return (
          <div className="audio-prompt-container">
            <Volume2 className="w-14 h-14 text-emerald-500 animate-pulse" />
            <div className="audio-prompt-text">Listen to Vietnamese</div>
            <button
              type="button"
              className="audio-replay-btn"
              onClick={(e) => {
                e.stopPropagation();
                speakVietnamese(currentCard.viet, 0.95, audioVolume);
              }}
            >
              Replay
            </button>
          </div>
        );

      case 'kanji':
      default:
        return mode === 'jp-vi' ? renderJapaneseWord(currentCard, true) : <span>{currentCard.viet}</span>;
    }
  };

  // Filtered list for current lesson
  const filteredList = useMemo(() => {
    return cards.filter((w) => {
      if (listFilter === 'kanji' && w.type !== 'kanji') return false;
      if (listFilter === 'vocab' && w.type === 'kanji') return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        w.kanji.toLowerCase().includes(q) ||
        w.kana.toLowerCase().includes(q) ||
        w.viet.toLowerCase().includes(q) ||
        w.hanViet.toLowerCase().includes(q)
      );
    });
  }, [cards, searchQuery, listFilter]);

  return (
    <div className={`app ${showKana ? 'show-kana' : ''}`}>
      {/* Top Header Bar */}
      <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Quick Active Lesson Chip: Book icon + number (click toggles lesson view) */}
          <button
            type="button"
            className={`lesson-chip-btn ${activeView === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveView((prev) => (prev === 'lessons' ? 'flashcard' : 'lessons'))}
            title={`Lesson ${selectedLessonId.replace('lesson-', '')}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>{selectedLessonId.replace('lesson-', '')}</span>
          </button>
        </div>

        {/* Center: Icon-only Tabs (Cards / List) */}
        <div className="chip-group" style={{ margin: '0 auto' }}>
          <button
            className={`chip ${activeView === 'flashcard' ? 'active' : ''}`}
            onClick={() => setActiveView('flashcard')}
            title="Cards"
            style={{ padding: '0 12px', height: '34px' }}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            className={`chip ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
            title="List"
            style={{ padding: '0 12px', height: '34px' }}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Counter & Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="counter" id="counter">
            {activeView === 'list' ? `${filteredList.length}` : `${pos + 1} / ${order.length}`}
          </div>

          {/* Settings button (click toggles settings view) */}
          <button
            type="button"
            className={`topbar-icon-btn ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView((prev) => (prev === 'settings' ? 'flashcard' : 'settings'))}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* VIEW 1: Main Flashcard Study */}
      {activeView === 'flashcard' && (
        <div className="card-wrap-container">
          <main
            className="card-wrap"
            id="cardWrap"
            ref={cardWrapRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`card ${flipped ? 'flipped' : ''}`}
              id="card"
              onClick={handleFlip}
            >
              {/* Front Face */}
              <section className="face front" id="front">
                <div className="label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: currentCard.type === 'kanji' ? '#b45309' : '#2563eb' }}>
                      {currentCard.type === 'kanji' ? 'Kanji' : 'Vocab'}
                    </span>
                    {currentCard.partOfSpeech && (
                      <span className="pos-subtle">({currentCard.partOfSpeech.toLowerCase()})</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="audio-btn"
                    onClick={(e) => playAudio(e, currentCard.kanji)}
                    title="Play audio"
                  >
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  </button>
                </div>

                <div className="big jp">
                  {renderFrontFaceContent()}
                </div>

                <div className="hint">
                  Tap to flip
                </div>
              </section>

              {/* Back Face (Reveals all other information) */}
              <section className="face back" id="back">
                <div className="label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{currentCard.type === 'kanji' ? 'Kanji' : 'Answer'}</span>
                    {currentCard.partOfSpeech && (
                      <span className="pos-subtle">({currentCard.partOfSpeech.toLowerCase()})</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="audio-btn"
                      onClick={(e) => playAudio(e, currentCard.kanji)}
                      title="Play audio"
                    >
                      <Volume2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <span className="hv" style={{ margin: 0, padding: '3px 8px', fontSize: '11px' }}>
                      {currentCard.hanViet}
                    </span>
                  </div>
                </div>

                {/* Specific Layout for KANJI Card */}
                {currentCard.type === 'kanji' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                      <ruby
                        className="jp-word-container"
                        data-kanji-target="true"
                        data-kanji={currentCard.kanji}
                        data-kana={currentCard.onyomi || currentCard.kana}
                        data-hanviet={currentCard.hanViet}
                        data-meaning={currentCard.viet}
                        style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}
                      >
                        <span className="kanji-text">{currentCard.kanji}</span>
                        <rt className="ruby-text" style={{ fontSize: '0.36em' }}>
                          {currentCard.onyomi || currentCard.kana}
                        </rt>
                      </ruby>
                    </div>

                    {/* Onyomi & Kunyomi box */}
                    <div className="kanji-readings-box">
                      <div className="reading-item">
                        <span className="reading-tag on">Onyomi</span>
                        <span className="reading-val">{currentCard.onyomi || '—'}</span>
                      </div>
                      <div className="reading-item">
                        <span className="reading-tag kun">Kunyomi</span>
                        <span className="reading-val">{currentCard.kunyomi || '—'}</span>
                      </div>
                    </div>

                    <div className="kanji-meaning-box">
                      <span className="meaning-tag">Meaning:</span>
                      <strong>{currentCard.viet}</strong>
                    </div>

                    {/* Related vocabulary list (with kana review on top and Hán-Việt tap review) */}
                    {currentCard.vocabList && currentCard.vocabList.length > 0 && (
                      <div className="kanji-vocab-section">
                        <div className="section-title">Related Vocab ({currentCard.vocabList.length})</div>
                        {currentCard.vocabList.map((item, idx) => (
                          <div key={idx} className="kanji-vocab-row">
                            <div className="vocab-top-row">
                              <div className="vocab-jp-wrap">
                                <ruby
                                  className="vocab-kanji jp-word-container"
                                  data-kanji-target="true"
                                  data-kanji={item.kanji}
                                  data-kana={item.kana}
                                  data-hanviet={item.hanViet}
                                  data-meaning={item.meaning}
                                  style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
                                >
                                  <span className="kanji-text">{item.kanji}</span>
                                  <rt className="ruby-text">{item.kana}</rt>
                                </ruby>
                                <span className="vocab-hv">{item.hanViet}</span>
                              </div>
                              <button
                                type="button"
                                className="mini-audio-btn"
                                onClick={(e) => playAudio(e, item.kanji)}
                                title="Play"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                              </button>
                            </div>
                            <div className="vocab-meaning">{item.meaning}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Layout for VOCAB Card */
                  <>
                    <div className="ans-vi">{currentCard.viet}</div>
                    <div className="ans-jp">{renderJapaneseWord(currentCard, false)}</div>
                    <div className="hv">Hán-Việt: {currentCard.hanViet}</div>
                  </>
                )}

                <div className="divider"></div>

                {/* Example sentence with Han-Viet tap inspection & audio */}
                <div className="ex-label">
                  <span>Example</span>
                  <button
                    type="button"
                    className="audio-btn"
                    onClick={(e) => playAudio(e, currentCard.example)}
                    title="Play sentence"
                  >
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  </button>
                </div>

                <div className="ex-jp" id="exJp">
                  {renderRubySentence(currentCard.exampleRuby, currentCard.example)}
                </div>
                <div className="ex-vi" id="exVi">
                  {currentCard.exampleViet}
                </div>
              </section>
            </div>
          </main>

          {/* Bottom Flashcard Controls: Floating dock overlaying bottom of the full screen card */}
          <nav
            className="controls-dock"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="nav-btn"
              id="prevBtn"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="nav-btn primary"
              id="flipBtn"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
              title="Flip"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="nav-btn primary"
              id="nextBtn"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              className="nav-btn"
              id="shuffleBtn"
              onClick={(e) => {
                e.stopPropagation();
                handleShuffle();
              }}
              title="Shuffle"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}

      {/* VIEW 2: Vocabulary & Kanji List */}
      {activeView === 'list' && (
        <main className="simple-view-wrap">
          {/* Search & Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                className="w-4 h-4"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#f9fafb',
                }}
              />
            </div>

            {/* Sub-filter chips: All / Kanji / Vocab */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`chip ${listFilter === 'all' ? 'active' : ''}`}
                onClick={() => setListFilter('all')}
              >
                All ({cards.length})
              </button>
              <button
                type="button"
                className={`chip ${listFilter === 'kanji' ? 'active' : ''}`}
                onClick={() => setListFilter('kanji')}
              >
                Kanji ({cards.filter((c) => c.type === 'kanji').length})
              </button>
              <button
                type="button"
                className={`chip ${listFilter === 'vocab' ? 'active' : ''}`}
                onClick={() => setListFilter('vocab')}
              >
                Vocab ({cards.filter((c) => c.type !== 'kanji').length})
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredList.map((w) => (
              <div
                key={w.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: '1px solid #f0f1f4',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: w.type === 'kanji' ? '#b45309' : '#6b7280', background: w.type === 'kanji' ? '#fef3c7' : '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                      {w.type === 'kanji' ? 'Kanji' : 'Vocab'}
                    </span>

                    <ruby
                      className="jp-word-container"
                      data-kanji-target="true"
                      data-kanji={w.kanji}
                      data-kana={w.type === 'kanji' ? w.onyomi || w.kana : w.kana}
                      data-hanviet={w.hanViet}
                      data-meaning={w.viet}
                      style={{
                        fontSize: w.type === 'kanji' ? '22px' : '18px',
                        fontWeight: '700',
                        color: '#111827',
                        cursor: isHanVietMode ? 'crosshair' : 'inherit',
                      }}
                    >
                      <span className="kanji-text">{w.kanji}</span>
                      {w.kanji !== w.kana && (
                        <rt className="ruby-text kana-overlay">
                          {w.type === 'kanji' ? w.onyomi || w.kana : w.kana}
                        </rt>
                      )}
                    </ruby>

                    <button
                      type="button"
                      className="audio-btn"
                      onClick={(e) => playAudio(e, w.kanji)}
                      title="Play"
                    >
                      <Volume2 className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginLeft: '8px' }}>
                    <span className="hv" style={{ margin: 0, padding: '3px 9px', fontSize: '11px' }}>
                      {w.hanViet}
                    </span>
                    {w.partOfSpeech && (
                      <span className="pos-subtle" style={{ fontSize: '10.5px' }}>
                        ({w.partOfSpeech.toLowerCase()})
                      </span>
                    )}
                  </div>
                </div>

                {w.type === 'kanji' && (
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', marginBottom: '6px' }}>
                    <span><strong>On:</strong> {w.onyomi || '—'}</span>
                    <span><strong>Kun:</strong> {w.kunyomi || '—'}</span>
                  </div>
                )}

                <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                  {w.viet}
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280', background: '#f9fafb', padding: '8px 10px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="ex-jp" style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.85 }}>
                      {renderRubySentence(w.exampleRuby, w.example)}
                    </div>
                    <button
                      type="button"
                      className="audio-btn"
                      onClick={(e) => playAudio(e, w.example)}
                      title="Play"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  </div>
                  <div style={{ marginTop: '2px', color: '#9ca3af', fontSize: '12px' }}>{w.exampleViet}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* VIEW 3: Lesson Selection Screen (no redundant titles or back button, just cards) */}
      {activeView === 'lessons' && (
        <main className="lessons-view">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LESSONS.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              const kanjiCount = lesson.cards.filter((c) => c.type === 'kanji').length;
              const vocabCount = lesson.cards.filter((c) => c.type !== 'kanji').length;

              return (
                <div
                  key={lesson.id}
                  className={`lesson-card ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    setActiveView('flashcard');
                  }}
                >
                  <div className="lesson-title">{lesson.title}</div>
                  <p className="lesson-desc">{lesson.description}</p>
                  <div className="lesson-stats">
                    <span className="lesson-stat-pill">
                      {kanjiCount} Kanji • {vocabCount} Vocab
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* VIEW 4: Settings Screen (clean, no redundant titles or back button, just controls) */}
      {activeView === 'settings' && (
        <main className="settings-view">
          {/* Section 1: Front Face Content Selection */}
          <div className="setting-section">
            <div className="setting-title">
              <span>Front face</span>
            </div>
            <select
              id="frontFaceSelect"
              className="setting-select"
              value={frontFaceOption}
              onChange={(e) => setFrontFaceOption(e.target.value as FrontFaceOption)}
            >
              <option value="kanji">Kanji</option>
              <option value="kana">Kana / On & Kun</option>
              <option value="hanviet">Han-Viet</option>
              <option value="meaning">Vietnamese meaning</option>
              <option value="audio-jp">Japanese audio only</option>
              <option value="audio-vn">Vietnamese audio only</option>
            </select>
          </div>

          {/* Section 2: Audio Volume Tuning */}
          <div className="setting-section">
            <div className="setting-title">
              <span>Volume</span>
            </div>
            <div className="volume-slider-row">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-val-badge">{Math.round(audioVolume * 100)}%</span>
              <button
                type="button"
                className="topbar-icon-btn"
                onClick={() => speakJapanese('日本語', 0.9, audioVolume)}
                title="Test audio"
                style={{ width: '32px', height: '32px' }}
              >
                <Volume2 className="w-4 h-4 text-blue-500" />
              </button>
            </div>
          </div>

          {/* Section 3: Auto Read */}
          <div className="setting-section">
            <div className="setting-row">
              <div className="setting-title">
                <span>Auto read</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={autoReadEnabled}
                  onChange={(e) => setAutoReadEnabled(e.target.checked)}
                />
                <span className="setting-toggle-slider"></span>
              </label>
            </div>

            {autoReadEnabled && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className={`chip ${autoReadLang === 'jp' ? 'active' : ''}`}
                  onClick={() => setAutoReadLang('jp')}
                >
                  JP
                </button>
                <button
                  type="button"
                  className={`chip ${autoReadLang === 'vn' ? 'active' : ''}`}
                  onClick={() => setAutoReadLang('vn')}
                >
                  VN
                </button>
              </div>
            )}
          </div>
        </main>
      )}


      {/* Dashed trail & release destination indicator */}
      {isDragging && dragPos && (
        <svg
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 48,
          }}
        >
          {dragBtn === 'hanviet' && dragOrigin && (
            <>
              <circle
                cx={dragOrigin.x}
                cy={dragOrigin.y}
                r="70"
                fill="#8b5cf6"
                fillOpacity="0.08"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={isProjecting ? 0.75 : 0.3}
              />
              <circle
                cx={dragOrigin.x}
                cy={dragOrigin.y}
                r="3"
                fill="#8b5cf6"
                opacity="0.5"
              />
              {isProjecting && projPoint && (
                <g transform={`translate(${projPoint.x}, ${projPoint.y})`}>
                  <circle
                    r="14"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                    opacity="0.75"
                  />
                  <circle
                    r="3"
                    fill="#8b5cf6"
                    opacity="0.9"
                  />
                </g>
              )}
            </>
          )}

          {targetSnapCoords && !isProjecting && (
            <g
              transform={`translate(${targetSnapCoords.x}, ${targetSnapCoords.y})`}
              style={{ transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            >
              <circle
                r="24"
                fill={dragBtn === 'kana' ? '#3b82f6' : dragBtn === 'hanviet' ? '#8b5cf6' : '#10b981'}
                fillOpacity="0.10"
                stroke={dragBtn === 'kana' ? '#3b82f6' : dragBtn === 'hanviet' ? '#8b5cf6' : '#10b981'}
                strokeWidth="1.8"
                strokeDasharray="4 3"
                opacity="0.55"
              />
              <circle
                r="3"
                fill={dragBtn === 'kana' ? '#3b82f6' : dragBtn === 'hanviet' ? '#8b5cf6' : '#10b981'}
                opacity="0.35"
              />
            </g>
          )}
        </svg>
      )}

      {/* Draggable FAB 1: Kana reveal */}
      <button
        className={`fab fab-kana ${isFabPressed || showKana ? 'pressed' : ''} ${isDragging && dragBtn === 'kana' ? 'is-dragging' : ''}`}
        id="kanaHoldBtn"
        title="Kana: Giữ để hiển thị / Kéo để chuyển vị trí"
        style={{
          left: `${dragBtn === 'kana' && dragPos ? dragPos.x : snapCoords.kana.x}px`,
          top: `${dragBtn === 'kana' && dragPos ? dragPos.y : snapCoords.kana.y}px`,
          transition: dragBtn === 'kana' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (err) {}
          const now = performance.now();
          dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
          pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
          setDragOrigin({ x: snapCoords.kana.x + 25, y: snapCoords.kana.y + 25 });
          setDragBtn('kana');
          setIsDragging(false);
          startReveal();
        }}
        onPointerMove={(e) => {
          if (dragBtn !== 'kana') return;
          const now = performance.now();
          pointerHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: now });
          while (pointerHistoryRef.current.length > 2 && now - pointerHistoryRef.current[0].time > 140) {
            pointerHistoryRef.current.shift();
          }

          const dist = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
          if (dist > 6) {
            dragStartRef.current.moved = true;
            setIsDragging(true);
          }
          if (dist >= 10 && !dragStartRef.current.swipeStartTime) {
            dragStartRef.current.swipeStartTime = now;
          }
          setDragPos({ x: e.clientX - 25, y: e.clientY - 25 });
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}
          stopReveal();

          const now = performance.now();
          const totalDx = e.clientX - dragStartRef.current.x;
          const totalDy = e.clientY - dragStartRef.current.y;
          const totalDist = Math.hypot(totalDx, totalDy);

          const swipeDuration = dragStartRef.current.swipeStartTime
            ? (now - dragStartRef.current.swipeStartTime)
            : (now - dragStartRef.current.time);
          const totalDuration = now - dragStartRef.current.time;

          const history = pointerHistoryRef.current;
          const recentPt = history.find((p) => now - p.time <= 100);
          const recentDist = recentPt ? Math.hypot(e.clientX - recentPt.x, e.clientY - recentPt.y) : 0;

          const isQuickSwipe = (totalDist >= 18 && (swipeDuration < 100 || totalDuration < 100)) || recentDist >= 20;

          if (isQuickSwipe) {
            const flickDx = recentPt ? e.clientX - recentPt.x : totalDx;
            const flickDy = recentPt ? e.clientY - recentPt.y : totalDy;
            const dirX = Math.abs(flickDx) > 8 ? flickDx : totalDx;
            const dirY = Math.abs(flickDy) > 8 ? flickDy : totalDy;
            const targetCorner = getSwipeCorner(dirX, dirY, e.clientX, e.clientY, winSize.w, winSize.h, snapKana);
            setSnapKana(targetCorner);
          } else if (dragStartRef.current.moved) {
            const newSnap = findSnapPositionWithinRange(
              e.clientX,
              e.clientY,
              winSize.w,
              winSize.h,
              'kana',
              { kana: snapKana, hanViet: snapHanViet, read: activeView === 'flashcard' ? snapRead : undefined },
              SNAP_RANGE
            );
            if (newSnap) {
              setSnapKana(newSnap);
            }
          }

          setIsDragging(false);
          setDragOrigin(null);
          setDragBtn(null);
          setDragPos(null);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          stopReveal();
          setIsDragging(false);
          setDragOrigin(null);
          setDragBtn(null);
          setDragPos(null);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        あ
      </button>

      {/* Draggable FAB 2: Han-Viet word reveal */}
      <button
        className={`fab fab-hanviet ${isHanVietMode ? 'active-mode' : ''} ${isDragging && dragBtn === 'hanviet' ? 'is-dragging' : ''}`}
        id="hanvietInspectBtn"
        title="Hán-Việt: Chạm để bật chế độ tra từ / Kéo để chuyển vị trí"
        style={{
          left: `${dragBtn === 'hanviet' && dragPos ? dragPos.x : snapCoords.hanViet.x}px`,
          top: `${dragBtn === 'hanviet' && dragPos ? dragPos.y : snapCoords.hanViet.y}px`,
          transition: dragBtn === 'hanviet' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (err) {}
          const now = performance.now();
          dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
          pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
          setDragOrigin({ x: snapCoords.hanViet.x + 25, y: snapCoords.hanViet.y + 25 });
          setDragBtn('hanviet');
          setIsDragging(false);
          setIsProjecting(false);
          setProjPoint(null);
        }}
        onPointerMove={(e) => {
          if (dragBtn !== 'hanviet') return;
          const now = performance.now();
          pointerHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: now });
          while (pointerHistoryRef.current.length > 2 && now - pointerHistoryRef.current[0].time > 140) {
            pointerHistoryRef.current.shift();
          }

          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 6) {
            dragStartRef.current.moved = true;
            setIsDragging(true);
          }
          if (dist >= 10 && !dragStartRef.current.swipeStartTime) {
            dragStartRef.current.swipeStartTime = now;
          }

          if (dist > 70) {
            setIsProjecting(false);
            setProjPoint(null);
            setActiveBubble(null);
            setDragPos({ x: e.clientX - 25, y: e.clientY - 25 });
          } else {
            setDragPos({ x: e.clientX - 25, y: e.clientY - 25 });
            setIsProjecting(true);

            const factor = Math.max(winSize.w, winSize.h) / 38;
            const targetX = Math.max(20, Math.min(winSize.w - 20, (snapCoords.hanViet.x + 25) + dx * factor));
            const targetY = Math.max(30, Math.min(winSize.h - 30, (snapCoords.hanViet.y + 25) + dy * factor));
            setProjPoint({ x: targetX, y: targetY });

            const nearest = findNearestKanji(targetX, targetY, Infinity);
            if (nearest) {
              setActiveBubble(nearest);
            }
          }
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}

          const now = performance.now();
          const totalDx = e.clientX - dragStartRef.current.x;
          const totalDy = e.clientY - dragStartRef.current.y;
          const totalDist = Math.hypot(totalDx, totalDy);

          const swipeDuration = dragStartRef.current.swipeStartTime
            ? (now - dragStartRef.current.swipeStartTime)
            : (now - dragStartRef.current.time);
          const totalDuration = now - dragStartRef.current.time;

          const history = pointerHistoryRef.current;
          const recentPt = history.find((p) => now - p.time <= 100);
          const recentDist = recentPt ? Math.hypot(e.clientX - recentPt.x, e.clientY - recentPt.y) : 0;

          const isQuickSwipe = (totalDist >= 18 && (swipeDuration < 100 || totalDuration < 100)) || recentDist >= 20;

          if (isQuickSwipe) {
            setActiveBubble(null);
            const flickDx = recentPt ? e.clientX - recentPt.x : totalDx;
            const flickDy = recentPt ? e.clientY - recentPt.y : totalDy;
            const dirX = Math.abs(flickDx) > 8 ? flickDx : totalDx;
            const dirY = Math.abs(flickDy) > 8 ? flickDy : totalDy;
            const targetCorner = getSwipeCorner(dirX, dirY, e.clientX, e.clientY, winSize.w, winSize.h, snapHanViet);
            setSnapHanViet(targetCorner);
          } else if (totalDist > 70) {
            setActiveBubble(null);
            const newSnap = findSnapPositionWithinRange(
              e.clientX,
              e.clientY,
              winSize.w,
              winSize.h,
              'hanviet',
              { kana: snapKana, hanViet: snapHanViet, read: activeView === 'flashcard' ? snapRead : undefined },
              SNAP_RANGE
            );
            if (newSnap) {
              setSnapHanViet(newSnap);
            }
          } else if (dragStartRef.current.moved) {
            setActiveBubble(null);
          } else {
            setIsHanVietMode((prev) => !prev);
            setActiveBubble(null);
          }

          setIsDragging(false);
          setIsProjecting(false);
          setProjPoint(null);
          setDragOrigin(null);
          setDragBtn(null);
          setDragPos(null);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          setActiveBubble(null);
          setIsDragging(false);
          setIsProjecting(false);
          setProjPoint(null);
          setDragOrigin(null);
          setDragBtn(null);
          setDragPos(null);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        漢
      </button>

      {/* Draggable FAB 3: Floating Read Button (Only appears in flashcard page) */}
      {activeView === 'flashcard' && (
        <button
          className={`fab fab-read ${isSpeaking ? 'speaking' : ''} ${isDragging && dragBtn === 'read' ? 'is-dragging' : ''}`}
          id="readFabBtn"
          title={
            !flipped
              ? frontFaceOption === 'meaning' || frontFaceOption === 'audio-vn'
                ? 'Đọc nghĩa tiếng Việt'
                : 'Đọc từ tiếng Nhật'
              : 'Đọc câu ví dụ (Tiếng Nhật)'
          }
          style={{
            left: `${dragBtn === 'read' && dragPos ? dragPos.x : snapCoords.read.x}px`,
            top: `${dragBtn === 'read' && dragPos ? dragPos.y : snapCoords.read.y}px`,
            transition: dragBtn === 'read' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch (err) {}
            const now = performance.now();
            dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
            pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
            setDragOrigin({ x: snapCoords.read.x + 25, y: snapCoords.read.y + 25 });
            setDragBtn('read');
            setIsDragging(false);
          }}
          onPointerMove={(e) => {
            if (dragBtn !== 'read') return;
            const now = performance.now();
            pointerHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: now });
            while (pointerHistoryRef.current.length > 2 && now - pointerHistoryRef.current[0].time > 140) {
              pointerHistoryRef.current.shift();
            }

            const dist = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
            if (dist > 6) {
              dragStartRef.current.moved = true;
              setIsDragging(true);
            }
            if (dist >= 10 && !dragStartRef.current.swipeStartTime) {
              dragStartRef.current.swipeStartTime = now;
            }
            setDragPos({ x: e.clientX - 25, y: e.clientY - 25 });
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch (err) {}

            const now = performance.now();
            const totalDx = e.clientX - dragStartRef.current.x;
            const totalDy = e.clientY - dragStartRef.current.y;
            const totalDist = Math.hypot(totalDx, totalDy);

            const swipeDuration = dragStartRef.current.swipeStartTime
              ? (now - dragStartRef.current.swipeStartTime)
              : (now - dragStartRef.current.time);
            const totalDuration = now - dragStartRef.current.time;

            const history = pointerHistoryRef.current;
            const recentPt = history.find((p) => now - p.time <= 100);
            const recentDist = recentPt ? Math.hypot(e.clientX - recentPt.x, e.clientY - recentPt.y) : 0;

            const isQuickSwipe = (totalDist >= 18 && (swipeDuration < 100 || totalDuration < 100)) || recentDist >= 20;

            if (isQuickSwipe) {
              const flickDx = recentPt ? e.clientX - recentPt.x : totalDx;
              const flickDy = recentPt ? e.clientY - recentPt.y : totalDy;
              const dirX = Math.abs(flickDx) > 8 ? flickDx : totalDx;
              const dirY = Math.abs(flickDy) > 8 ? flickDy : totalDy;
              const targetCorner = getSwipeCorner(dirX, dirY, e.clientX, e.clientY, winSize.w, winSize.h, snapRead);
              setSnapRead(targetCorner);
            } else if (dragStartRef.current.moved) {
              const newSnap = findSnapPositionWithinRange(
                e.clientX,
                e.clientY,
                winSize.w,
                winSize.h,
                'read',
                { kana: snapKana, hanViet: snapHanViet, read: snapRead },
                SNAP_RANGE
              );
              if (newSnap) {
                setSnapRead(newSnap);
              }
            } else {
              handleReadClick();
            }

            setIsDragging(false);
            setDragOrigin(null);
            setDragBtn(null);
            setDragPos(null);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            setIsDragging(false);
            setDragOrigin(null);
            setDragBtn(null);
            setDragPos(null);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Volume2 className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Floating Han-Viet Bubble pointing directly to target word */}
      {activeBubble && (
        <HanVietBubbleView
          activeBubble={activeBubble}
          winSize={winSize}
        />
      )}
    </div>
  );
}

// Subcomponent: Han-Viet Bubble
function HanVietBubbleView({
  activeBubble,
  winSize,
}: {
  activeBubble: {
    kanji: string;
    kana?: string;
    hanViet: string;
    meaning?: string;
    rect: DOMRect;
    element: HTMLElement;
    isFlipped: boolean;
  };
  winSize: { w: number; h: number };
}) {
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number; isFlipped: boolean }>({
    x: 0,
    y: 0,
    isFlipped: false,
  });

  useLayoutEffect(() => {
    const el = activeBubble.element;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const centerX = r.left + r.width / 2;
    const isFlipped = r.top < 95;
    const centerY = isFlipped ? r.bottom + 6 : r.top - 6;

    setBubblePos({
      x: centerX,
      y: centerY,
      isFlipped,
    });
  }, [activeBubble]);

  const bubbleLeft = Math.max(30, Math.min(winSize.w - 30, bubblePos.x));

  return (
    <div
      className={`hanviet-bubble ${bubblePos.isFlipped ? 'bubble-flipped' : ''}`}
      style={{
        left: `${bubbleLeft}px`,
        top: `${bubblePos.y}px`,
      }}
    >
      <div className="bubble-card">
        <span className="bubble-title">{activeBubble.hanViet}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="bubble-sub">{activeBubble.kanji}</span>
          {activeBubble.kana && (
            <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '600' }}>
              ({activeBubble.kana})
            </span>
          )}
        </div>
        {activeBubble.meaning && (
          <div className="bubble-meaning">
            {activeBubble.meaning}
          </div>
        )}
      </div>
      <div
        className={`bubble-arrow ${bubblePos.isFlipped ? 'arrow-up' : 'arrow-down'}`}
      />
    </div>
  );
}
