import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { AppFooter } from './components/AppFooter';
import { LandingHero } from './components/LandingHero';
import { LanguageToggle } from './components/LanguageToggle';
import { MatrixEditor } from './components/MatrixEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { ScoringAuditPanel } from './components/ScoringAuditPanel';
import { loadLanguage, saveLanguage, translations } from './i18n';
import type { DecisionMatrix, ScoreMode } from './types';
import {
  clampScoreForMode,
  clampWeight,
  createCategory,
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

type WorkspaceTab = 'score' | 'audit';

function App() {
  const [matrix, setMatrix] = useState<DecisionMatrix>(() => loadActiveDecision());
  const [language, setLanguage] = useState(() => loadLanguage());
  const [areResultsHidden, setAreResultsHidden] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>('score');
  const copy = translations[language];

  useEffect(() => {
    saveActiveDecision(matrix);
  }, [matrix]);

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

  const summary = getDecisionSummary(matrix);
  const workspaceTabs: Array<{
    id: WorkspaceTab;
    label: string;
  }> = [
    {
      id: 'score',
      label: copy.workspaceTabs.scoreMatrix,
    },
    {
      id: 'audit',
      label: copy.workspaceTabs.audit,
    },
  ];

  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = workspaceTabs.findIndex(
      (tab) => tab.id === activeWorkspaceTab,
    );

    if (currentIndex < 0) {
      return;
    }

    const lastIndex = workspaceTabs.length - 1;
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = workspaceTabs[nextIndex];
    setActiveWorkspaceTab(nextTab.id);
    document.getElementById(`workspace-tab-${nextTab.id}`)?.focus();
  };

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

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8 lg:pb-16 lg:pt-14">
          <main className="scroll-mt-10 space-y-10" id="decision-matrix">
            <div
              aria-label={copy.workspaceTabs.label}
              className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-white/70 p-1 shadow-sm"
              onKeyDown={handleWorkspaceTabKeyDown}
              role="tablist"
            >
              {workspaceTabs.map((tab) => {
                const isSelected = activeWorkspaceTab === tab.id;

                return (
                  <button
                    aria-controls={`workspace-panel-${tab.id}`}
                    aria-selected={isSelected}
                    className={cn(
                      'min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isSelected
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-white hover:text-foreground',
                    )}
                    id={`workspace-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveWorkspaceTab(tab.id)}
                    role="tab"
                    tabIndex={isSelected ? 0 : -1}
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <section
              aria-label={copy.workspaceTabs.scoringPanelAria}
              aria-labelledby="workspace-tab-score"
              hidden={activeWorkspaceTab !== 'score'}
              id="workspace-panel-score"
              role="tabpanel"
            >
              {activeWorkspaceTab === 'score' ? (
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
                          category.id === categoryId
                            ? { ...category, name }
                            : category,
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
                    onScoreModeChange={(
                      optionId,
                      categoryId,
                      scoreMode: ScoreMode,
                    ) =>
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
              ) : null}
            </section>

            <section
              aria-label={copy.workspaceTabs.auditPanelAria}
              aria-labelledby="workspace-tab-audit"
              hidden={activeWorkspaceTab !== 'audit'}
              id="workspace-panel-audit"
              role="tabpanel"
            >
              {activeWorkspaceTab === 'audit' ? (
                <ScoringAuditPanel
                  areResultsHidden={areResultsHidden}
                  copy={copy.audit}
                  matrix={matrix}
                  summary={summary}
                />
              ) : null}
            </section>
          </main>

          <AppFooter copy={copy.footer} />
        </div>
      </section>
    </div>
  );
}

export default App;
