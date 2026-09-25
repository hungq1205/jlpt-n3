import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { Volume2, Search, RotateCw, Check, Copy, Download, X } from 'lucide-react';
import { DATA, Flashcard } from './data/flashcards';
import { speakJapanese, speakVietnamese } from './utils/speech';
import { getHanViet, getKanjiMeaning } from './data/hanVietDict';
import { getSnapCoords, findNearestSnapPosition, findSnapPositionWithinRange, getSwipeCorner, SnapPosition, Point, SNAP_RANGE } from './utils/snapLayout';

export default function App() {
  // Navigation & state
  const [activeTab, setActiveTab] = useState<'flashcard' | 'list' | 'quiz'>('flashcard');
  const [order, setOrder] = useState<number[]>(() => DATA.map((_, i) => i));
  const [pos, setPos] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [mode, setMode] = useState<'jp-vi' | 'vi-jp'>('jp-vi');
  const [showKana, setShowKana] = useState<boolean>(false);
  const [isFabPressed, setIsFabPressed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Draggable FAB snap positions (default to bottom-right corner)
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
    hanViet: string;
    meaning?: string;
    rect: DOMRect;
    element: HTMLElement;
    isFlipped: boolean;
  } | null>(null);

  // JSON modal
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
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

  // List view search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quiz state
  const [quizPos, setQuizPos] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });
  const cardWrapRef = useRef<HTMLDivElement>(null);

  // Current card in flashcard mode
  const currentCard: Flashcard = DATA[order[pos]] || DATA[0];

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

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'jp-vi' ? 'vi-jp' : 'jp-vi'));
  }, []);

  const handleShuffle = useCallback(() => {
    const newOrder = [...order];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setOrder(newOrder);
    setPos(0);
    setFlipped(false);
  }, [order]);

  // Audio helper with stopPropagation
  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakJapanese(text);
  };

  // Pure hold-to-reveal handlers (starts on press/touch, turns off IMMEDIATELY on release)
  const startReveal = useCallback(() => {
    setShowKana(true);
    setIsFabPressed(true);
  }, []);

  const stopReveal = useCallback(() => {
    setShowKana(false);
    setIsFabPressed(false);
  }, []);

  // Global window listeners: the EXACT moment touch or mouse is released anywhere, turn off kana
  useEffect(() => {
    const handleGlobalRelease = () => {
      setShowKana(false);
      setIsFabPressed(false);
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
  }, []);

  // Keyboard navigation on PC (hold K to reveal, release K to hide)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showJsonModal || e.target instanceof HTMLInputElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'flashcard') handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeTab === 'flashcard') handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeTab === 'flashcard') handlePrev();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMode();
      } else if (e.key.toLowerCase() === 'k' && !e.repeat) {
        startReveal();
      } else if (e.key.toLowerCase() === 'a') {
        if (activeTab === 'flashcard' && currentCard) speakJapanese(currentCard.kanji);
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
  }, [showJsonModal, activeTab, handleFlip, handleNext, handlePrev, handleToggleMode, currentCard, startReveal, stopReveal]);

  // Track window resizing for snap calculations
  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to find nearest kanji word on screen (excluding hidden faces of the flashcard)
  const findNearestKanji = useCallback((x: number, y: number, maxDist = 30) => {
    const elements = document.querySelectorAll<HTMLElement>('[data-kanji-target="true"]');
    let closestEl: HTMLElement | null = null;
    let closestDist = Infinity;
    let closestRect: DOMRect | null = null;

    elements.forEach((el) => {
      // The hidden face in the flashcard should not be detectable with Han-Viet reveal
      const face = el.closest('.face');
      if (face) {
        if (face.classList.contains('back') && !flipped) return;
        if (face.classList.contains('front') && flipped) return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Distance from point (x, y) to the actual boundary of the kanji element
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
      const hanViet = el.getAttribute('data-hanviet') || getHanViet(kanji);
      const meaning = el.getAttribute('data-meaning') || getKanjiMeaning(kanji);
      return {
        element: el,
        kanji,
        hanViet,
        meaning,
        rect: targetRect,
        isFlipped: targetRect.top < 85,
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

  // Intercept taps when tap-selecting kanji word for Han-Viet without triggering other clicks
  useEffect(() => {
    if (!isHanVietMode) return;

    const handleCapturePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Let interactions on the Han-Viet FAB, Kana FAB, or Read FAB pass through
      if (target && (target.closest('.fab-hanviet') || target.closest('.fab-kana') || target.closest('.fab-read'))) {
        return;
      }

      // Prevent triggering other elements (card flip, speech audio, buttons, etc.)
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      // Find snappable kanji within 30px proximity only
      const found = findNearestKanji(clientX, clientY, 30);
      if (found) {
        setActiveBubble(found);
      } else {
        // When tap onto nowhere (no snappable Han-Viet), turn off Han-Viet mode
        // and suppress any click/pointer event from triggering other elements
        suppressClickUntilRef.current = Date.now() + 450;
        setIsHanVietMode(false);
        setActiveBubble(null);
      }
    };

    window.addEventListener('click', handleCapturePointerDown, true);
    window.addEventListener('pointerdown', handleCapturePointerDown, true);
    window.addEventListener('pointerup', handleCapturePointerDown, true);
    return () => {
      window.removeEventListener('click', handleCapturePointerDown, true);
      window.removeEventListener('pointerdown', handleCapturePointerDown, true);
      window.removeEventListener('pointerup', handleCapturePointerDown, true);
    };
  }, [isHanVietMode, findNearestKanji]);

  // Compute resting coordinates for draggable FABs
  const snapCoords = useMemo(() => {
    return getSnapCoords(
      snapKana,
      snapHanViet,
      activeTab === 'flashcard' ? snapRead : undefined,
      winSize.w,
      winSize.h
    );
  }, [snapKana, snapHanViet, snapRead, activeTab, winSize.w, winSize.h]);

  // Compute predicted release snap destination while dragging (only if within small range)
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
        read: activeTab === 'flashcard' ? snapRead : undefined,
      }
    );
    if (!matchedSnap) return null;
    const coords = getSnapCoords(
      dragBtn === 'kana' ? matchedSnap : snapKana,
      dragBtn === 'hanviet' ? matchedSnap : snapHanViet,
      activeTab === 'flashcard' ? (dragBtn === 'read' ? matchedSnap : snapRead) : undefined,
      winSize.w,
      winSize.h
    );
    const targetPt = dragBtn === 'kana' ? coords.kana : dragBtn === 'hanviet' ? coords.hanViet : coords.read;
    if (!targetPt) return null;
    return { x: targetPt.x + 25, y: targetPt.y + 25 };
  }, [isDragging, dragBtn, dragPos, snapKana, snapHanViet, snapRead, activeTab, winSize.w, winSize.h]);

  // Floating read button action:
  // - If click on front face: read word (japanese if jp->vi, vietnamese if vi->jp)
  // - If click on back face: read sentence (always japanese)
  const handleReadClick = useCallback(() => {
    if (activeTab !== 'flashcard' || !currentCard) return;

    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 900);

    if (!flipped) {
      if (mode === 'jp-vi') {
        speakJapanese(currentCard.kanji);
      } else {
        speakVietnamese(currentCard.viet);
      }
    } else {
      speakJapanese(currentCard.example);
    }
  }, [activeTab, currentCard, flipped, mode]);

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
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      touchStartRef.current.moved = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current.moved) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    if (Math.abs(dx) > 55) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Render Japanese word with kana overlay and kanji target data
  const renderJapaneseWord = (w: Flashcard, showAudio = true) => {
    const hasKanji = w.kanji && w.kanji !== w.kana;
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className="jp-word-container"
          data-kanji-target="true"
          data-kanji={w.kanji}
          data-hanviet={w.hanViet}
          data-meaning={w.viet}
          style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
        >
          {hasKanji && <span className="kana-overlay">{w.kana}</span>}
          <span className="kanji-text">{w.kanji}</span>
        </span>
        {showAudio && (
          <button
            type="button"
            className="audio-btn"
            onClick={(e) => playAudio(e, w.kanji)}
            title="Phát âm"
          >
            <Volume2 className="w-5 h-5 text-blue-500 hover:text-blue-700" />
          </button>
        )}
      </span>
    );
  };

  // Render example sentence with furigana precisely placed on top of its respective kanji
  const renderRubySentence = (rubyText?: string, plainText?: string) => {
    if (!rubyText) return plainText || '';
    // Matches only the Kanji characters directly preceding the [furigana]
    const regex = /([\u4e00-\u9faf\u3005]+)\[([^\]]+)\]/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = regex.exec(rubyText)) !== null) {
      // 1. Plain text before this kanji match (Hiragana particles, Katakana, punctuation, numbers)
      if (match.index > lastIndex) {
        nodes.push(<span key={`txt-${idx++}`}>{rubyText.slice(lastIndex, match.index)}</span>);
      }

      // 2. The Kanji base and its exact Furigana
      const kanji = match[1];
      const furigana = match[2];

      nodes.push(
        <ruby
          key={`rb-${idx++}`}
          data-kanji-target="true"
          data-kanji={kanji}
          data-hanviet={getHanViet(kanji)}
          data-meaning={getKanjiMeaning(kanji)}
          style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
        >
          {kanji}
          <rt className="ruby-text">{furigana}</rt>
        </ruby>
      );

      lastIndex = regex.lastIndex;
    }

    // 3. Any trailing text
    if (lastIndex < rubyText.length) {
      nodes.push(<span key={`txt-${idx++}`}>{rubyText.slice(lastIndex)}</span>);
    }

    return nodes;
  };

  // List view filtered items
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return DATA;
    const q = searchQuery.toLowerCase().trim();
    return DATA.filter(
      (w) =>
        w.kanji.toLowerCase().includes(q) ||
        w.kana.toLowerCase().includes(q) ||
        w.viet.toLowerCase().includes(q) ||
        w.hanViet.toLowerCase().includes(q) ||
        w.example.toLowerCase().includes(q) ||
        (w.exampleKana && w.exampleKana.toLowerCase().includes(q)) ||
        w.exampleViet.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Quiz current question options
  const quizCard = DATA[quizPos];
  const quizOptions = useMemo(() => {
    if (!quizCard) return [];
    const correct = mode === 'jp-vi' ? quizCard.viet : quizCard.kanji;
    const others = DATA.filter((d) => d.id !== quizCard.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => (mode === 'jp-vi' ? d.viet : d.kanji));

    return [correct, ...others].sort(() => Math.random() - 0.5);
  }, [quizPos, quizCard, mode]);

  const handleQuizSelect = (opt: string) => {
    if (quizAnswered) return;
    setQuizSelected(opt);
    setQuizAnswered(true);
    const correct = mode === 'jp-vi' ? quizCard.viet : quizCard.kanji;
    if (opt === correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizPos + 1 < DATA.length) {
      setQuizPos((prev) => prev + 1);
      setQuizSelected(null);
      setQuizAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleQuizRestart = () => {
    setQuizPos(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizFinished(false);
  };

  // Copy JSON handler
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(DATA, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download JSON handler
  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="topbar">
        <div className="chip-group">
          {/* Mode switch */}
          <button className="chip" id="modeBtn" onClick={handleToggleMode}>
            {mode === 'jp-vi' ? 'JP → VI' : 'VI → JP'}
          </button>

          {/* Simple Tab Pills */}
          <button
            className={`chip ${activeTab === 'flashcard' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcard')}
          >
            Thẻ
          </button>
          <button
            className={`chip ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Danh sách
          </button>
          <button
            className={`chip ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button
            className="chip"
            onClick={() => setShowJsonModal(true)}
            title="Xem và tải file JSON"
          >
            {'{ }'} JSON
          </button>
        </div>

        {/* Counter */}
        <div className="counter" id="counter">
          {activeTab === 'flashcard' && `${pos + 1} / ${order.length}`}
          {activeTab === 'list' && `${filteredList.length} từ`}
          {activeTab === 'quiz' && !quizFinished && `${quizPos + 1} / ${DATA.length}`}
        </div>
      </header>

      {/* Main Flashcard View */}
      {activeTab === 'flashcard' && (
        <>
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
                    <span>{mode === 'jp-vi' ? '日本語' : 'Tiếng Việt'}</span>
                    {currentCard.partOfSpeech && (
                      <span className="pos-subtle">({currentCard.partOfSpeech.toLowerCase()})</span>
                    )}
                  </div>
                  {mode === 'jp-vi' && (
                    <button
                      type="button"
                      className="audio-btn"
                      onClick={(e) => playAudio(e, currentCard.kanji)}
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4 text-blue-500" />
                    </button>
                  )}
                </div>

                <div className="big jp">
                  {mode === 'jp-vi' ? (
                    renderJapaneseWord(currentCard, false)
                  ) : (
                    <span>{currentCard.viet}</span>
                  )}
                </div>

                <div className="hint">
                  {mode === 'jp-vi' ? 'Nhấn để xem nghĩa' : 'Nhấn để xem tiếng Nhật'}
                </div>
              </section>

              {/* Back Face */}
              <section className="face back" id="back">
                <div className="label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Đáp án</span>
                    {currentCard.partOfSpeech && (
                      <span className="pos-subtle">({currentCard.partOfSpeech.toLowerCase()})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="audio-btn"
                    onClick={(e) => playAudio(e, currentCard.kanji)}
                    title="Phát âm từ"
                  >
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  </button>
                </div>

                {mode === 'vi-jp' ? (
                  <>
                    <div className="ans-jp">{renderJapaneseWord(currentCard, false)}</div>
                    <div className="ans-vi">{currentCard.viet}</div>
                  </>
                ) : (
                  <>
                    <div className="ans-vi">{currentCard.viet}</div>
                    <div className="ans-jp">{renderJapaneseWord(currentCard, false)}</div>
                  </>
                )}

                <div className="hv">Hán-Việt: {currentCard.hanViet}</div>
                <div className="divider"></div>

                <div className="ex-label">
                  <span>Ví dụ</span>
                  <button
                    type="button"
                    className="audio-btn"
                    onClick={(e) => playAudio(e, currentCard.example)}
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  </button>
                </div>

                {/* Example sentence with furigana on top of kanji on hold */}
                <div className="ex-jp">
                  {renderRubySentence(currentCard.exampleRuby, currentCard.example)}
                </div>
                <div className="ex-vi">{currentCard.exampleViet}</div>
              </section>
            </div>
          </main>

          {/* Controls */}
          <footer className="controls">
            <button className="nav" id="prevBtn" onClick={handlePrev} title="Thẻ trước [←]">
              ←
            </button>
            <button className="nav primary" id="flipBtn" onClick={handleFlip} title="Lật thẻ [Space]">
              Lật
            </button>
            <button className="nav" id="nextBtn" onClick={handleNext} title="Thẻ sau [→]">
              →
            </button>
            <button className="nav small" id="shuffleBtn" onClick={handleShuffle} title="Xáo trộn [⤮]">
              ⤮
            </button>
          </footer>
        </>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <main className="simple-view-wrap" style={{ paddingBottom: '90px' }}>
          {/* Simple search bar */}
          <div style={{ marginBottom: '14px', position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Kanji, Kana, nghĩa, Hán-Việt..."
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredList.map((w) => {
              const originalIndex = order.findIndex((i) => i === DATA.findIndex((d) => d.id === w.id));
              return (
                <div
                  key={w.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1px solid #f0f1f4',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,.03)',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af' }}>
                        #{w.id}
                      </span>
                      {/* Japanese Word with Furigana / Kana reveal on hold */}
                      <span
                        className="jp-word-container"
                        data-kanji-target="true"
                        data-kanji={w.kanji}
                        data-hanviet={w.hanViet}
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                          cursor: isHanVietMode ? 'crosshair' : 'inherit',
                        }}
                      >
                        {w.kanji !== w.kana && <span className="kana-overlay">{w.kana}</span>}
                        <span className="kanji-text">{w.kanji}</span>
                      </span>
                      <button
                        type="button"
                        className="audio-btn"
                        onClick={(e) => playAudio(e, w.kanji)}
                        title="Phát âm"
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

                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                    {w.viet}
                  </div>

                  <div style={{ fontSize: '13px', color: '#6b7280', background: '#f9fafb', padding: '8px 10px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Example sentence reveals kana on top of kanji on hold */}
                      <div className="ex-jp" style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.85 }}>
                        {renderRubySentence(w.exampleRuby, w.example)}
                      </div>
                      <button
                        type="button"
                        className="audio-btn"
                        onClick={(e) => playAudio(e, w.example)}
                        title="Nghe câu"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                    </div>
                    <div style={{ marginTop: '2px', color: '#9ca3af', fontSize: '12px' }}>{w.exampleViet}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* Quiz View */}
      {activeTab === 'quiz' && (
        <main className="simple-view-wrap" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '90px' }}>
          {!quizFinished ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className="label" style={{ margin: 0 }}>
                    Câu {quizPos + 1} / {DATA.length}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#3b82f6' }}>
                    Đúng: {quizScore}
                  </span>
                </div>

                <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '1px', marginBottom: '8px' }}>
                    {mode === 'jp-vi' ? 'Nghĩa tiếng Việt của từ là gì?' : 'Từ tiếng Nhật tương ứng là gì?'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {mode === 'jp-vi' ? (
                      <span style={{ fontSize: 'clamp(28px, 7vw, 42px)', fontWeight: '700', color: '#111827' }}>
                        {renderJapaneseWord(quizCard, false)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: '700', color: '#111827' }}>
                        {quizCard.viet}
                      </span>
                    )}

                    {mode === 'jp-vi' && (
                      <button
                        type="button"
                        className="audio-btn"
                        onClick={(e) => playAudio(e, quizCard.kanji)}
                        title="Phát âm"
                      >
                        <Volume2 className="w-5 h-5 text-blue-500" />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                    {quizCard.partOfSpeech && (
                      <span className="pos-subtle" style={{ fontSize: '12px' }}>
                        ({quizCard.partOfSpeech.toLowerCase()})
                      </span>
                    )}
                    {mode === 'jp-vi' && (
                      <span style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '600' }}>
                        {quizCard.hanViet}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Choices */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {quizOptions.map((opt, i) => {
                    const isSelected = quizSelected === opt;
                    const correct = mode === 'jp-vi' ? quizCard.viet : quizCard.kanji;
                    const isCorrect = opt === correct;

                    // If mode is vi-jp, opt is Japanese Kanji; find card to enable kana overlay on hold!
                    const matchedCard = mode === 'vi-jp' ? DATA.find((d) => d.kanji === opt || d.kana === opt) : null;

                    let bg = '#fff';
                    let border = '#e5e7eb';
                    let color = '#374151';

                    if (quizAnswered) {
                      if (isCorrect) {
                        bg = '#10b981';
                        border = '#10b981';
                        color = '#fff';
                      } else if (isSelected && !isCorrect) {
                        bg = '#ef4444';
                        border = '#ef4444';
                        color = '#fff';
                      } else {
                        color = '#9ca3af';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={quizAnswered}
                        onClick={() => handleQuizSelect(opt)}
                        className="nav"
                        style={{
                          height: 'auto',
                          minHeight: '48px',
                          padding: '12px 14px',
                          background: bg,
                          borderColor: border,
                          color: color,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          fontSize: '15px',
                        }}
                      >
                        {matchedCard ? (
                          <span
                            className="jp-word-container"
                            data-kanji-target="true"
                            data-kanji={matchedCard.kanji}
                            data-hanviet={matchedCard.hanViet}
                            style={{ cursor: isHanVietMode ? 'crosshair' : 'inherit' }}
                          >
                            {matchedCard.kanji !== matchedCard.kana && (
                              <span className="kana-overlay" style={{ fontSize: '0.65em' }}>
                                {matchedCard.kana}
                              </span>
                            )}
                            <span className="kanji-text">{matchedCard.kanji}</span>
                          </span>
                        ) : (
                          opt
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {quizAnswered && (
                <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="nav primary" onClick={handleQuizNext} style={{ width: '100%' }}>
                    {quizPos + 1 < DATA.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '36px' }}>🎉</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>
                Hoàn thành bài kiểm tra!
              </h2>
              <p style={{ fontSize: '15px', color: '#4b5563' }}>
                Bạn đã trả lời đúng <strong>{quizScore}</strong> / {DATA.length} câu (
                {Math.round((quizScore / DATA.length) * 100)}%)
              </p>
              <button className="nav primary" onClick={handleQuizRestart} style={{ padding: '0 24px', height: '48px' }}>
                Làm lại bài Quiz
              </button>
            </div>
          )}
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
          {/* Projecting dragging radius (for Han-Viet button) */}
          {dragBtn === 'hanviet' && dragOrigin && (
            <>
              {/* 70px projecting dragging radius boundary */}
              <circle
                cx={dragOrigin.x}
                cy={dragOrigin.y}
                r="70"
                fill="#8b5cf6"
                fillOpacity={isProjecting ? 0.08 : 0.02}
                stroke="#8b5cf6"
                strokeWidth={isProjecting ? 1.8 : 1.2}
                strokeDasharray="4 4"
                opacity={isProjecting ? 0.75 : 0.3}
              />
              {/* Center anchor dot */}
              <circle
                cx={dragOrigin.x}
                cy={dragOrigin.y}
                r="3"
                fill="#8b5cf6"
                opacity="0.5"
              />
              {/* Projected reticle across screenspace */}
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

          {/* Release destination indicator: small dashed outline circle when moving to a new snap slot (80px range) */}
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

      {/* Draggable FAB 1: Kana reveal (Hold to reveal, drag to snap to 8 edge/corner positions) */}
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

          // Quick swipe flick to corner: if total swipe was < 100ms
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
              { kana: snapKana, hanViet: snapHanViet, read: activeTab === 'flashcard' ? snapRead : undefined },
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

      {/* Draggable FAB 2: Han-Viet word reveal (Within 70px = Project to screenspace; Outside 70px = Move button) */}
      <button
        className={`fab fab-hanviet ${isHanVietMode ? 'active-mode' : ''} ${isDragging && dragBtn === 'hanviet' ? 'is-dragging' : ''}`}
        id="hanVietBtn"
        title="Hán-Việt: Rê trong bán kính 70px để quét toàn màn hình / Kéo ra ngoài để di chuyển nút"
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
          setDragPos({ x: e.clientX - 25, y: e.clientY - 25 });

          // Drag within 70px range: project to screen space & snap to closest Kanji (70px snap range limit)
          if (dist <= 70) {
            setIsProjecting(true);
            const originX = snapCoords.hanViet.x + 25;
            const originY = snapCoords.hanViet.y + 25;

            // Calculate max distance to the 4 corners of the viewport
            const cornerDists = [
              Math.hypot(0 - originX, 0 - originY),
              Math.hypot(winSize.w - originX, 0 - originY),
              Math.hypot(0 - originX, winSize.h - originY),
              Math.hypot(winSize.w - originX, winSize.h - originY),
            ];
            const maxCornerDist = Math.max(...cornerDists);
            const scale = maxCornerDist / 70;

            const projX = Math.max(0, Math.min(winSize.w, originX + dx * scale));
            const projY = Math.max(0, Math.min(winSize.h, originY + dy * scale));
            setProjPoint({ x: projX, y: projY });

            // Snap to closest kanji on screen within 70px snap range limit
            const found = findNearestKanji(projX, projY, 70);
            if (found) {
              setActiveBubble(found);
            } else {
              setActiveBubble(null);
            }
          } else {
            // Drag outside 70px range: user wants to move the button!
            setIsProjecting(false);
            setProjPoint(null);
            setActiveBubble(null);
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

          // Quick swipe flick to corner: if total swipe was < 100ms
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
            // Moved outside 70px -> user wants to move the button into new snap position (80px snap range)
            setActiveBubble(null);
            const newSnap = findSnapPositionWithinRange(
              e.clientX,
              e.clientY,
              winSize.w,
              winSize.h,
              'hanviet',
              { kana: snapKana, hanViet: snapHanViet, read: activeTab === 'flashcard' ? snapRead : undefined },
              SNAP_RANGE
            );
            if (newSnap) {
              setSnapHanViet(newSnap);
            }
          } else if (dragStartRef.current.moved) {
            // Dragged within 70px projection range -> hide bubble and spring back to original snap slot
            setActiveBubble(null);
          } else {
            // Tap -> toggle tap-select mode
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
      {activeTab === 'flashcard' && (
        <button
          className={`fab fab-read ${isSpeaking ? 'speaking' : ''} ${isDragging && dragBtn === 'read' ? 'is-dragging' : ''}`}
          id="readFabBtn"
          title={
            !flipped
              ? mode === 'jp-vi'
                ? 'Đọc từ (Tiếng Nhật)'
                : 'Đọc từ (Tiếng Việt)'
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

            // Quick swipe flick to corner: if total swipe was < 100ms
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
              // Click / Tap -> Read aloud
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

      {/* Simple JSON Modal */}
      {showJsonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,24,39,.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 100,
          }}
          onClick={() => setShowJsonModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #f0f1f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                Dữ liệu JSON (30 từ)
              </span>
              <button
                className="audio-btn"
                onClick={() => setShowJsonModal(false)}
                title="Đóng"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#0f172a' }}>
              <pre style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', margin: 0 }}>
                {JSON.stringify(DATA, null, 2)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid #f0f1f4',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                background: '#fff',
              }}
            >
              <button
                className="chip"
                onClick={handleCopyJson}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã chép' : 'Sao chép JSON'}</span>
              </button>
              <button
                className="chip active"
                onClick={handleDownloadJson}
              >
                <Download className="w-4 h-4" />
                <span>Tải .json</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Floating Han-Viet Bubble that clamps itself strictly inside the screen viewport.
 * If the bubble would overflow either edge, it translates laterally,
 * while the indicator arrow shifts to continue pointing directly to the center of the target Kanji.
 */
function HanVietBubbleView({
  activeBubble,
  winSize,
}: {
  activeBubble: {
    kanji: string;
    hanViet: string;
    meaning?: string;
    rect: DOMRect;
    element: HTMLElement;
    isFlipped: boolean;
  };
  winSize: { w: number; h: number };
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ bubbleLeft: number; arrowOffset: number }>({
    bubbleLeft: activeBubble.rect.left + activeBubble.rect.width / 2,
    arrowOffset: 0,
  });

  useLayoutEffect(() => {
    const el = bubbleRef.current;
    if (!el) return;
    const width = el.offsetWidth || 180;
    const kanjiCenterX = activeBubble.rect.left + activeBubble.rect.width / 2;
    const margin = 12; // Viewport safety margin

    // The bubble's ideal center is kanjiCenterX
    const halfWidth = width / 2;
    let clampedCenterX = kanjiCenterX;

    // Check left & right screen boundaries
    if (clampedCenterX - halfWidth < margin) {
      clampedCenterX = margin + halfWidth;
    } else if (clampedCenterX + halfWidth > winSize.w - margin) {
      clampedCenterX = winSize.w - margin - halfWidth;
    }

    // Shift arrow by the difference between the actual kanji center and the clamped bubble center
    // Clamped so the arrow doesn't slide past the rounded corners of the bubble
    const maxArrowShift = Math.max(0, halfWidth - 20);
    const arrowShift = Math.max(-maxArrowShift, Math.min(maxArrowShift, kanjiCenterX - clampedCenterX));

    setOffset({
      bubbleLeft: clampedCenterX,
      arrowOffset: arrowShift,
    });
  }, [activeBubble, winSize.w]);

  return (
    <div
      ref={bubbleRef}
      className="hanviet-bubble"
      style={{
        position: 'fixed',
        left: `${offset.bubbleLeft}px`,
        transform: 'translate(-50%, 0)',
        ...(activeBubble.isFlipped
          ? {
              top: `${activeBubble.rect.bottom + 8}px`,
            }
          : {
              bottom: `${winSize.h - activeBubble.rect.top + 8}px`,
            }),
      }}
    >
      {activeBubble.isFlipped && (
        <div
          className="bubble-arrow arrow-up"
          style={{ transform: `translateX(${offset.arrowOffset}px)` }}
        />
      )}
      <div className="bubble-content">
        <span className="bubble-hv">{activeBubble.hanViet}</span>
        <span className="bubble-sub">{activeBubble.kanji}</span>
        {activeBubble.meaning && (
          <div className="bubble-meaning">
            {activeBubble.meaning}
          </div>
        )}
      </div>
      {!activeBubble.isFlipped && (
        <div
          className="bubble-arrow arrow-down"
          style={{ transform: `translateX(${offset.arrowOffset}px)` }}
        />
      )}
    </div>
  );
}
