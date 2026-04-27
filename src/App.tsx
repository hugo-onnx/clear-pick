import { useEffect, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { LandingHero } from './components/LandingHero';
import { MatrixEditor } from './components/MatrixEditor';
import { ResultsPanel } from './components/ResultsPanel';
import type { DecisionMatrix } from './types';
import {
  clampPercentage,
  createCategory,
  createOption,
  createStarterMatrix,
  MAX_OPTIONS,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  synchronizeScores,
} from './utils/matrix';
import { getDecisionSummary } from './utils/scoring';
import { loadActiveDecision, saveActiveDecision } from './utils/storage';

function App() {
  const [matrix, setMatrix] = useState<DecisionMatrix>(() => loadActiveDecision());

  useEffect(() => {
    saveActiveDecision(matrix);
  }, [matrix]);

  const applyChange = (transform: (current: DecisionMatrix) => DecisionMatrix) => {
    setMatrix((current) => synchronizeScores(transform(current)));
  };

  const handleReset = () => {
    setMatrix(createStarterMatrix());
  };

  const summary = getDecisionSummary(matrix);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-foreground">
      <LandingHero />

      <section
        aria-label="Decision workspace"
        className="matrix-theme relative isolate z-10 -mt-28 overflow-hidden bg-transparent text-foreground sm:-mt-36 lg:-mt-44"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-56 bg-[linear-gradient(180deg,rgba(247,248,243,1),rgba(239,245,247,0.98))] sm:top-72 lg:top-80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(8,145,178,0.18)_28%,rgba(249,115,22,0.1)_48%,rgba(247,248,243,0.76)_78%,rgba(247,248,243,1)_100%)] sm:h-72 lg:h-80" />
        <div className="pointer-events-none absolute inset-x-0 top-20 h-44 bg-[radial-gradient(ellipse_at_top,rgba(103,232,249,0.12)_0%,rgba(255,255,255,0.18)_48%,rgba(255,255,255,0)_78%)] sm:h-56" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-12 pt-44 sm:px-6 sm:pb-14 sm:pt-56 lg:px-8 lg:pb-16 lg:pt-64">
          <main className="scroll-mt-10 space-y-10" id="decision-matrix">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.72fr)] xl:items-start">
              <MatrixEditor
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
                onAddCategory={() =>
                  applyChange((current) => ({
                    ...current,
                    categories: [
                      ...current.categories,
                      createCategory(`Category ${current.categories.length + 1}`),
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
                        ? { ...category, weight: clampPercentage(weight) }
                        : category,
                    ),
                  }))
                }
                onScoreChange={(optionId, categoryId, score) =>
                  applyChange((current) => ({
                    ...current,
                    scores: {
                      ...current.scores,
                      [optionId]: {
                        ...current.scores[optionId],
                        [categoryId]: clampPercentage(score),
                      },
                    },
                  }))
                }
              />

              <ResultsPanel matrix={matrix} summary={summary} onReset={handleReset} />
            </div>
          </main>

          <AppFooter />
        </div>
      </section>
    </div>
  );
}

export default App;
