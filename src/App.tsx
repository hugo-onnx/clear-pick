import { useEffect, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { DecisionHeader } from './components/DecisionHeader';
import { LandingHero } from './components/LandingHero';
import { MatrixEditor } from './components/MatrixEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { SectionTabs } from './components/SectionTabs';
import type { DecisionMatrix } from './types';
import {
  clampPercentage,
  createCategory,
  createOption,
  createStarterMatrix,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  synchronizeScores,
  touchDecisionMatrix,
} from './utils/matrix';
import { getDecisionSummary } from './utils/scoring';
import { loadActiveDecision, saveActiveDecision } from './utils/storage';

function App() {
  const [matrix, setMatrix] = useState<DecisionMatrix>(() => loadActiveDecision());

  useEffect(() => {
    saveActiveDecision(matrix);
  }, [matrix]);

  const applyChange = (transform: (current: DecisionMatrix) => DecisionMatrix) => {
    setMatrix((current) => touchDecisionMatrix(synchronizeScores(transform(current))));
  };

  const handleReset = () => {
    const shouldReset =
      typeof window === 'undefined'
        ? true
        : window.confirm('Reset this decision and restore the starter matrix?');

    if (shouldReset) {
      setMatrix(createStarterMatrix());
    }
  };

  const summary = getDecisionSummary(matrix);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <LandingHero />

      <div className="workspace-theme relative z-10 border-t border-border/70 bg-background/95">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),transparent)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
          <SectionTabs />

          <main className="scroll-mt-12 space-y-8" id="decision-matrix">
            <DecisionHeader
              title={matrix.title}
              updatedAt={matrix.updatedAt}
              onTitleChange={(title) =>
                applyChange((current) => ({
                  ...current,
                  title,
                }))
              }
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.82fr)] xl:items-start">
              <MatrixEditor
                matrix={matrix}
                summary={summary}
                onAddOption={() =>
                  applyChange((current) => ({
                    ...current,
                    options: [
                      ...current.options,
                      createOption(`Option ${current.options.length + 1}`),
                    ],
                  }))
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
      </div>
    </div>
  );
}

export default App;
