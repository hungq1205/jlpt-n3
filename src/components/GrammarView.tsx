import React, { useState, useMemo } from 'react';
import { Volume2, CheckCircle2, XCircle, RotateCcw, BookOpen, HelpCircle } from 'lucide-react';
import { ALL_LESSON_GRAMMAR, LessonGrammar, GrammarItem, GrammarQuizQuestion } from '../data/grammarData';
import { getHanViet, getKanjiMeaning } from '../data/hanVietDict';

interface GrammarViewProps {
  lessonId: string;
  isHanVietMode: boolean;
  audioVolume: number;
  onSpeak: (text: string, isVn?: boolean) => void;
}

export const GrammarView: React.FC<GrammarViewProps> = ({
  lessonId,
  isHanVietMode,
  audioVolume,
  onSpeak,
}) => {
  const [subTab, setSubTab] = useState<'theory' | 'quiz'>('theory');

  // Load grammar data for current lesson
  const grammarData: LessonGrammar = useMemo(() => {
    return ALL_LESSON_GRAMMAR[lessonId] || ALL_LESSON_GRAMMAR['lesson-1'];
  }, [lessonId]);

  // Quiz states
  const [quizDirectionFilter, setQuizDirectionFilter] = useState<'all' | 'jp-to-vi' | 'vi-to-jp'>('all');
  const [quizQuestions, setQuizQuestions] = useState<GrammarQuizQuestion[]>(() => {
    return [...(ALL_LESSON_GRAMMAR[lessonId] || ALL_LESSON_GRAMMAR['lesson-1']).quiz];
  });
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // State to track which words have their Kana revealed on click
  const [revealedWords, setRevealedWords] = useState<Record<string, boolean>>({});

  const toggleWordKana = (key: string) => {
    if (isHanVietMode) return;
    setRevealedWords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // When lesson changes, reset quiz
  React.useEffect(() => {
    const list = [...(ALL_LESSON_GRAMMAR[lessonId] || ALL_LESSON_GRAMMAR['lesson-1']).quiz];
    setQuizQuestions(list);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizCompleted(false);
    setRevealedWords({});
  }, [lessonId]);

  // Filtered quiz questions
  const filteredQuizQuestions = useMemo(() => {
    if (quizDirectionFilter === 'all') return quizQuestions;
    return quizQuestions.filter((q) => q.direction === quizDirectionFilter);
  }, [quizQuestions, quizDirectionFilter]);

  const currentQuestion: GrammarQuizQuestion | undefined = filteredQuizQuestions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (isHanVietMode || selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);
    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < filteredQuizQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...(ALL_LESSON_GRAMMAR[lessonId] || ALL_LESSON_GRAMMAR['lesson-1']).quiz].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizCompleted(false);
  };

  // Helper to render Japanese sentences breaking down Kanji compounds with ruby and Kana
  const renderRubyTokens = (
    rubyStr?: string,
    plainStr?: string,
    highlightStr?: string,
    contextId?: string
  ) => {
    const source = rubyStr || plainStr || '';
    if (!source) return null;

    // Pattern to match Kanji followed by [reading]
    // e.g. 日本語[にほんご], 上手[じょうず], 会社[かいしゃ], 働[はたら]
    const rubyRegex = /([\u4e00-\u9faf\u3400-\u4dbf々〆ヵヶ]+)\[(.*?)\]/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushTextSegment = (txt: string, key: string) => {
      if (!txt) return;
      if (highlightStr && highlightStr.includes(txt)) {
        nodes.push(
          <strong key={key} className="grammar-highlight-text">
            {txt}
          </strong>
        );
      } else {
        nodes.push(<span key={key}>{txt}</span>);
      }
    };

    const pushPlainTokens = (text: string, prefix: string) => {
      const looseKanjiRegex = /([\u4e00-\u9faf\u3400-\u4dbf々〆ヵヶ]+)/g;
      let lastK = 0;
      let km: RegExpExecArray | null;

      while ((km = looseKanjiRegex.exec(text)) !== null) {
        if (km.index > lastK) {
          const plainPart = text.substring(lastK, km.index);
          pushTextSegment(plainPart, `${prefix}-txt-${lastK}`);
        }
        const kj = km[1];
        const isHighlight = highlightStr && highlightStr.includes(kj);
        const tokenKey = `${contextId || 'loose'}-${km.index}-${kj}`;
        const isRevealed = Boolean(revealedWords[tokenKey]);

        nodes.push(
          <span
            key={`${prefix}-kj-${km.index}`}
            className={`jp-word-container ${isHighlight ? 'grammar-highlight-text' : ''} ${isRevealed ? 'kana-revealed' : ''}`}
            data-kanji-target="true"
            data-kanji={kj}
            data-hanviet={getHanViet(kj)}
            data-meaning={getKanjiMeaning(kj)}
            onClick={(e) => {
              e.stopPropagation();
              toggleWordKana(tokenKey);
            }}
            style={{ cursor: isHanVietMode ? 'crosshair' : 'pointer' }}
            title={isRevealed ? 'Nhấp để ẩn Kana' : 'Nhấp để hiện Kana'}
          >
            <span className="kanji-text">{kj}</span>
          </span>
        );
        lastK = looseKanjiRegex.lastIndex;
      }

      if (lastK < text.length) {
        pushTextSegment(text.substring(lastK), `${prefix}-txt-end`);
      }
    };

    while ((match = rubyRegex.exec(source)) !== null) {
      if (match.index > lastIndex) {
        const nonMatch = source.substring(lastIndex, match.index);
        pushPlainTokens(nonMatch, `seg-${lastIndex}`);
      }

      const kanjiText = match[1];
      const kanaText = match[2];
      const matchIdx = match.index;
      const isHighlighted = highlightStr && highlightStr.includes(kanjiText);
      const tokenKey = `${contextId || 'rb'}-${matchIdx}-${kanjiText}`;
      const isRevealed = Boolean(revealedWords[tokenKey]);

      nodes.push(
        <ruby
          key={`rb-${matchIdx}`}
          className={`jp-word-container ${isHighlighted ? 'grammar-highlight-text' : ''} ${isRevealed ? 'kana-revealed' : ''}`}
          data-kanji-target="true"
          data-kanji={kanjiText}
          data-kana={kanaText}
          data-hanviet={getHanViet(kanjiText)}
          data-meaning={getKanjiMeaning(kanjiText)}
          onClick={(e) => {
            e.stopPropagation();
            toggleWordKana(tokenKey);
          }}
          style={{ cursor: isHanVietMode ? 'crosshair' : 'pointer' }}
          title={isRevealed ? 'Nhấp để ẩn Kana' : 'Nhấp để hiện Kana'}
        >
          <span className="kanji-text">{kanjiText}</span>
          <rt className={`ruby-text ${isRevealed ? 'visible' : ''}`}>{kanaText}</rt>
        </ruby>
      );

      lastIndex = rubyRegex.lastIndex;
    }

    if (lastIndex < source.length) {
      pushPlainTokens(source.substring(lastIndex), `seg-end`);
    }

    return nodes;
  };

  return (
    <div className={`grammar-page-container ${subTab === 'quiz' ? 'quiz-mode' : ''}`}>
      {/* Sub-tab switcher: Icon only (no text) */}
      <div className="grammar-subtabs-dock">
        <button
          type="button"
          className={`grammar-subtab-btn ${subTab === 'theory' ? 'active' : ''}`}
          onClick={() => setSubTab('theory')}
          title="Lý thuyết"
          aria-label="Lý thuyết"
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={`grammar-subtab-btn ${subTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setSubTab('quiz')}
          title="Luyện tập"
          aria-label="Luyện tập"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* ===================== VIEW 1: LÝ THUYẾT (THEORY) ===================== */}
      {subTab === 'theory' && (
        <div className="grammar-theory-view">
          <div className="grammar-cards-list">
            {grammarData.items.map((item: GrammarItem) => (
              <div key={item.id} className="grammar-card">
                {/* Header: Number, Pattern & Meaning */}
                <div className="grammar-card-header">
                  <div className="grammar-title-row">
                    <span className="grammar-num-badge">{item.id}</span>
                    <h2 className="grammar-pattern-title">{item.pattern}</h2>
                  </div>
                  <div className="grammar-meaning-badge">{item.meaning}</div>
                </div>

                {/* Structure / Formula: Clean mobile rows (text "Cấu trúc" removed) */}
                {item.formulas.map((formula, fIdx) => (
                  <div key={fIdx} className="grammar-structure-card">
                    <div className="grammar-formula-list">
                      {formula.stack.map((stk, sIdx) => {
                        const label = formula.labels[sIdx];
                        const fixed = formula.fixed[sIdx] || formula.fixed[0];
                        return (
                          <div key={sIdx} className="grammar-formula-row">
                            {label && (
                              <div className="grammar-case-label">{label}</div>
                            )}
                            <div className="grammar-equation">
                              <span className="equation-pill pill-variant">{stk}</span>
                              <span className="equation-plus">+</span>
                              <span className="equation-pill pill-fixed">{fixed}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Examples (text "Ví dụ" removed) */}
                <div className="grammar-examples-section">
                  <div className="grammar-examples-list">
                    {item.examples.map((ex, eIdx) => (
                      <div key={eIdx} className="grammar-example-bubble">
                        <div className="grammar-example-main">
                          <div className="jp-sentence">
                            {renderRubyTokens(ex.ruby, ex.jp, ex.highlight, `ex-${item.id}-${eIdx}`)}
                          </div>
                          <button
                            type="button"
                            className="grammar-audio-btn"
                            onClick={() => onSpeak(ex.jp, false)}
                            title="Phát âm câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                        </div>
                        <div className="vi-translation">{ex.vi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: LUYỆN TẬP (FIT SCREEN QUIZ) ===================== */}
      {subTab === 'quiz' && (
        <div className="grammar-quiz-view">
          {!quizCompleted && currentQuestion ? (
            <div className="quiz-card-box">
              {/* Top Controls: Question counter, Filters, Score */}
              <div className="quiz-toolbar">
                <div className="quiz-progress-text">
                  <strong>{currentQIndex + 1}</strong>/{filteredQuizQuestions.length}
                </div>

                <div className="quiz-filter-chips">
                  <button
                    type="button"
                    className={`quiz-chip ${quizDirectionFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setQuizDirectionFilter('all');
                      setCurrentQIndex(0);
                      setSelectedOption(null);
                    }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`quiz-chip ${quizDirectionFilter === 'jp-to-vi' ? 'active' : ''}`}
                    onClick={() => {
                      setQuizDirectionFilter('jp-to-vi');
                      setCurrentQIndex(0);
                      setSelectedOption(null);
                    }}
                  >
                    JP→VN
                  </button>
                  <button
                    type="button"
                    className={`quiz-chip ${quizDirectionFilter === 'vi-to-jp' ? 'active' : ''}`}
                    onClick={() => {
                      setQuizDirectionFilter('vi-to-jp');
                      setCurrentQIndex(0);
                      setSelectedOption(null);
                    }}
                  >
                    VN→JP
                  </button>
                </div>

                <div className="quiz-score-badge">
                  ★ {score}
                </div>
              </div>

              {/* Ultra Thin Progress Bar */}
              <div className="quiz-progress-bar-bg">
                <div
                  className="quiz-progress-bar-fill"
                  style={{
                    width: `${((currentQIndex + 1) / filteredQuizQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Card */}
              <div className="quiz-question-card">
                <div className="quiz-question-row">
                  <div className="quiz-question-text">
                    {currentQuestion.direction === 'jp-to-vi' ? (
                      renderRubyTokens(currentQuestion.questionRuby, currentQuestion.question, undefined, `q-${currentQuestion.id}`)
                    ) : (
                      currentQuestion.question
                    )}
                  </div>
                  {currentQuestion.direction === 'jp-to-vi' && (
                    <button
                      type="button"
                      className="grammar-audio-btn"
                      onClick={() => onSpeak(currentQuestion.audioText, false)}
                      title="Nghe câu hỏi"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Clickable Options */}
              <div className="quiz-options-grid">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const showResult = selectedOption !== null;

                  let optionClass = 'quiz-option-btn';
                  if (showResult) {
                    if (isCorrect) {
                      optionClass += ' correct';
                    } else if (isSelected) {
                      optionClass += ' wrong';
                    } else {
                      optionClass += ' dimmed';
                    }
                  }

                  const labels = ['A', 'B', 'C', 'D'];
                  const rubyOption = currentQuestion.optionsRuby ? currentQuestion.optionsRuby[idx] : undefined;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={optionClass}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showResult}
                    >
                      <div className="option-label-badge">{labels[idx]}</div>
                      <div className="option-content-text">
                        {currentQuestion.direction === 'vi-to-jp' ? (
                          renderRubyTokens(rubyOption, option, undefined, `opt-${currentQuestion.id}-${idx}`)
                        ) : (
                          option
                        )}
                      </div>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-1" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Action / Feedback Dock */}
              {selectedOption !== null && (
                <div className="quiz-bottom-dock">
                  <div className="quiz-feedback-box">
                    <div className="quiz-feedback-header">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <span className="feedback-result correct">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                          Chính xác!
                        </span>
                      ) : (
                        <span className="feedback-result wrong">
                          <XCircle className="w-4 h-4 text-rose-600 mr-1" />
                          Chưa đúng
                        </span>
                      )}
                      <button
                        type="button"
                        className="quiz-next-btn"
                        onClick={handleNextQuestion}
                      >
                        {currentQIndex < filteredQuizQuestions.length - 1 ? 'Tiếp →' : 'Kết quả'}
                      </button>
                    </div>
                    <div className="quiz-explanation-text">
                      {currentQuestion.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Screen */
            <div className="quiz-result-card">
              <div className="result-icon-badge">🏆</div>
              <h2>Hoàn thành!</h2>
              <div className="result-score-large">
                {score} / {filteredQuizQuestions.length}
              </div>
              <p className="result-summary">
                {score === filteredQuizQuestions.length
                  ? 'Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi.'
                  : score >= filteredQuizQuestions.length * 0.7
                  ? 'Khá tốt! Bạn đã nắm vững các mẫu ngữ pháp trong bài.'
                  : 'Hãy xem lại phần lý thuyết và làm lại để nhớ tốt hơn nhé!'}
              </p>

              <div className="result-actions">
                <button
                  type="button"
                  className="quiz-restart-btn"
                  onClick={handleRestartQuiz}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Làm lại
                </button>
                <button
                  type="button"
                  className="quiz-view-theory-btn"
                  onClick={() => setSubTab('theory')}
                >
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Lý thuyết
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
