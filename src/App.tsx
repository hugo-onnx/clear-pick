import { useEffect, useMemo, useRef, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { LandingHero } from './components/LandingHero';
import { LanguageToggle } from './components/LanguageToggle';
import { MatrixEditor } from './components/MatrixEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { loadLanguage, saveLanguage, translations } from './i18n';
import type { DecisionMatrix, ScoreMode } from './types';
import {
  clampScoreForMode,
  clampWeight,
  createCategory,
  createCareerMoveMatrix,
  createOption,
  createStarterMatrix,
  DEFAULT_SCORE,
  MAX_OPTIONS,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  getScoreModeForCell,
  synchronizeScores,
} from './utils/matrix';
import { getDecisionSummary } from './utils/scoring';
import { loadActiveDecision, saveActiveDecision } from './utils/storage';

const MATRIX_SAVE_DEBOUNCE_MS = 250;

function App() {
  const [matrix, setMatrix] = useState<DecisionMatrix>(() => loadActiveDecision());
  const [language, setLanguage] = useState(() => loadLanguage());
  const [areResultsHidden, setAreResultsHidden] = useState(false);
  const pendingMatrixRef = useRef(matrix);
  const matrixSaveTimeoutRef = useRef<number | null>(null);
  const copy = translations[language];

  useEffect(() => {
    pendingMatrixRef.current = matrix;

    if (matrixSaveTimeoutRef.current) {
      window.clearTimeout(matrixSaveTimeoutRef.current);
    }

    matrixSaveTimeoutRef.current = window.setTimeout(() => {
      matrixSaveTimeoutRef.current = null;
      saveActiveDecision(pendingMatrixRef.current);
    }, MATRIX_SAVE_DEBOUNCE_MS);

    return () => {
      if (matrixSaveTimeoutRef.current) {
        window.clearTimeout(matrixSaveTimeoutRef.current);
        matrixSaveTimeoutRef.current = null;
      }
    };
  }, [matrix]);

  useEffect(() => {
    const flushPendingMatrixSave = () => {
      if (matrixSaveTimeoutRef.current) {
        window.clearTimeout(matrixSaveTimeoutRef.current);
        matrixSaveTimeoutRef.current = null;
      }

      saveActiveDecision(pendingMatrixRef.current);
    };

    window.addEventListener('pagehide', flushPendingMatrixSave);

    return () => {
      window.removeEventListener('pagehide', flushPendingMatrixSave);
      flushPendingMatrixSave();
    };
  }, []);

  useEffect(() => {
    saveLanguage(language);
    document.documentElement.lang = language;
    document.title = copy.document.title;

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content = copy.document.description;
    }
  }, [copy.document.description, copy.document.title, language]);

  const applyChange = (transform: (current: DecisionMatrix) => DecisionMatrix) => {
    setMatrix((current) => synchronizeScores(transform(current)));
  };

  const handleReset = () => {
    setMatrix(createStarterMatrix());
  };

  const handleLoadExample = () => {
    setMatrix(createCareerMoveMatrix(copy.matrix.careerMoveExample));
    setAreResultsHidden(false);
  };

  const summary = useMemo(() => getDecisionSummary(matrix), [matrix]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-foreground">
      <LanguageToggle
        copy={copy.languageToggle}
        language={language}
        onLanguageChange={setLanguage}
      />
      <LandingHero copy={copy.hero} />

      <section
        aria-label={copy.workspaceLabel}
        className="matrix-theme relative isolate z-10 overflow-hidden bg-background text-foreground"
      >
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-cyan-600/80 via-white/60 to-orange-500/80"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
          <main className="scroll-mt-14 space-y-9 sm:scroll-mt-16" id="decision-matrix">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.72fr)] xl:items-start">
              <MatrixEditor
                areResultsHidden={areResultsHidden}
                copy={copy.matrix}
                matrix={matrix}
                summary={summary}
                onAddOption={(name) =>
                  applyChange((current) => {
                    if (current.options.length >= MAX_OPTIONS) {
                      return current;
                    }

                    return {
                      ...current,
                      options: [
                        ...current.options,
                        createOption(name ?? ''),
                      ],
                    };
                  })
                }
                onRemoveOption={(optionId) =>
                  applyChange((current) => {
                    if (current.options.length <= MIN_OPTIONS) {
                      return current;
                    }

                    return {
                      ...current,
                      options: current.options.filter(
                        (option) => option.id !== optionId,
                      ),
                    };
                  })
                }
                onOptionNameChange={(optionId, name) =>
                  applyChange((current) => ({
                    ...current,
                    options: current.options.map((option) =>
                      option.id === optionId ? { ...option, name } : option,
                    ),
                  }))
                }
                onAddCategory={(name) =>
                  applyChange((current) => ({
                    ...current,
                    categories: [
                      ...current.categories,
                      createCategory(name ?? ''),
                    ],
                  }))
                }
                onRemoveCategory={(categoryId) =>
                  applyChange((current) => {
                    if (current.categories.length <= MIN_CATEGORIES) {
                      return current;
                    }

                    return {
                      ...current,
                      categories: current.categories.filter(
                        (category) => category.id !== categoryId,
                      ),
                    };
                  })
                }
                onCategoryNameChange={(categoryId, name) =>
                  applyChange((current) => ({
                    ...current,
                    categories: current.categories.map((category) =>
                      category.id === categoryId ? { ...category, name } : category,
                    ),
                  }))
                }
                onCategoryWeightChange={(categoryId, weight) =>
                  applyChange((current) => ({
                    ...current,
                    categories: current.categories.map((category) =>
                      category.id === categoryId
                        ? { ...category, weight: clampWeight(weight) }
                        : category,
                    ),
                  }))
                }
                onScoreModeChange={(optionId, categoryId, scoreMode: ScoreMode) =>
                  applyChange((current) => {
                    const optionScores = current.scores[optionId] ?? {};
                    const score = optionScores[categoryId] ?? DEFAULT_SCORE;

                    return {
                      ...current,
                      scoreModes: {
                        ...(current.scoreModes ?? {}),
                        [optionId]: {
                          ...(current.scoreModes?.[optionId] ?? {}),
                          [categoryId]: scoreMode,
                        },
                      },
                      scores: {
                        ...current.scores,
                        [optionId]: {
                          ...optionScores,
                          [categoryId]: clampScoreForMode(score, scoreMode),
                        },
                      },
                    };
                  })
                }
                onScoreChange={(optionId, categoryId, score) =>
                  applyChange((current) => {
                    const scoreMode = getScoreModeForCell(
                      current,
                      optionId,
                      categoryId,
                    );

                    return {
                      ...current,
                      scores: {
                        ...current.scores,
                        [optionId]: {
                          ...current.scores[optionId],
                          [categoryId]: clampScoreForMode(score, scoreMode),
                        },
                      },
                    };
                  })
                }
                onLoadExample={handleLoadExample}
                onResultsHiddenChange={setAreResultsHidden}
              />

              <ResultsPanel
                areResultsHidden={areResultsHidden}
                copy={copy.results}
                matrix={matrix}
                onResultsHiddenChange={setAreResultsHidden}
                summary={summary}
                onReset={handleReset}
              />
            </div>
          </main>

          <AppFooter copy={copy.footer} />
        </div>
      </section>
    </div>
  );
}

export default App;
