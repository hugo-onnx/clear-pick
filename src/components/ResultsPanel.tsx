import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix } from '../types';
import { MAX_SCORE } from '../utils/matrix';
import type { CriterionContribution, DecisionSummary } from '../utils/scoring';

interface ResultsPanelProps {
  areResultsHidden: boolean;
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
  copy,
  matrix,
  summary,
  onResultsHiddenChange,
  onReset,
}: ResultsPanelProps) {
  const [isRankingExpanded, setIsRankingExpanded] = useState(false);
  const resultsDetailsId = 'weighted-results-details';
  const rankingDetailsId = 'weighted-results-ranking';
  const visibilityHintId = 'weighted-results-visibility-hint';
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

  const renderNeutralState = () => (
    <div className="rounded-lg border border-dashed border-border bg-white/65 p-5">
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
              'rounded-lg border bg-white/75 p-5 shadow-sm',
              summary.isTie ? 'border-amber-500/45' : 'border-cyan-600/35',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {copy.recommendationEyebrow}
            </p>
            <div className="mt-3 space-y-2">
              <h3 className="font-display text-3xl font-semibold tracking-normal text-foreground">
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
              <div className="rounded-md border border-border bg-white/70 p-4">
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
                <div className="rounded-md border border-border bg-white/70 p-4">
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
                  <h4 className="truncate text-sm font-semibold text-foreground">
                    {option.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatWholeWeightedScore(option.total)} {copy.weightedScore}
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
                formatWholeWeightedScore(option.total),
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
    <aside className="min-w-0 xl:sticky xl:top-8 xl:pt-20">
      <div className="space-y-7 border-t border-border pt-7 xl:border-t-0 xl:pt-0">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {copy.title}
              </h2>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
              <Button
                aria-controls={resultsDetailsId}
                aria-expanded={!areResultsHidden}
                className="min-w-0 flex-1 sm:w-auto sm:flex-none"
                onClick={() => onResultsHiddenChange(!areResultsHidden)}
                size="sm"
                variant={areResultsHidden ? 'default' : 'outline'}
              >
                {areResultsHidden ? copy.showResults : copy.hideResults}
              </Button>
              <div className="group relative shrink-0">
                <button
                  aria-describedby={visibilityHintId}
                  aria-label={copy.visibilityHintLabel}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/70 text-muted-foreground shadow-sm transition hover:border-primary/35 hover:bg-white hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  type="button"
                >
                  <CircleHelp aria-hidden="true" className="h-4 w-4" />
                </button>
                <p
                  className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-border bg-white px-3 py-2 text-sm leading-5 text-muted-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
                  id={visibilityHintId}
                  role="tooltip"
                >
                  {copy.visibilityHelper}
                </p>
              </div>
            </div>
          </div>
          {!areResultsHidden && headline ? (
            <p className="text-base leading-7 text-muted-foreground" role="status">
              {headline}
            </p>
          ) : null}
        </section>

        {areResultsHidden ? (
          <section
            className="rounded-lg border border-dashed border-border bg-white/65 p-5"
            id={resultsDetailsId}
          >
            <p
              className="text-sm font-medium leading-6 text-muted-foreground"
              role="status"
            >
              {copy.hiddenStatus}
            </p>
          </section>
        ) : (
          <>
            {renderRecommendation()}

            {summary.hasScoringBasis ? (
              <section className="space-y-4">
                <Button
                  aria-controls={rankingDetailsId}
                  aria-expanded={isRankingExpanded}
                  className="w-full sm:w-auto"
                  onClick={() => setIsRankingExpanded((current) => !current)}
                  size="sm"
                  variant="outline"
                >
                  {isRankingExpanded
                    ? copy.hideFullRanking
                    : copy.showFullRanking}
                </Button>

                {isRankingExpanded ? renderRanking() : null}
              </section>
            ) : null}

            <section className="flex flex-col gap-4 border-t border-border pt-7">
              <Button
                className="w-full text-muted-foreground sm:w-auto"
                onClick={onReset}
                variant="ghost"
              >
                {copy.reset}
              </Button>
              <p className="text-xs uppercase text-muted-foreground">
                {copy.matrixCount(matrix.options.length, matrix.categories.length)}
              </p>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
