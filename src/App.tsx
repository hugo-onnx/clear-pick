import { ChevronDown, Dices, ListOrdered } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { LandingHero } from './components/LandingHero';
import { LanguageToggle } from './components/LanguageToggle';
import { MatrixEditor } from './components/MatrixEditor';
import { QuickDecider } from './components/QuickDecider';
import { ResultsPanel } from './components/ResultsPanel';
import { loadLanguage, saveLanguage, translations } from './i18n';
import { cn } from './lib/utils';
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
const MATRIX_SCROLL_RETRY_DELAYS_MS = [120, 320];
type WorkspaceTab = 'matrix' | 'quickDecider';

let pendingMatrixScrollAnimationFrame: number | null = null;
let pendingMatrixScrollTimeouts: number[] = [];

function clearScheduledDecisionMatrixScrolls() {
  if (pendingMatrixScrollAnimationFrame !== null) {
    window.cancelAnimationFrame?.(pendingMatrixScrollAnimationFrame);
    pendingMatrixScrollAnimationFrame = null;
  }

  for (const timeoutId of pendingMatrixScrollTimeouts) {
    window.clearTimeout(timeoutId);
  }

  pendingMatrixScrollTimeouts = [];
}

function scheduleDecisionMatrixScroll(scroll: () => void, delay: number) {
  const timeoutId = window.setTimeout(() => {
    pendingMatrixScrollTimeouts = pendingMatrixScrollTimeouts.filter(
      (id) => id !== timeoutId,
    );
    scroll();
  }, delay);

  pendingMatrixScrollTimeouts.push(timeoutId);
}

function scrollToDecisionMatrix(behavior: ScrollBehavior = 'smooth') {
  clearScheduledDecisionMatrixScrolls();

  const scroll = () => {
    const decisionMatrix = document.getElementById('decision-matrix');

    if (typeof decisionMatrix?.scrollIntoView === 'function') {
      decisionMatrix.scrollIntoView({
        behavior,
        block: 'start',
      });
    }
  };

  scroll();

  if (typeof window.requestAnimationFrame === 'function') {
    pendingMatrixScrollAnimationFrame = window.requestAnimationFrame(() => {
      pendingMatrixScrollAnimationFrame = null;
      scroll();
    });
  } else {
    scheduleDecisionMatrixScroll(scroll, 0);
  }

  for (const delay of MATRIX_SCROLL_RETRY_DELAYS_MS) {
    scheduleDecisionMatrixScroll(scroll, delay);
  }
}

