import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Volume2, Search, RotateCw, Check, Copy, Download, X } from 'lucide-react';
import { DATA, Flashcard } from './data/flashcards';
import { speakJapanese } from './utils/speech';

export default function App() {
  // Navigation & state
  const [activeTab, setActiveTab] = useState<'flashcard' | 'list' | 'quiz'>('flashcard');
  const [order, setOrder] = useState<number[]>(() => DATA.map((_, i) => i));
  const [pos, setPos] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [mode, setMode] = useState<'jp-vi' | 'vi-jp'>('jp-vi');
  const [showKana, setShowKana] = useState<boolean>(false);
  const [isFabPressed, setIsFabPressed] = useState<boolean>(false);

  // JSON modal
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

  // Render Japanese word with kana overlay
  const renderJapaneseWord = (w: Flashcard, showAudio = true) => {
    const hasKanji = w.kanji && w.kanji !== w.kana;
    return (
      <span className="inline-flex items-center gap-2">
        <span className="jp-word-container">
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
        <ruby key={`rb-${idx++}`}>
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
                  <span>{mode === 'jp-vi' ? '日本語' : 'Tiếng Việt'}</span>
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
                  <span>Đáp án</span>
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
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onClick={() => {
                    if (originalIndex !== -1) setPos(originalIndex);
                    setFlipped(false);
                    setActiveTab('flashcard');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af' }}>
                        #{w.id}
                      </span>
                      {/* Japanese Word with Furigana / Kana reveal on hold */}
                      <span className="jp-word-container" style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
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

                    <span className="hv" style={{ margin: 0, padding: '3px 9px', fontSize: '11px' }}>
                      {w.hanViet}
                    </span>
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

                  {mode === 'jp-vi' && (
                    <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '600', marginTop: '4px' }}>
                      {quizCard.hanViet}
                    </div>
                  )}
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
                          <span className="jp-word-container">
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

      {/* Floating Action Button for Kana (Always accessible across Flashcard, List, and Quiz) */}
      {/* Activates on press/touch, turns off IMMEDIATELY the millisecond tap or mouse is released */}
      <button
        className={`fab ${isFabPressed || showKana ? 'pressed' : ''}`}
        id="kanaHoldBtn"
        title="Giữ để xem Kana"
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          } catch (err) {}
          startReveal();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}
          stopReveal();
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          stopReveal();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        あ
      </button>

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
