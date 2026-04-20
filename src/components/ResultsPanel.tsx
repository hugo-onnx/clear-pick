import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '../types';
import type { DecisionSummary } from '../utils/scoring';

interface ResultsPanelProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onReset: () => void;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
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

  let headline = 'Give at least one category some weight to surface a recommendation.';

  if (summary.hasScoringBasis && summary.isTie) {
    headline = `Current tie: ${joinLabels(leadingNames)} are evenly matched right now.`;
  } else if (summary.hasScoringBasis && leadingNames.length > 0) {
    headline = `Leading option: ${leadingNames[0]}.`;
  }

  return (
    <aside className="min-w-0">
      <Card className="h-full bg-white/[0.74]">
        <CardHeader className="border-b border-border/[0.45] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Results
          </p>
          <CardTitle>Your weighted view</CardTitle>
          <CardDescription className="text-base leading-7" role="status">
            {headline}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div aria-label="Weighted ranking" className="space-y-3">
            {summary.rankedOptions.map((option, index) => {
              const isLeading = summary.leadingOptionIds.includes(option.id);
              const width = Math.max(0, Math.min(100, option.total));

              return (
                <article
                  className={cn(
                    'rounded-[24px] border p-4 transition',
                    isLeading
                      ? 'border-primary/[0.3] bg-[rgba(243,226,210,0.72)] shadow-[0_18px_45px_rgba(155,87,46,0.10)]'
                      : 'border-border/[0.35] bg-white/[0.68]',
                  )}
                  key={option.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <p className="font-display text-3xl tracking-[-0.05em] text-foreground/80">
                        #{index + 1}
                      </p>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {option.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPercent(option.total)} weighted fit
                        </p>
                      </div>
                    </div>
                    {isLeading ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Leading
                      </span>
                    ) : null}
                  </div>

                  <div
                    aria-label={`${option.name} has a weighted fit of ${formatPercent(option.total)}`}
                    className="mt-4 h-3 overflow-hidden rounded-full bg-primary/10"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-border/[0.35] bg-white/[0.62] p-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Influence
              </p>
              <h3 className="font-display text-2xl tracking-[-0.03em] text-foreground">
                Category share
              </h3>
            </div>

            {summary.totalWeight > 0 ? (
              <div className="mt-5 space-y-3">
                {summary.categoryInfluence.map((category) => (
                  <div
                    className="flex items-center justify-between rounded-[18px] bg-accent/50 px-4 py-3"
                    key={category.id}
                  >
                    <span className="text-sm font-medium text-foreground/80">
                      {category.name}
                    </span>
                    <strong className="text-sm text-foreground">
                      {formatPercent(category.normalizedWeight * 100)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                All category weights are at zero, so every option is currently
                neutral.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] border border-border/[0.35] bg-[rgba(255,249,243,0.72)] p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              One active decision is stored locally in this browser for quick
              return visits.
            </p>
            <Button className="w-full sm:w-auto" onClick={onReset}>
              Reset decision
            </Button>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {matrix.options.length} options · {matrix.categories.length} categories
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
