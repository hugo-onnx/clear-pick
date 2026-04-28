import { CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix } from '../types';
import { MAX_SCORE } from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

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

function formatWeightedScore(value: number): string {
  return `${value.toFixed(1)}/10`;
}

export function ResultsPanel({
  areResultsHidden,
  copy,
  matrix,
  summary,
  onResultsHiddenChange,
  onReset,
}: ResultsPanelProps) {
  const resultsDetailsId = 'weighted-results-details';
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
            <section
              aria-label={copy.rankingAria}
              className="space-y-4"
              id={resultsDetailsId}
            >
              {summary.rankedOptions.map((option, index) => {
                const isTopOption = summary.leadingOptionIds.includes(option.id);
                const statusLabel = summary.isTie ? copy.tied : copy.leading;
                const statusClassName = summary.isTie
                  ? 'border-amber-500'
                  : 'border-cyan-600';
                const badgeClassName = summary.isTie
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-cyan-100 text-cyan-800';
                const width = Math.max(
                  0,
                  Math.min(100, (option.total / MAX_SCORE) * 100),
                );

                return (
                  <article
                    className={cn(
                      'border-l-2 py-1 pl-4 transition',
                      isTopOption ? statusClassName : 'border-border',
                    )}
                    key={option.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <p className="font-display text-3xl tracking-normal text-foreground/70">
                          #{index + 1}
                        </p>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {option.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatWeightedScore(option.total)} {copy.weightedScore}
                          </p>
                        </div>
                      </div>
                      {isTopOption ? (
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase',
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
                      className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-orange-600 transition-[width] duration-300"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="space-y-5 border-t border-border pt-7">
              <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
                {copy.criterionShare}
              </h3>

              {summary.totalWeight > 0 ? (
                <div className="space-y-4">
                  {summary.categoryInfluence.map((category) => {
                    const width = Math.max(
                      0,
                      Math.min(100, category.normalizedWeight * 100),
                    );

                    return (
                      <div className="space-y-2" key={category.id}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-sm font-medium text-foreground/80">
                            {category.name}
                          </span>
                          <strong className="text-sm text-foreground">
                            {formatPercent(width)}
                          </strong>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-cyan-600 transition-[width] duration-300"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.noPositiveWeights}
                </p>
              )}
            </section>

            <section className="flex flex-col gap-4 border-t border-border pt-7">
              <Button className="w-full sm:w-auto" onClick={onReset}>
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
