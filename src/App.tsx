import { ChevronDown, Dices, ListOrdered } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { LandingHero } from './components/LandingHero';
import { MatrixEditor } from './components/MatrixEditor';
import { QuickDecider } from './components/QuickDecider';
import { ResultsPanel } from './components/ResultsPanel';
import { copy, type TranslationCopy } from './i18n';
import { cn } from './lib/utils';
import type { DecisionMatrix } from './types';
import {
  clampWeight,
  createCategory,
  createOption,
  createStarterMatrix,
  MAX_OPTIONS,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  applyRankingScores,
  refreshRankedCategoryScores,
  synchronizeScores,
} from './utils/matrix';
import { getDecisionSummary } from './utils/scoring';
import { loadActiveDecision, saveActiveDecision } from './utils/storage';

const MATRIX_SAVE_DEBOUNCE_MS = 250;
const MATRIX_SCROLL_FALLBACK_DELAY_MS = 80;
const SITE_URL = 'https://clear-pick.pages.dev';
type WorkspaceTab = 'matrix' | 'quickDecider';

interface SeoTemplatePage {
  path: string;
  documentTitle: string;
  metaDescription: string;
  eyebrow: string;
  heading: string;
  description: string;
  criteriaHeading: string;
  criteria: string[];
  workflowHeading: string;
  workflow: string[];
}

const seoTemplatePages: SeoTemplatePage[] = [
  {
    path: '/templates/job-offer-comparison',
    documentTitle: 'Job Offer Comparison Matrix | ClearPick',
    metaDescription:
      'Compare salary, growth, flexibility, benefits, commute, and risk with a private weighted job offer comparison matrix.',
    eyebrow: 'Career decision template',
    heading: 'Job offer comparison matrix',
    description:
      'Compare competing offers with weighted criteria so the decision reflects more than salary alone.',
    criteriaHeading: 'Example criteria',
    criteria: [
      'Compensation',
      'Growth potential',
      'Flexibility',
      'Manager fit',
      'Commute or location',
      'Long-term risk',
    ],
    workflowHeading: 'How to use it',
    workflow: [
      'Add each offer as an option.',
      'Weight the criteria based on what matters most right now.',
      'Rank each offer once, then review the recommendation and score drivers.',
    ],
  },
  {
    path: '/templates/vendor-selection-matrix',
    documentTitle: 'Vendor Selection Matrix Template | ClearPick',
    metaDescription:
      'Evaluate vendors by fit, cost, support, security, implementation effort, and risk with a weighted selection matrix.',
    eyebrow: 'Business decision template',
    heading: 'Vendor selection matrix',
    description:
      'Make vendor comparisons repeatable by scoring each provider against the same weighted buying criteria.',
    criteriaHeading: 'Example criteria',
    criteria: [
      'Feature fit',
      'Total cost',
      'Implementation effort',
      'Support quality',
      'Security posture',
      'Contract risk',
    ],
    workflowHeading: 'How to use it',
    workflow: [
      'Add the shortlisted vendors as options.',
      'Set weights with stakeholders before scoring.',
      'Rank each vendor against every criterion and use the breakdown to explain the choice.',
    ],
  },
  {
    path: '/templates/apartment-comparison',
    documentTitle: 'Apartment Comparison Matrix | ClearPick',
    metaDescription:
      'Compare apartments by rent, commute, space, neighborhood, amenities, and lease risk with a weighted decision matrix.',
    eyebrow: 'Personal decision template',
    heading: 'Apartment comparison matrix',
    description:
      'Turn apartment tradeoffs into a clear side-by-side decision before signing a lease.',
    criteriaHeading: 'Example criteria',
    criteria: [
      'Rent',
      'Commute',
      'Space and layout',
      'Neighborhood',
      'Amenities',
      'Lease flexibility',
    ],
    workflowHeading: 'How to use it',
    workflow: [
      'Add each apartment or neighborhood as an option.',
      'Weight essentials higher than nice-to-have features.',
      'Rank each place and compare the final score with your gut check.',
    ],
  },
  {
    path: '/templates/product-prioritization',
    documentTitle: 'Product Prioritization Matrix | ClearPick',
    metaDescription:
      'Prioritize product ideas by customer impact, confidence, effort, revenue potential, and strategic fit.',
    eyebrow: 'Product decision template',
    heading: 'Product prioritization matrix',
    description:
      'Score roadmap ideas consistently so teams can compare impact, effort, and strategy in one place.',
    criteriaHeading: 'Example criteria',
    criteria: [
      'Customer impact',
      'Revenue potential',
      'Strategic fit',
      'Confidence',
      'Delivery effort',
      'Risk reduction',
    ],
    workflowHeading: 'How to use it',
    workflow: [
      'Add each feature, bet, or initiative as an option.',
      'Agree on weights before ranking ideas.',
      'Use the weighted result as a discussion starter, not a substitute for judgment.',
    ],
  },
];