function HowItWorksPage({
  copy,
  footerCopy,
}: {
  copy: typeof translations.en.seoContent;
  footerCopy: typeof translations.en.footer;
}) {
  return (
    <div className="matrix-theme relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-cyan-600/80 via-white/60 to-orange-500/80"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-200/28 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-32 right-[-12rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-200/28 blur-3xl"
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <main>
          <article
            aria-labelledby="how-it-works-heading"
            className="mx-auto max-w-3xl px-1 py-4 sm:py-8"
          >
            <header className="pb-12">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700">
                {copy.eyebrow}
              </p>
              <h1
                className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl"
                id="how-it-works-heading"
              >
                {copy.heading}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {copy.description}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-600 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,145,178,0.18)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href="/"
                >
                  {copy.backToTool}
                </a>
              </div>
            </header>

            <div className="space-y-14">
              <section
                aria-labelledby="workflow-heading"
                className="border-t border-cyan-900/15 pt-10"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
                  01
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold text-foreground"
                  id="workflow-heading"
                >
                  {copy.workflowHeading}
                </h2>
                <div className="ml-4 mt-7 space-y-7 sm:ml-6">
                  {copy.workflow.map((step, index) => (
                    <section
                      aria-labelledby={`workflow-step-${index}`}
                      className="relative border-l border-cyan-900/10 pl-5 sm:pl-7"
                      key={step.title}
                    >
                      <div
                        aria-hidden="true"
                        className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-background text-[11px] font-bold text-cyan-800 ring-1 ring-cyan-900/12"
                      >
                        {index + 1}
                      </div>
                      <h3
                        className="text-lg font-bold text-foreground"
                        id={`workflow-step-${index}`}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-muted-foreground">
                        {step.body}
                      </p>
                    </section>
                  ))}
                </div>
              </section>

              <section
                aria-labelledby="use-cases-heading"
                className="border-t border-cyan-900/15 pt-10"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
                  02
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold text-foreground"
                  id="use-cases-heading"
                >
                  {copy.useCasesHeading}
                </h2>
                <div className="mt-6 divide-y divide-cyan-900/10">
                  {copy.useCases.map((useCase) => (
                    <section className="py-5 first:pt-0" key={useCase.title}>
                      <h3 className="text-lg font-bold text-foreground">
                        {useCase.title}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-muted-foreground">
                        {useCase.body}
                      </p>
                    </section>
                  ))}
                </div>
              </section>

              <section
                aria-labelledby="privacy-heading"
                className="border-t border-cyan-900/15 pt-10"
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
                  03
                </p>
                <h2
                  className="mt-2 font-display text-3xl font-semibold text-foreground"
                  id="privacy-heading"
                >
                  {copy.privacyHeading}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {copy.privacyBody}
                </p>
              </section>

              <section
                aria-labelledby="faq-heading"
                className="border-t border-cyan-900/15 pt-10"
              >
                <h2
                  className="font-display text-3xl font-semibold text-foreground"
                  id="faq-heading"
                >
                  {copy.faqHeading}
                </h2>
                <div className="mt-6 divide-y divide-cyan-900/10 border-y border-cyan-900/10">
                  {copy.faq.map((item) => (
                    <details className="group py-5" key={item.question}>
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                        <h3 className="text-lg font-bold text-foreground">
                          {item.question}
                        </h3>
                        <ChevronDown
                          aria-hidden="true"
                          className="mt-1 size-5 shrink-0 text-cyan-800 transition group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </article>
        </main>

        <AppFooter copy={footerCopy} homeLinkLabel={copy.backToTool} />
      </div>
    </div>
  );
}

function getCurrentPathname() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname;
}

function isHowItWorksPath(pathname: string) {
  return pathname.replace(/\/+$/, '') === '/how-it-works';
}

function getCurrentHashTargetId() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.hash.replace(/^#/, '');
}

function getFaqStructuredData(copy: typeof translations.en.seoContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://60second-decisions.pages.dev/how-it-works#faq',
    name: copy.faqHeading,
    mainEntity: copy.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function FaqStructuredData({ copy }: { copy: typeof translations.en.seoContent }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(getFaqStructuredData(copy))}
    </script>
  );
}

function App() {
  const [pathname] = useState(() => getCurrentPathname());
  const isHowItWorks = isHowItWorksPath(pathname);
  const [matrix, setMatrix] = useState<DecisionMatrix>(() => loadActiveDecision());
  const [language, setLanguage] = useState(() => loadLanguage());
  const [areResultsHidden, setAreResultsHidden] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>('matrix');
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

  useEffect(() => clearScheduledDecisionMatrixScrolls, []);

  useEffect(() => {
    if (!isHowItWorks) {
      return undefined;
    }

    const targetId = getCurrentHashTargetId();

    if (!targetId) {
      return undefined;
    }

    const scrollToHashTarget = () => {
      const target = document.getElementById(targetId);

      if (typeof target?.scrollIntoView === 'function') {
        target.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });
      }
    };

    scrollToHashTarget();

    const animationFrameId = window.requestAnimationFrame?.(scrollToHashTarget);
    const timeoutId = window.setTimeout(scrollToHashTarget, 120);

    return () => {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame?.(animationFrameId);
      }

      window.clearTimeout(timeoutId);
    };
  }, [isHowItWorks]);

  useEffect(() => {
    const updateMetaContent = (selector: string, content: string) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) {
        meta.content = content;
      }
    };

    saveLanguage(language);
    document.documentElement.lang = language;
    const documentTitle = isHowItWorks
      ? copy.document.howItWorksTitle
      : copy.document.title;
    const documentDescription = isHowItWorks
      ? copy.document.howItWorksDescription
      : copy.document.description;

    document.title = documentTitle;

    updateMetaContent('meta[name="description"]', documentDescription);
    updateMetaContent('meta[property="og:title"]', documentTitle);
    updateMetaContent(
      'meta[property="og:description"]',
      documentDescription,
    );
    updateMetaContent('meta[name="twitter:title"]', documentTitle);
    updateMetaContent(
      'meta[name="twitter:description"]',
      documentDescription,
    );
    updateMetaContent(
      'meta[property="og:locale"]',
      language === 'es' ? 'es_ES' : 'en_US',
    );
  }, [
    copy.document.description,
    copy.document.howItWorksDescription,
    copy.document.howItWorksTitle,
    copy.document.title,
    isHowItWorks,
    language,
  ]);

  const applyChange = (transform: (current: DecisionMatrix) => DecisionMatrix) => {
    setMatrix((current) => synchronizeScores(transform(current)));
  };

  const handleHeroStart = () => {
    setActiveWorkspaceTab('matrix');
    scrollToDecisionMatrix();
  };

  const handleReset = () => {
    setActiveWorkspaceTab('matrix');
    setMatrix(createStarterMatrix());
    scrollToDecisionMatrix();
  };

  const handleLoadExample = () => {
    setMatrix(createCareerMoveMatrix(copy.matrix.careerMoveExample));
    setAreResultsHidden(false);
  };

  const summary = useMemo(() => getDecisionSummary(matrix), [matrix]);
  const workspaceTabs = [
    {
      icon: ListOrdered,
      id: 'matrix',
      label: copy.workspaceTabs.matrix,
      panelId: 'weighted-matrix-panel',
      tabId: 'weighted-matrix-tab',
    },
    {
      icon: Dices,
      id: 'quickDecider',
      label: copy.workspaceTabs.quickDecider,
      panelId: 'quick-decider-panel',
      tabId: 'quick-decider-tab',
    },
  ] satisfies Array<{
    icon: typeof ListOrdered;
    id: WorkspaceTab;
    label: string;
    panelId: string;
    tabId: string;
  }>;

  if (isHowItWorks) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <FaqStructuredData copy={copy.seoContent} />
        <LanguageToggle
          copy={copy.languageToggle}
          language={language}
          onLanguageChange={setLanguage}
        />
        <HowItWorksPage copy={copy.seoContent} footerCopy={copy.footer} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-foreground">
      <LanguageToggle
        copy={copy.languageToggle}
        language={language}
        onLanguageChange={setLanguage}
      />
      <LandingHero copy={copy.hero} onPrimaryCtaClick={handleHeroStart} />

      <section
        aria-label={copy.workspaceLabel}
        className="matrix-theme relative isolate z-10 overflow-hidden bg-background text-foreground"
      >
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-cyan-600/80 via-white/60 to-orange-500/80"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-3 pb-10 pt-7 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
          <main className="space-y-9" id="decision-matrix">
            <div
              aria-label={copy.workspaceTabs.label}
              className="inline-flex max-w-full rounded-full border border-border bg-white/[0.72] p-1 shadow-sm"
              role="tablist"
            >
              {workspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeWorkspaceTab === tab.id;

                return (
                  <button
                    aria-controls={tab.panelId}
                    aria-selected={isSelected}
                    className={cn(
                      'inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4',
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600 to-orange-600 text-white shadow-[0_10px_24px_rgba(8,145,178,0.18)]'
                        : 'hover:bg-white hover:text-cyan-800',
                    )}
                    id={tab.tabId}
                    key={tab.id}
                    onClick={() => setActiveWorkspaceTab(tab.id)}
                    role="tab"
                    type="button"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <section
              aria-labelledby="weighted-matrix-tab"
              className={cn(
                'gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.72fr)] lg:items-start xl:gap-10 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.72fr)]',
                activeWorkspaceTab === 'matrix' ? 'grid' : 'hidden',
              )}
              hidden={activeWorkspaceTab !== 'matrix'}
              id="weighted-matrix-panel"
              role="tabpanel"
            >
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
            </section>

            <section
              aria-labelledby="quick-decider-tab"
              className={activeWorkspaceTab === 'quickDecider' ? undefined : 'hidden'}
              hidden={activeWorkspaceTab !== 'quickDecider'}
              id="quick-decider-panel"
              role="tabpanel"
            >
              <QuickDecider
                availableSourceOptions={matrix.options}
                copy={copy.quickDecider}
              />
            </section>
          </main>

          <AppFooter copy={copy.footer} />
        </div>
      </section>
    </div>
  );
}

export default App;
