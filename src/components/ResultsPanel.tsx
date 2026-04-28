import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '../types';
import { MAX_SCORE } from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

interface ResultsPanelProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onReset: () => void;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatWeightedScore(value: number): string {
  return `${value.toFixed(1)}/10`;
}

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) {
    return labels[0] ?? '';
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

export function ResultsPanel({
  matrix,
  summary,
  onReset,
}: ResultsPanelProps) {
  const leadingNames = summary.leadingOptionIds
    .map((optionId) =>
      summary.rankedOptions.find((option) => option.id === optionId)?.name,
    )
    .filter((name): name is string => Boolean(name));

  let headline = 'Give at least one criterion some weight to surface a recommendation.';

  if (summary.hasScoringBasis && summary.isTie) {
    headline = `Current tie: ${joinLabels(leadingNames)} are evenly matched right now.`;
  } else if (summary.hasScoringBasis && leadingNames.length > 0) {
    headline = `Leading option: ${leadingNames[0]}.`;
  }

  return (
    <aside className="min-w-0 xl:sticky xl:top-8">
      <div className="space-y-7 border-t border-border pt-7 xl:border-t-0 xl:pt-0">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Results
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-normal text-foreground">
            Your weighted view
          </h2>
          <p className="text-base leading-7 text-muted-foreground" role="status">
            {headline}
          </p>
        </section>

        <section aria-label="Weighted ranking" className="space-y-4">
          {summary.rankedOptions.map((option, index) => {
            const isLeading = summary.leadingOptionIds.includes(option.id);
            const width = Math.max(
              0,
              Math.min(100, (option.total / MAX_SCORE) * 100),
            );

            return (
              <article
                className={cn(
                  'border-l-2 py-1 pl-4 transition',
                  isLeading ? 'border-cyan-600' : 'border-border',
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
                        {formatWeightedScore(option.total)} weighted score
                      </p>
                    </div>
                  </div>
                  {isLeading ? (
                    <span className="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase text-cyan-800">
                      Leading
                    </span>
                  ) : null}
                </div>

                <div
                  aria-label={`${option.name} has a weighted score of ${formatWeightedScore(option.total)}`}
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
              Influence
            </p>
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
              Category share
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
              No criterion weights are available, so every option is currently
              neutral.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4 border-t border-border pt-7">
          <p className="text-sm leading-6 text-muted-foreground">
            This matrix is stored locally in this browser for quick return
            visits.
          </p>
          <Button className="w-full sm:w-auto" onClick={onReset}>
            Reset matrix
          </Button>
          <p className="text-xs uppercase text-muted-foreground">
            {matrix.options.length} options / {matrix.categories.length} categories
          </p>
        </section>
      </div>
    </aside>
  );
}