let pendingMatrixScrollAnimationFrame: number | null = null;
let pendingMatrixScrollTimeout: number | null = null;

function clearScheduledDecisionMatrixScrolls() {
  if (pendingMatrixScrollAnimationFrame !== null) {
    window.cancelAnimationFrame?.(pendingMatrixScrollAnimationFrame);
    pendingMatrixScrollAnimationFrame = null;
  }

  if (pendingMatrixScrollTimeout !== null) {
    window.clearTimeout(pendingMatrixScrollTimeout);
    pendingMatrixScrollTimeout = null;
  }
}

function scrollToDecisionMatrix(behavior: ScrollBehavior = 'smooth') {
  clearScheduledDecisionMatrixScrolls();

  const tryScroll = (): boolean => {
    const target = document.getElementById('decision-matrix');

    if (typeof target?.scrollIntoView === 'function') {
      target.scrollIntoView({
        behavior,
        block: 'start',
      });
      return true;
    }

    return false;
  };

  const runOnce = () => {
    pendingMatrixScrollAnimationFrame = null;

    if (tryScroll()) {
      return;
    }

    pendingMatrixScrollTimeout = window.setTimeout(() => {
      pendingMatrixScrollTimeout = null;
      tryScroll();
    }, MATRIX_SCROLL_FALLBACK_DELAY_MS);
  };

  if (typeof window.requestAnimationFrame === 'function') {
    pendingMatrixScrollAnimationFrame = window.requestAnimationFrame(runOnce);
  } else {
    runOnce();
  }
}

function HowItWorksPage({
  copy,
  footerCopy,
}: {
  copy: TranslationCopy['seoContent'];
  footerCopy: TranslationCopy['footer'];
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

function SeoTemplateStructuredData({ page }: { page: SeoTemplatePage }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${SITE_URL}${page.path}#webpage`,
        name: page.documentTitle,
        description: page.metaDescription,
        url: `${SITE_URL}${page.path}`,
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: 'ClearPick',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          url: SITE_URL,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      })}
    </script>
  );
}

