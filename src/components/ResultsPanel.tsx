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
  const leadingNames = summary.leadingOptionIds
    .map((optionId) =>
      summary.rankedOptions.find((option) => option.id === optionId)?.name,
    )
    .filter((name): name is string => Boolean(name));

  let headline = copy.noWeightHeadline;

  if (summary.hasScoringBasis && summary.isTie) {
    headline = copy.tieHeadline(leadingNames);
  } else if (summary.hasScoringBasis && leadingNames.length > 0) {
    headline = copy.leadingHeadline(leadingNames[0]);
  }

  return (
    <aside className="min-w-0 xl:sticky xl:top-8">
      <div className="space-y-7 border-t border-border pt-7 xl:border-t-0 xl:pt-0">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
            <div className="min-w-0 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.label}
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-normal text-foreground">
                {copy.title}
              </h2>
            </div>
            <Button
              aria-controls={resultsDetailsId}
              aria-expanded={!areResultsHidden}
              className="w-full sm:w-auto xl:w-full"
              onClick={() => onResultsHiddenChange(!areResultsHidden)}
              variant={areResultsHidden ? 'default' : 'outline'}
            >
              {areResultsHidden ? copy.showResults : copy.hideResults}
            </Button>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.visibilityHelper}
          </p>
          {!areResultsHidden ? (
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
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {copy.influence}
                </p>
                <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
                  {copy.categoryShare}
                </h3>
              </div>

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
              <p className="text-sm leading-6 text-muted-foreground">
                {copy.localSave}
              </p>
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
