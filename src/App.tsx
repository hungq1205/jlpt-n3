import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { Volume2, Search, RotateCw, RefreshCw, ChevronLeft, ChevronRight, Menu, Settings, ArrowLeft, BookOpen, Layers, List, Sliders, GraduationCap, Moon } from 'lucide-react';
import { LESSONS, Lesson, Flashcard, FlashcardType } from './data/flashcards';
import { speakJapanese, speakVietnamese } from './utils/speech';
import { getHanViet, getKanjiMeaning } from './data/hanVietDict';
import { getSnapCoords, findNearestSnapPosition, findSnapPositionWithinRange, getSwipeCorner, SnapPosition, Point, SNAP_RANGE } from './utils/snapLayout';
import { GrammarView } from './components/GrammarView';
import { ALL_LESSON_GRAMMAR } from './data/grammarData';

export type FrontFaceOption = 'kanji' | 'kana' | 'hanviet' | 'meaning' | 'audio-jp' | 'audio-vn';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'flashcard' | 'list' | 'grammar' | 'lessons' | 'settings'>('flashcard');
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
  const [autoNextEnabled, setAutoNextEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kanji_auto_next');
    return saved !== null ? saved === 'true' : false;
  });
  const [autoNextInterval, setAutoNextInterval] = useState<number>(() => {
    const saved = localStorage.getItem('kanji_auto_next_interval');
    const parsed = saved !== null ? parseFloat(saved) : 3;
    return !Number.isNaN(parsed) && parsed >= 1 ? parsed : 3;
  });
  const [autoNextIntervalInput, setAutoNextIntervalInput] = useState<string>(() => autoNextInterval.toString());
  const [autoNextFlipDuration, setAutoNextFlipDuration] = useState<number>(() => {
    const saved = localStorage.getItem('kanji_auto_next_flip_interval');
    const parsed = saved !== null ? parseFloat(saved) : 0;
    return !Number.isNaN(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [autoNextFlipInput, setAutoNextFlipInput] = useState<string>(() => autoNextFlipDuration.toString());
  const [hanVietSensitivity, setHanVietSensitivity] = useState<number>(() => {
    const saved = localStorage.getItem('kanji_hv_sensitivity');
    return saved !== null ? parseInt(saved, 10) : 70;
  });
  const [fabTransparency, setFabTransparency] = useState<number>(() => {
    const saved = localStorage.getItem('kanji_fab_transparency');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [nightMode, setNightMode] = useState<boolean>(() => {
    return localStorage.getItem('kanji_night_mode') === 'true';
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
    localStorage.setItem('kanji_auto_next', autoNextEnabled.toString());
  }, [autoNextEnabled]);

  useEffect(() => {
    localStorage.setItem('kanji_auto_next_interval', autoNextInterval.toString());
  }, [autoNextInterval]);

  useEffect(() => {
    localStorage.setItem('kanji_auto_next_flip_interval', autoNextFlipDuration.toString());
  }, [autoNextFlipDuration]);

  useEffect(() => {
    localStorage.setItem('kanji_hv_sensitivity', hanVietSensitivity.toString());
  }, [hanVietSensitivity]);

  useEffect(() => {
    localStorage.setItem('kanji_fab_transparency', fabTransparency.toString());
  }, [fabTransparency]);

  useEffect(() => {
    localStorage.setItem('kanji_night_mode', nightMode.toString());
    document.documentElement.classList.toggle('night-theme', nightMode);
    document.body.classList.toggle('night-theme', nightMode);
  }, [nightMode]);

  const restingFabOpacity = Math.max(0.08, (100 - fabTransparency) / 100);

  // Card deck order & position
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [isAutoFlipped, setIsAutoFlipped] = useState<boolean>(false);
  const [mode, setMode] = useState<'jp-vi' | 'vi-jp'>('jp-vi');
  const [showKana, setShowKana] = useState<boolean>(false);
  const [isFabPressed, setIsFabPressed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [interactionTick, setInteractionTick] = useState<number>(0);
  const activePointersRef = useRef<Set<number>>(new Set());
  const isTouchActiveRef = useRef<boolean>(false);
  const lastInteractionBumpRef = useRef<number>(0);

  const notifyInteraction = useCallback((throttleMs = 0) => {
    const now = Date.now();
    if (throttleMs > 0 && now - lastInteractionBumpRef.current < throttleMs) {
      return;
    }
    lastInteractionBumpRef.current = now;
    setInteractionTick((t) => t + 1);
  }, []);

  // When lesson changes, reset order and position
  useEffect(() => {
    setOrder(cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
    setIsAutoFlipped(false);
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
    if (isHanVietMode || Date.now() < suppressClickUntilRef.current) return;
    setIsAutoFlipped(false);
    setFlipped((prev) => !prev);
  }, [isHanVietMode]);

  const handleNext = useCallback(() => {
    setIsAutoFlipped(false);
    setFlipped(false);
    setPos((prev) => (prev + 1) % order.length);
  }, [order.length]);

  const handlePrev = useCallback(() => {
    setIsAutoFlipped(false);
    setFlipped(false);
    setPos((prev) => (prev - 1 + order.length) % order.length);
  }, [order.length]);

  const handleShuffle = useCallback(() => {
    setIsAutoFlipped(false);
    setFlipped(false);
    setOrder((prev) => [...prev].sort(() => Math.random() - 0.5));
    setPos(0);
  }, []);

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'jp-vi' ? 'vi-jp' : 'jp-vi'));
    setIsAutoFlipped(false);
    setFlipped(false);
  }, []);

  // Helper to read card according to selected frontFaceOption
  const readCurrentCardFront = useCallback(() => {
    if (!currentCard) return;

    switch (frontFaceOption) {
      case 'meaning':
      case 'audio-vn':
        speakVietnamese(currentCard.viet, 0.95, audioVolume);
        break;

      case 'hanviet':
        speakVietnamese(currentCard.hanViet, 0.95, audioVolume);
        break;

      case 'kana':
        if (currentCard.type === 'kanji') {
          // If that's on kun then read those out
          const onKun = [currentCard.onyomi, currentCard.kunyomi].filter(Boolean).join('、 ') || currentCard.kana;
          speakJapanese(onKun, 0.9, audioVolume);
        } else {
          speakJapanese(currentCard.kana, 0.9, audioVolume);
        }
        break;

      case 'kanji':
      case 'audio-jp':
      default:
        speakJapanese(currentCard.kanji, 0.9, audioVolume);
        break;
    }
  }, [currentCard, frontFaceOption, audioVolume]);

  // Auto-read on card change
  const isFirstMountRef = useRef<boolean>(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (!autoReadEnabled || activeView !== 'flashcard' || !currentCard) return;

    const timer = setTimeout(() => {
      readCurrentCardFront();
    }, 180);

    return () => clearTimeout(timer);
  }, [pos, selectedLessonId, autoReadEnabled, activeView, currentCard, readCurrentCardFront]);

  // Pause auto-flip/auto-next while user holds down and reset timer on any flashcard interaction
  useEffect(() => {
    if (activeView !== 'flashcard') {
      activePointersRef.current.clear();
      isTouchActiveRef.current = false;
      setIsHolding(false);
      return;
    }

    const syncHolding = () => {
      setIsHolding(activePointersRef.current.size > 0 || isTouchActiveRef.current);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        activePointersRef.current.add(e.pointerId);
      }
      syncHolding();
      notifyInteraction();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.buttons === 0 && activePointersRef.current.size > 0) {
        activePointersRef.current.clear();
        syncHolding();
      }
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        activePointersRef.current.delete(e.pointerId);
      }
      syncHolding();
      notifyInteraction();
    };

    const handleTouchStart = (e: TouchEvent) => {
      isTouchActiveRef.current = e.touches.length > 0;
      syncHolding();
      notifyInteraction();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isTouchActiveRef.current = e.touches.length > 0;
      syncHolding();
      notifyInteraction();
    };

    const handleWheel = () => {
      notifyInteraction(150);
    };

    const handleKeyDown = () => {
      notifyInteraction();
    };

    const handleClearHold = () => {
      activePointersRef.current.clear();
      isTouchActiveRef.current = false;
      setIsHolding(false);
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerEnd, true);
    window.addEventListener('pointercancel', handlePointerEnd, true);
    window.addEventListener('touchstart', handleTouchStart, true);
    window.addEventListener('touchend', handleTouchEnd, true);
    window.addEventListener('touchcancel', handleTouchEnd, true);
    window.addEventListener('wheel', handleWheel, { capture: true, passive: true });
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleClearHold);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerEnd, true);
      window.removeEventListener('pointercancel', handlePointerEnd, true);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchend', handleTouchEnd, true);
      window.removeEventListener('touchcancel', handleTouchEnd, true);
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleClearHold);
    };
  }, [activeView, notifyInteraction]);

  // Auto-next & auto-flip flashcard timer
  useEffect(() => {
    if (
      !autoNextEnabled ||
      activeView !== 'flashcard' ||
      isHanVietMode ||
      isDragging ||
      dragBtn !== null ||
      isHolding ||
      showKana ||
      order.length <= 1
    ) {
      return;
    }

    if (autoNextFlipDuration > 0) {
      if (!flipped) {
        const frontDelayMs = Math.max(1000, Math.round(autoNextInterval * 1000));
        const timer = window.setTimeout(() => {
          setIsAutoFlipped(true);
          setFlipped(true);
        }, frontDelayMs);
        return () => window.clearTimeout(timer);
      }

      const backDelayMs = Math.max(1000, Math.round(autoNextFlipDuration * 1000));
      const timer = window.setTimeout(() => {
        handleNext();
      }, backDelayMs);
      return () => window.clearTimeout(timer);
    }

    const delayMs = Math.max(1000, Math.round(autoNextInterval * 1000));
    const timer = window.setTimeout(() => {
      handleNext();
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    autoNextEnabled,
    autoNextInterval,
    autoNextFlipDuration,
    activeView,
    isHanVietMode,
    isDragging,
    dragBtn,
    isHolding,
    showKana,
    interactionTick,
    pos,
    flipped,
    selectedLessonId,
    order.length,
    handleNext,
  ]);

  useEffect(() => {
    if (!flipped || !autoNextEnabled || autoNextFlipDuration <= 0 || activeView !== 'flashcard') {
      setIsAutoFlipped(false);
    }
  }, [flipped, autoNextEnabled, autoNextFlipDuration, activeView]);

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
  // - If front face: reads whatever selected
  // - If back face: reads sentence (Japanese)
  const handleReadClick = useCallback(() => {
    if (activeView !== 'flashcard' || !currentCard) return;

    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 900);

    if (!flipped) {
      readCurrentCardFront();
    } else {
      speakJapanese(currentCard.example, 0.9, audioVolume);
    }
  }, [activeView, currentCard, flipped, readCurrentCardFront, audioVolume]);

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
  const findNearestKanji = useCallback((x: number, y: number, maxDist = hanVietSensitivity) => {
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
  }, [flipped, hanVietSensitivity]);

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
      e.stopImmediatePropagation?.();

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

      const found = findNearestKanji(clientX, clientY, hanVietSensitivity);
      if (found) {
        setActiveBubble(found);
      } else {
        suppressClickUntilRef.current = Date.now() + 350;
        setIsHanVietMode(false);
        setActiveBubble(null);
      }
    };

    const handleInterceptClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('.fab') || target.closest('.topbar') || target.closest('.controls-dock') || target.closest('.controls'))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('click', handleInterceptClick, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('click', handleInterceptClick, true);
    };
  }, [isHanVietMode, findNearestKanji, hanVietSensitivity]);

  const isPcView = winSize.w >= 768;
  const fabSize = winSize.w >= 640 ? 54 : 50;
  const fabHalf = fabSize / 2;

  // Compute resting coordinates for FABs (fixed side column on PC, corner-snapped on mobile across all pages)
  const snapCoords = useMemo(() => {
    if (isPcView) {
      const contentW = Math.min(580, Math.max(280, winSize.w - 168));
      const contentRight = (winSize.w + contentW) / 2;
      const x = Math.min(winSize.w - fabSize - 16, contentRight + 16);
      const btnGap = 14;
      const totalStackH = 3 * fabSize + 2 * btnGap;
      const startY = Math.max(62, (winSize.h - totalStackH) / 2);

      return {
        kana: { x, y: startY },
        hanViet: { x, y: startY + fabSize + btnGap },
        read: { x, y: startY + 2 * (fabSize + btnGap) },
      };
    }

    return getSnapCoords(
      snapKana,
      snapHanViet,
      snapRead,
      winSize.w,
      winSize.h,
      fabSize
    );
  }, [isPcView, fabSize, snapKana, snapHanViet, snapRead, winSize.w, winSize.h]);

  // Compute predicted release snap destination while dragging (mobile only)
  const targetSnapCoords = useMemo(() => {
    if (isPcView || !isDragging || !dragBtn || !dragPos) return null;
    const currentCenterX = dragPos.x + fabHalf;
    const currentCenterY = dragPos.y + fabHalf;
    const matchedSnap = findSnapPositionWithinRange(
      currentCenterX,
      currentCenterY,
      winSize.w,
      winSize.h,
      dragBtn,
      {
        kana: snapKana,
        hanViet: snapHanViet,
        read: snapRead,
      }
    );
    if (!matchedSnap) return null;
    const coords = getSnapCoords(
      dragBtn === 'kana' ? matchedSnap : snapKana,
      dragBtn === 'hanviet' ? matchedSnap : snapHanViet,
      dragBtn === 'read' ? matchedSnap : snapRead,
      winSize.w,
      winSize.h,
      fabSize
    );
    const targetPt = dragBtn === 'kana' ? coords.kana : dragBtn === 'hanviet' ? coords.hanViet : coords.read;
    if (!targetPt) return null;
    return { x: targetPt.x + fabHalf, y: targetPt.y + fabHalf };
  }, [isPcView, isDragging, dragBtn, dragPos, fabHalf, fabSize, snapKana, snapHanViet, snapRead, winSize.w, winSize.h]);

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
            <span className="front-hanviet-text">
              {currentCard.hanViet}
            </span>
          </div>
        );

      case 'meaning':
        return (
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <span className="front-meaning-text">
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
      <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', position: 'relative' }}>
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

        {/* Center: Tabs (Cards / List / Grammar) */}
        <div className="chip-group" style={{ margin: '0 auto' }}>
          <button
            className={`chip ${activeView === 'flashcard' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('flashcard');
              setIsHanVietMode(false);
              setActiveBubble(null);
            }}
            title="Flashcards"
            style={{ padding: '0 10px', height: '34px' }}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            className={`chip ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('list');
              setIsHanVietMode(false);
              setActiveBubble(null);
            }}
            title="Word List"
            style={{ padding: '0 10px', height: '34px' }}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            className={`chip ${activeView === 'grammar' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('grammar');
              setIsHanVietMode(false);
              setActiveBubble(null);
            }}
            title="Grammar & Quiz"
            style={{ padding: '0 10px', height: '34px' }}
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Counter & Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="counter" id="counter">
            {activeView === 'list'
              ? `${filteredList.length}`
              : activeView === 'grammar'
              ? 'Grammar'
              : `${pos + 1} / ${order.length}`}
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
              </section>

              {/* Back Face (Reveals all other information) */}
              <section
                className={`face back ${isAutoFlipped && flipped ? 'show-kana' : ''}`}
                id="back"
                onScroll={() => notifyInteraction(150)}
              >
                <div className="label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        className="jp-word-container back-kanji-hero"
                        data-kanji-target="true"
                        data-kanji={currentCard.kanji}
                        data-kana={currentCard.onyomi || currentCard.kana}
                        data-hanviet={currentCard.hanViet}
                        data-meaning={currentCard.viet}
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

                    {/* Related vocabulary list (3x3 grid, click on div reads out) */}
                    {currentCard.vocabList && currentCard.vocabList.length > 0 && (
                      <div className="kanji-vocab-section">
                        <div className="section-title">Related Vocab ({currentCard.vocabList.length})</div>
                        <div className="kanji-vocab-grid">
                          {currentCard.vocabList.map((item, idx) => (
                            <div
                              key={idx}
                              className="kanji-vocab-chip"
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(e, item.kanji);
                              }}
                              title={`Play ${item.kanji}`}
                            >
                              <ruby
                                className="vocab-kanji jp-word-container"
                                data-kanji-target="true"
                                data-kanji={item.kanji}
                                data-kana={item.kana}
                                data-hanviet={item.hanViet}
                                data-meaning={item.meaning}
                                style={{ cursor: isHanVietMode ? 'crosshair' : 'pointer' }}
                              >
                                <span className="kanji-text">{item.kanji}</span>
                                <rt className="ruby-text">{item.kana}</rt>
                              </ruby>
                            </div>
                          ))}
                        </div>
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
                className="list-search-input"
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
                className="list-word-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <ruby
                      className="jp-word-container list-word-kanji"
                      data-kanji-target="true"
                      data-kanji={w.kanji}
                      data-kana={w.type === 'kanji' ? w.onyomi || w.kana : w.kana}
                      data-hanviet={w.hanViet}
                      data-meaning={w.viet}
                      style={{
                        fontSize: w.type === 'kanji' ? '22px' : '18px',
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
                  <div className="list-onkun-box">
                    <span><strong>On:</strong> {w.onyomi || '—'}</span>
                    <span><strong>Kun:</strong> {w.kunyomi || '—'}</span>
                  </div>
                )}

                <div className="list-word-meaning">
                  {w.viet}
                </div>

                <div className="list-example-box">
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
                  <div className="list-example-vi">{w.exampleViet}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* VIEW 3: Grammar & Practice Quiz Screen */}
      {activeView === 'grammar' && (
        <GrammarView
          lessonId={selectedLessonId}
          isHanVietMode={isHanVietMode}
          audioVolume={audioVolume}
          onSpeak={(text, isVn) => {
            if (isVn) {
              speakVietnamese(text, 0.95, audioVolume);
            } else {
              speakJapanese(text, 0.9, audioVolume);
            }
          }}
        />
      )}

      {/* VIEW 4: Lesson Selection Screen (no redundant titles or back button, just cards) */}
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
                      {kanjiCount} Kanji • {vocabCount} Vocab • {ALL_LESSON_GRAMMAR[lesson.id]?.items.length || 0} Grammar
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
          {/* Night Theme Toggle */}
          <div className="setting-section">
            <div className="setting-row">
              <div className="setting-title">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Night theme</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={nightMode}
                  onChange={(e) => setNightMode(e.target.checked)}
                />
                <span className="setting-toggle-slider"></span>
              </label>
            </div>
          </div>

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
          </div>

          {/* Section 4: Auto Next Flashcard */}
          <div className="setting-section">
            <div className="setting-row">
              <div className="setting-title">
                <span>Auto next flashcard</span>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={autoNextEnabled}
                  onChange={(e) => setAutoNextEnabled(e.target.checked)}
                />
                <span className="setting-toggle-slider"></span>
              </label>
            </div>
            <div className="setting-row" style={{ opacity: autoNextEnabled ? 1 : 0.65 }}>
              <label htmlFor="autoNextIntervalInput" className="setting-desc" style={{ marginTop: 0 }}>
                {autoNextFlipDuration > 0 ? 'Delay before flip (n)' : 'Delay before next card (n)'}
              </label>
              <div className="setting-number-group">
                <input
                  id="autoNextIntervalInput"
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={autoNextIntervalInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setAutoNextIntervalInput(raw);
                    const val = parseFloat(raw);
                    if (!Number.isNaN(val) && val >= 1) {
                      setAutoNextInterval(Math.min(120, val));
                    }
                  }}
                  onBlur={() => {
                    const val = parseFloat(autoNextIntervalInput);
                    const normalized = !Number.isNaN(val) && val >= 1 ? Math.min(120, val) : 3;
                    setAutoNextInterval(normalized);
                    setAutoNextIntervalInput(normalized.toString());
                  }}
                  className="setting-number-input"
                />
                <span className="setting-unit-label">s</span>
              </div>
            </div>
            <div className="setting-row" style={{ opacity: autoNextEnabled ? 1 : 0.65 }}>
              <label htmlFor="autoNextFlipInput" className="setting-desc" style={{ marginTop: 0 }}>
                Stay on back after flip (m, 0 = no flip)
              </label>
              <div className="setting-number-group">
                <input
                  id="autoNextFlipInput"
                  type="number"
                  min={0}
                  max={120}
                  step={1}
                  value={autoNextFlipInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setAutoNextFlipInput(raw);
                    const val = parseFloat(raw);
                    if (!Number.isNaN(val) && val >= 0) {
                      setAutoNextFlipDuration(Math.min(120, val));
                    }
                  }}
                  onBlur={() => {
                    const val = parseFloat(autoNextFlipInput);
                    const normalized = !Number.isNaN(val) && val >= 0 ? Math.min(120, val) : 0;
                    setAutoNextFlipDuration(normalized);
                    setAutoNextFlipInput(normalized.toString());
                  }}
                  className="setting-number-input"
                />
                <span className="setting-unit-label">s</span>
              </div>
            </div>
          </div>

          {/* Section 4: Han-Viet Reveal Sensitivity Slider */}
          <div className="setting-section">
            <div className="setting-title">
              <span>Han-Viet sensitivity</span>
            </div>
            <div className="volume-slider-row">
              <input
                type="range"
                min="30"
                max="160"
                step="5"
                value={hanVietSensitivity}
                onChange={(e) => setHanVietSensitivity(parseInt(e.target.value, 10))}
                className="volume-slider"
              />
              <span className="volume-val-badge">{hanVietSensitivity}px</span>
            </div>
          </div>

          {/* Section 5: Floating Buttons Transparency Slider */}
          <div className="setting-section">
            <div className="setting-title">
              <span>Floating button transparency</span>
            </div>
            <div className="volume-slider-row">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={fabTransparency}
                onChange={(e) => setFabTransparency(parseInt(e.target.value, 10))}
                className="volume-slider"
              />
              <span className="volume-val-badge">{fabTransparency}%</span>
            </div>
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
        title={isPcView ? 'Kana: Giữ để hiển thị' : 'Kana: Giữ để hiển thị / Kéo để chuyển vị trí'}
        style={{
          left: `${dragBtn === 'kana' && dragPos ? dragPos.x : snapCoords.kana.x}px`,
          top: `${dragBtn === 'kana' && dragPos ? dragPos.y : snapCoords.kana.y}px`,
          opacity: restingFabOpacity,
          cursor: isPcView ? 'pointer' : undefined,
          transition: dragBtn === 'kana' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (err) {}
          const now = performance.now();
          dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
          pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
          setDragOrigin({ x: snapCoords.kana.x + fabHalf, y: snapCoords.kana.y + fabHalf });
          setDragBtn('kana');
          setIsDragging(false);
          startReveal();
        }}
        onPointerMove={(e) => {
          if (dragBtn !== 'kana' || isPcView) return;
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
          setDragPos({ x: e.clientX - fabHalf, y: e.clientY - fabHalf });
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}
          stopReveal();

          if (!isPcView) {
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
                { kana: snapKana, hanViet: snapHanViet, read: snapRead },
                SNAP_RANGE
              );
              if (newSnap) {
                setSnapKana(newSnap);
              }
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
        title={isPcView ? 'Hán-Việt: Chạm để bật chế độ tra từ / Kéo để soi từ' : 'Hán-Việt: Chạm để bật chế độ tra từ / Kéo để chuyển vị trí'}
        style={{
          left: `${dragBtn === 'hanviet' && dragPos ? dragPos.x : snapCoords.hanViet.x}px`,
          top: `${dragBtn === 'hanviet' && dragPos ? dragPos.y : snapCoords.hanViet.y}px`,
          opacity: restingFabOpacity,
          cursor: isPcView ? 'pointer' : undefined,
          transition: dragBtn === 'hanviet' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (err) {}
          const now = performance.now();
          dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
          pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
          setDragOrigin({ x: snapCoords.hanViet.x + fabHalf, y: snapCoords.hanViet.y + fabHalf });
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

          if (!isPcView && dist > 70) {
            setIsProjecting(false);
            setProjPoint(null);
            setActiveBubble(null);
            setDragPos({ x: e.clientX - fabHalf, y: e.clientY - fabHalf });
          } else {
            const clampedDx = isPcView && dist > 68 ? (dx / dist) * 68 : dx;
            const clampedDy = isPcView && dist > 68 ? (dy / dist) * 68 : dy;
            setDragPos({
              x: (isPcView ? snapCoords.hanViet.x + clampedDx : e.clientX - fabHalf),
              y: (isPcView ? snapCoords.hanViet.y + clampedDy : e.clientY - fabHalf),
            });
            setIsProjecting(true);

            const factor = Math.max(winSize.w, winSize.h) / 38;
            const targetX = Math.max(20, Math.min(winSize.w - 20, (snapCoords.hanViet.x + fabHalf) + clampedDx * factor));
            const targetY = Math.max(30, Math.min(winSize.h - 30, (snapCoords.hanViet.y + fabHalf) + clampedDy * factor));
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

          if (isPcView) {
            if (dragStartRef.current.moved) {
              setActiveBubble(null);
            } else {
              setIsHanVietMode((prev) => !prev);
              setActiveBubble(null);
            }
          } else {
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
                { kana: snapKana, hanViet: snapHanViet, read: snapRead },
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
            opacity: restingFabOpacity,
            cursor: isPcView ? 'pointer' : undefined,
            transition: dragBtn === 'read' ? 'none' : 'left 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease',
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch (err) {}
            const now = performance.now();
            dragStartRef.current = { x: e.clientX, y: e.clientY, time: now, moved: false, swipeStartTime: 0 };
            pointerHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: now }];
            setDragOrigin({ x: snapCoords.read.x + fabHalf, y: snapCoords.read.y + fabHalf });
            setDragBtn('read');
            setIsDragging(false);
          }}
          onPointerMove={(e) => {
            if (dragBtn !== 'read' || isPcView) return;
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
            setDragPos({ x: e.clientX - fabHalf, y: e.clientY - fabHalf });
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch (err) {}

            if (isPcView) {
              handleReadClick();
            } else {
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
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleLayout, setBubbleLayout] = useState<{
    cardX: number;
    arrowX: number;
    y: number;
    isFlipped: boolean;
  }>(() => {
    const el = activeBubble.element;
    const r = el ? el.getBoundingClientRect() : activeBubble.rect;
    const centerX = r.left + r.width / 2;
    const isFlipped = r.top < 110;
    const y = isFlipped ? r.bottom + 8 : r.top - 8;
    return {
      cardX: Math.max(12, Math.min(winSize.w - 180, centerX - 80)),
      arrowX: 80,
      y,
      isFlipped,
    };
  });

  useLayoutEffect(() => {
    const el = activeBubble.element;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const targetCenterX = r.left + r.width / 2;
    const isFlipped = r.top < 110;
    const y = isFlipped ? r.bottom + 8 : r.top - 8;

    const bubbleEl = bubbleRef.current;
    const width = bubbleEl ? bubbleEl.offsetWidth : 160;

    const margin = 12;
    const minX = margin;
    const maxX = Math.max(minX, winSize.w - width - margin);
    const idealX = targetCenterX - width / 2;
    const cardX = Math.max(minX, Math.min(maxX, idealX));

    // Calculate position of arrow relative to card
    const arrowOffset = targetCenterX - cardX;
    const clampedArrowX = Math.max(16, Math.min(width - 16, arrowOffset));

    setBubbleLayout({
      cardX,
      arrowX: clampedArrowX,
      y,
      isFlipped,
    });
  }, [activeBubble, winSize.w]);

  return (
    <div
      ref={bubbleRef}
      className={`hanviet-bubble ${bubbleLayout.isFlipped ? 'bubble-flipped' : ''}`}
      style={{
        left: `${bubbleLayout.cardX}px`,
        top: `${bubbleLayout.y}px`,
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
        className={`bubble-arrow ${bubbleLayout.isFlipped ? 'arrow-up' : 'arrow-down'}`}
        style={{
          left: `${bubbleLayout.arrowX}px`,
        }}
      />
    </div>
  );
}