function SeoTemplatePage({
  footerCopy,
  page,
}: {
  footerCopy: TranslationCopy['footer'];
  page: SeoTemplatePage;
}) {
  return (
    <div className="matrix-theme relative min-h-screen overflow-hidden bg-background text-foreground">
      <SeoTemplateStructuredData page={page} />
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
          <article className="mx-auto max-w-3xl px-1 py-4 sm:py-8">
            <header className="pb-12">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700">
                {page.eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                {page.heading}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {page.description}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-600 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,145,178,0.18)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href="/"
                >
                  Open the decision tool
                </a>
              </div>
            </header>

            <div className="space-y-14">
              <section className="border-t border-cyan-900/15 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
                  01
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
                  {page.criteriaHeading}
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {page.criteria.map((criterion) => (
                    <li
                      className="rounded-lg border border-cyan-900/10 bg-white/72 px-4 py-3 text-sm font-semibold text-foreground shadow-sm"
                      key={criterion}
                    >
                      {criterion}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="border-t border-cyan-900/15 pt-10">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
                  02
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
                  {page.workflowHeading}
                </h2>
                <ol className="mt-6 space-y-5">
                  {page.workflow.map((step, index) => (
                    <li className="flex gap-4" key={step}>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-900 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-base leading-7 text-muted-foreground">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </article>
        </main>

        <AppFooter copy={footerCopy} homeLinkLabel="Back to the decision tool" />
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

function getSeoTemplatePage(pathname: string) {
  const normalizedPathname = pathname.replace(/\/+$/, '');

  return seoTemplatePages.find((page) => page.path === normalizedPathname) ?? null;
}

function getCurrentHashTargetId() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.hash.replace(/^#/, '');
}

function getFaqStructuredData(copy: TranslationCopy['seoContent']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/how-it-works#faq`,
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

function FaqStructuredData({ copy }: { copy: TranslationCopy['seoContent'] }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(getFaqStructuredData(copy))}
    </script>
  );
}

function App() {
  const [pathname] = useState(() => getCurrentPathname());
  const isHowItWorks = isHowItWorksPath(pathname);
  const seoTemplatePage = getSeoTemplatePage(pathname);
  const [matrix, setMatrix] = useState<DecisionMatrix>(() =>
    refreshRankedCategoryScores(loadActiveDecision()),
  );
  const [areResultsHidden, setAreResultsHidden] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>('matrix');
  const pendingMatrixRef = useRef(matrix);
  const matrixSaveTimeoutRef = useRef<number | null>(null);

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

    const updateLinkHref = (selector: string, href: string) => {
      const link = document.querySelector<HTMLLinkElement>(selector);
      if (link) {
        link.href = href;
      }
    };

    const documentTitle = seoTemplatePage
      ? seoTemplatePage.documentTitle
      : isHowItWorks
        ? copy.document.howItWorksTitle
        : copy.document.title;
    const documentDescription = seoTemplatePage
      ? seoTemplatePage.metaDescription
      : isHowItWorks
        ? copy.document.howItWorksDescription
        : copy.document.description;
    const canonicalPath = seoTemplatePage?.path ?? (isHowItWorks ? '/how-it-works' : '/');
    const canonicalUrl =
      canonicalPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${canonicalPath}`;

    document.title = documentTitle;

    updateLinkHref('link[rel="canonical"]', canonicalUrl);
    updateMetaContent('meta[name="description"]', documentDescription);
    updateMetaContent('meta[property="og:title"]', documentTitle);
    updateMetaContent(
      'meta[property="og:description"]',
      documentDescription,
    );
    updateMetaContent('meta[property="og:url"]', canonicalUrl);
    updateMetaContent('meta[name="twitter:title"]', documentTitle);
    updateMetaContent(
      'meta[name="twitter:description"]',
      documentDescription,
    );
  }, [isHowItWorks, seoTemplatePage]);

  const applyChange = (
    transform: (current: DecisionMatrix) => DecisionMatrix,
    options: { refreshRankedScores?: boolean } = {},
  ) => {
    setMatrix((current) => {
      const synchronizedMatrix = synchronizeScores(transform(current));

      return options.refreshRankedScores
        ? refreshRankedCategoryScores(synchronizedMatrix)
        : synchronizedMatrix;
    });
  };

  const handleHeroStart = () => {
    setActiveWorkspaceTab('matrix');
    scrollToDecisionMatrix();
  };

  const handleReset = () => {
    setActiveWorkspaceTab('matrix');
    setAreResultsHidden(true);
    setMatrix(refreshRankedCategoryScores(createStarterMatrix()));
    scrollToDecisionMatrix();
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
        <HowItWorksPage copy={copy.seoContent} footerCopy={copy.footer} />
      </div>
    );
  }

  if (seoTemplatePage) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <SeoTemplatePage footerCopy={copy.footer} page={seoTemplatePage} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-foreground">
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
                  applyChange(
                    (current) => {
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
                    },
                    { refreshRankedScores: true },
                  )
                }
                onRemoveOption={(optionId) =>
                  applyChange(
                    (current) => {
                      if (current.options.length <= MIN_OPTIONS) {
                        return current;
                      }

                      return {
                        ...current,
                        options: current.options.filter(
                          (option) => option.id !== optionId,
                        ),
                      };
                    },
                    { refreshRankedScores: true },
                  )
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
                  applyChange(
                    (current) => ({
                      ...current,
                      categories: [
                        ...current.categories,
                        createCategory(name ?? ''),
                      ],
                    }),
                    { refreshRankedScores: true },
                  )
                }
                onRemoveCategory={(categoryId) =>
                  applyChange(
                    (current) => {
                      if (current.categories.length <= MIN_CATEGORIES) {
                        return current;
                      }

                      return {
                        ...current,
                        categories: current.categories.filter(
                          (category) => category.id !== categoryId,
                        ),
                      };
                    },
                    { refreshRankedScores: true },
                  )
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
                onCategoryRankingChange={(categoryId, optionIds) =>
                  applyChange((current) =>
                    applyRankingScores(current, categoryId, optionIds),
                  )
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
