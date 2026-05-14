import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Download,
  Eye,
  ListOrdered,
  LockKeyhole,
  Mail,
  RotateCcw,
  Save,
  Share2,
} from 'lucide-react';
import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix } from '../types';
import {
  recordLaunchSignal,
  type LaunchSignalName,
} from '../utils/launchSignals';
import { MAX_SCORE } from '../utils/matrix';
import type { CriterionContribution, DecisionSummary } from '../utils/scoring';

interface ResultsPanelProps {
  areResultsHidden: boolean;
  contactEmail: string;
  copy: TranslationCopy['results'];
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onResultsHiddenChange: (areResultsHidden: boolean) => void;
  onReset: () => void;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatWholePercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatWeightedScore(value: number): string {
  return `${value.toFixed(1)}/10`;
}

function formatCompactWeightedScore(value: number): string {
  const roundedValue = Math.round(value);

  if (Math.abs(value - roundedValue) < 0.05) {
    return `${roundedValue}/10`;
  }

  return formatWeightedScore(value);
}

function formatWholeWeightedScore(value: number): string {
  return `${Math.round(value)}/10`;
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function getBarWidth(value: number): number {
  return Math.max(0, Math.min(100, (value / MAX_SCORE) * 100));
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled'));
}

function getMailToHref({
  body,
  email,
  subject,
}: {
  body: string;
  email: string;
  subject: string;
}) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

interface ContributionRowsProps {
  contributions: CriterionContribution[];
  copy: TranslationCopy['results'];
  limit?: number;
  optionName: string;
}

function ContributionRows({
  contributions,
  copy,
  limit,
  optionName,
}: ContributionRowsProps) {
  const visibleContributions = contributions
    .filter((contribution) => contribution.contribution > 0)
    .slice(0, limit ?? contributions.length);

  if (visibleContributions.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {copy.noContributionDrivers}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {visibleContributions.map((contribution) => {
        const contributionValue = formatPoints(contribution.contribution);
        const weightShare = formatWholePercent(
          contribution.normalizedWeight * 100,
        );

        return (
          <div className="space-y-2" key={contribution.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {contribution.name}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {copy.contributionDetail(
                    formatWholeWeightedScore(contribution.score),
                    weightShare,
                  )}
                </p>
              </div>
              <strong className="shrink-0 text-sm text-foreground">
                {copy.contributionValue(contributionValue)}
              </strong>
            </div>
            <div
              aria-label={copy.contributionBarAria(
                contribution.name,
                optionName,
                contributionValue,
              )}
              className="h-2 overflow-hidden rounded-full bg-slate-200/80"
              role="img"
            >
              <div
                className="h-full rounded-full bg-cyan-600 transition-[width] duration-300"
                style={{ width: `${getBarWidth(contribution.contribution)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ResultsPanel({
  areResultsHidden,
  contactEmail,
  copy,
  matrix,
  summary,
  onResultsHiddenChange,
  onReset,
}: ResultsPanelProps) {
  const [isRankingExpanded, setIsRankingExpanded] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const rankingDetailsRef = useRef<HTMLElement | null>(null);
  const resetDialogRef = useRef<HTMLDivElement | null>(null);
  const resetTriggerRef = useRef<HTMLButtonElement | null>(null);
  const resetCancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const resultsDetailsId = 'weighted-results-details';
  const rankingDetailsId = 'weighted-results-ranking';
  const resetDialogTitleId = 'reset-matrix-dialog-title';
  const resetDialogDescriptionId = 'reset-matrix-dialog-description';
  const leadingNames = summary.leadingOptionIds
    .map((optionId) =>
      summary.rankedOptions.find((option) => option.id === optionId)?.name,
    )
    .filter((name): name is string => Boolean(name));

  let headline: string | null = copy.noWeightHeadline;

  if (summary.hasScoringBasis && summary.isTie) {
    headline = copy.tieHeadline(leadingNames);
  } else if (summary.hasScoringBasis && leadingNames.length > 0) {
    headline = null;
  }

  useEffect(() => {
    if (!isResetDialogOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsResetDialogOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = resetDialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const focusTimer = window.setTimeout(() => {
      resetCancelButtonRef.current?.focus();
    }, 0);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isResetDialogOpen]);

  useEffect(() => {
    if (isResetDialogOpen) {
      return;
    }

    previouslyFocusedElementRef.current?.focus();
    previouslyFocusedElementRef.current = null;
  }, [isResetDialogOpen]);

  useEffect(() => {
    if (!isRankingExpanded) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    rankingDetailsRef.current?.scrollIntoView?.({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [isRankingExpanded]);

  const handleOpenResetDialog = () => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : resetTriggerRef.current;
    setIsResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setIsResetDialogOpen(false);
  };

  const handleConfirmReset = () => {
    previouslyFocusedElementRef.current = null;
    setIsResetDialogOpen(false);
    onReset();
  };

  const recordProInterest = (signalName: LaunchSignalName) => {
    recordLaunchSignal(signalName);
  };

  const proFeatureButtons = [
    {
      icon: Download,
      label: copy.proExport,
      signalName: 'pro-export',
    },
    {
      icon: Save,
      label: copy.proSave,
      signalName: 'pro-save',
    },
    {
      icon: Share2,
      label: copy.proShare,
      signalName: 'pro-share',
    },
  ] satisfies Array<{
    icon: typeof Download;
    label: string;
    signalName: LaunchSignalName;
  }>;

  const renderProValidation = () => (
    <section className="rounded-lg border border-cyan-900/12 bg-white/[0.76] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-800"
        >
          <LockKeyhole className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
            {copy.proValidationComingSoon}
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            {copy.proValidationTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy.proValidationBody}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {proFeatureButtons.map(({ icon: Icon, label, signalName }) => (
          <Button
            className="justify-start gap-2"
            key={signalName}
            onClick={() => recordProInterest(signalName)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      <Button
        asChild
        className="mt-3 w-full gap-2"
        onClick={() => recordProInterest('pro-request')}
        size="sm"
      >
        <a
          href={getMailToHref({
            body: copy.proRequestBody,
            email: contactEmail,
            subject: copy.proRequestSubject,
          })}
        >
          <Mail aria-hidden="true" className="size-4" />
          {copy.proRequest}
        </a>
      </Button>
    </section>
  );

  const renderNeutralState = () => (
    <div className="rounded-lg border border-dashed border-border bg-white/[0.72] p-5">
      <h3 className="text-base font-semibold text-foreground">
        {copy.recommendationEmptyTitle}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground" role="status">
        {copy.noPositiveWeights}
      </p>
    </div>
  );

  const renderRecommendation = () => {
    const topOption = summary.topOption;
    const runnerUpOption = summary.runnerUpOption;
    const shouldShowAlternative = runnerUpOption !== null && !summary.isTie;

    return (
      <section
        aria-label={copy.recommendationAria}
        className="space-y-5"
        id={resultsDetailsId}
      >
        {!summary.hasScoringBasis || topOption === null ? (
          renderNeutralState()
        ) : (
          <div
            className={cn(
              'rounded-lg border bg-white/[0.82] p-5 shadow-sm',
              summary.isTie ? 'border-amber-500/45' : 'border-cyan-600/35',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {copy.recommendationEyebrow}
            </p>
            <div className="mt-3 space-y-2">
              <h3 className="break-words font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {summary.isTie
                  ? copy.recommendationTieTitle(leadingNames)
                  : copy.recommendationTitle(topOption.name)}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {summary.isTie
                  ? copy.tiedGap(leadingNames)
                  : copy.aheadBy(formatPoints(summary.scoreGap))}
              </p>
            </div>

            <div
              className={cn(
                'mt-5 grid gap-3',
                shouldShowAlternative && 'sm:grid-cols-2',
              )}
            >
              <div className="rounded-md border border-border bg-white/[0.74] p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {copy.topScore}
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatWeightedScore(topOption.total)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {copy.weightedScore}
                </p>
              </div>

              {shouldShowAlternative ? (
                <div className="rounded-md border border-border bg-white/[0.74] p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {copy.closestAlternative}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-foreground">
                    {copy.optionScore(
                      runnerUpOption.name,
                      formatCompactWeightedScore(runnerUpOption.total),
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                {copy.topContributors}
              </h4>
              <ContributionRows
                contributions={summary.sortedLeaderContributions}
                copy={copy}
                limit={3}
                optionName={topOption.name}
              />
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderRanking = () => (
    <section
      aria-label={copy.rankingAria}
      className="space-y-3 border-t border-border pt-5"
      id={rankingDetailsId}
      ref={rankingDetailsRef}
    >
      <h3 className="text-sm font-semibold text-foreground">
        {copy.fullRankingTitle}
      </h3>

      {summary.rankedOptions.map((option, index) => {
        const isTopOption = summary.leadingOptionIds.includes(option.id);
        const statusLabel = summary.isTie ? copy.tied : copy.leading;
        const badgeClassName = summary.isTie
          ? 'bg-amber-100 text-amber-800'
          : 'bg-cyan-100 text-cyan-800';
        const gapFromLeader = Math.max(
          0,
          (summary.topOption?.total ?? 0) - option.total,
        );

        return (
          <article
            className={cn(
              'rounded-md border bg-white/60 p-3 transition',
              isTopOption ? 'border-primary/35' : 'border-border',
            )}
            key={option.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <p className="w-8 shrink-0 font-display text-2xl tracking-normal text-foreground/65">
                  #{index + 1}
                </p>
                <div className="min-w-0">
                  <h4 className="break-words text-sm font-semibold text-foreground">
                    {option.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatWeightedScore(option.total)} {copy.weightedScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isTopOption
                      ? summary.isTie
                        ? copy.rankingTiedForLead
                        : copy.rankingGapLeader
                      : copy.rankingGapFromLeader(formatPoints(gapFromLeader))}
                  </p>
                </div>
              </div>
              {isTopOption ? (
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase',
                    badgeClassName,
                  )}
                >
                  {statusLabel}
                </span>
              ) : null}
            </div>

            <div
              aria-label={copy.scoreBarAria(
                option.name,
                formatWeightedScore(option.total),
              )}
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80"
              role="img"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-orange-600 transition-[width] duration-300"
                style={{ width: `${getBarWidth(option.total)}%` }}
              />
            </div>
          </article>
        );
      })}
    </section>
  );

  return (
    <aside className="min-w-0 lg:sticky lg:top-6">
      <div className="space-y-7 border-t border-border pt-7 lg:border-t-0 lg:pt-0">
        <section className="space-y-4">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              {copy.title}
            </h2>
          </div>
          {!areResultsHidden && headline ? (
            <p className="text-base leading-7 text-muted-foreground" role="status">
              {headline}
            </p>
          ) : null}
        </section>

        {areResultsHidden ? (
          <section
            className="space-y-4 rounded-lg border border-dashed border-border bg-white/[0.72] p-5"
            id={resultsDetailsId}
          >
            <p
              className="text-sm font-medium leading-6 text-muted-foreground"
              role="status"
            >
              {copy.hiddenStatus}
            </p>
            <Button
              aria-controls={resultsDetailsId}
              aria-expanded="false"
              className="gap-2"
              onClick={() => onResultsHiddenChange(false)}
              size="sm"
              variant="secondary"
            >
              <Eye aria-hidden="true" className="h-4 w-4" />
              {copy.showResults}
            </Button>
          </section>
        ) : (
          <>
            {renderRecommendation()}
            {renderProValidation()}

            {summary.hasScoringBasis ? (
              <section className="space-y-4">
                <Button
                  aria-controls={rankingDetailsId}
                  aria-expanded={isRankingExpanded}
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => setIsRankingExpanded((current) => !current)}
                  size="sm"
                  variant="outline"
                >
                  <ListOrdered aria-hidden="true" className="h-4 w-4" />
                  {isRankingExpanded
                    ? copy.hideFullRanking
                    : copy.showFullRanking}
                </Button>

                {isRankingExpanded ? renderRanking() : null}
              </section>
            ) : null}

          </>
        )}

        <section className="flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-xs uppercase text-muted-foreground sm:order-1">
            {copy.matrixCount(matrix.options.length, matrix.categories.length)}
          </p>
          <Button
            className="order-1 w-full gap-2 text-muted-foreground active:translate-y-px active:border-primary/45 active:bg-white/85 sm:order-2 sm:w-auto"
            onClick={handleOpenResetDialog}
            ref={resetTriggerRef}
            size="sm"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            {copy.reset}
          </Button>
        </section>

        {isResetDialogOpen ? (
          <div
            aria-labelledby={resetDialogTitleId}
            aria-describedby={resetDialogDescriptionId}
            aria-modal="true"
            className="fixed inset-0 z-50 flex min-h-svh items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
            role="alertdialog"
          >
            <div
              className="w-full max-w-md rounded-lg border border-border bg-white/[0.96] p-5 text-left shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
              ref={resetDialogRef}
            >
              <h3
                className="font-display text-2xl font-semibold tracking-normal text-foreground"
                id={resetDialogTitleId}
              >
                {copy.resetDialogTitle}
              </h3>
              <p
                className="mt-3 text-sm leading-6 text-muted-foreground"
                id={resetDialogDescriptionId}
              >
                {copy.resetDialogDescription}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleCloseResetDialog}
                  ref={resetCancelButtonRef}
                  size="sm"
                  variant="outline"
                >
                  {copy.resetDialogCancel}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleConfirmReset}
                  size="sm"
                >
                  {copy.resetDialogConfirm}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
