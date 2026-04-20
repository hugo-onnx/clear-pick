import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '../types';
import { MIN_CATEGORIES, MIN_OPTIONS, getDisplayName } from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

interface MatrixEditorProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onOptionNameChange: (optionId: string, name: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (categoryId: string) => void;
  onCategoryNameChange: (categoryId: string, name: string) => void;
  onCategoryWeightChange: (categoryId: string, weight: number) => void;
  onScoreChange: (optionId: string, categoryId: string, score: number) => void;
}

function getRangeStyle(value: number): CSSProperties {
  return {
    background: `linear-gradient(90deg, var(--range-start, #06b6d4) 0%, var(--range-end, #f97316) ${value}%, var(--range-empty, rgba(255, 255, 255, 0.12)) ${value}%, rgba(6, 182, 212, 0.14) 100%)`,
  };
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

const minorButtonClass =
  'h-auto rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase text-muted-foreground hover:bg-white/10 hover:text-cyan-100';

const labelClass =
  'text-[11px] font-semibold uppercase text-muted-foreground';

export function MatrixEditor({
  matrix,
  summary,
  onAddOption,
  onRemoveOption,
  onOptionNameChange,
  onAddCategory,
  onRemoveCategory,
  onCategoryNameChange,
  onCategoryWeightChange,
  onScoreChange,
}: MatrixEditorProps) {
  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `minmax(260px, 1.15fr) repeat(${matrix.options.length}, minmax(220px, 1fr))`,
  };
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );

  return (
    <section aria-label="Decision matrix editor" className="min-w-0">
      <Card className="overflow-hidden">
        <CardHeader className="gap-5 border-b border-border pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Step 1
              </p>
              <CardTitle>Build the matrix</CardTitle>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Your options stay across the top with live weighted points, while
                each category row lets you set importance and score every option
                in place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={onAddOption} size="sm" variant="secondary">
                Add option
              </Button>
              <Button onClick={onAddCategory} size="sm" variant="secondary">
                Add category
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-fit rounded-lg border border-border bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4">
              <div
                aria-label="Decision matrix comparison"
                className="grid gap-3"
                role="table"
              >
                <div className="grid gap-3" role="row" style={gridStyle}>
                  <div
                    className="rounded-lg border border-border bg-white/5 p-5"
                    role="columnheader"
                  >
                    <p className="font-display text-2xl tracking-normal text-foreground">
                      Categories
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Adjust importance on the left, then compare how each option
                      scores across the row.
                    </p>
                  </div>

                  {matrix.options.map((option, index) => {
                    const displayName = getDisplayName(
                      option.name,
                      `Option ${index + 1}`,
                    );
                    const isLeading = summary.leadingOptionIds.includes(option.id);

                    return (
                      <div
                        className={cn(
                          'rounded-lg border p-5 transition',
                          isLeading
                            ? 'border-cyan-300/35 bg-white/10 shadow-[0_18px_45px_rgba(6,182,212,0.16)]'
                            : 'border-border bg-white/5',
                        )}
                        key={option.id}
                        role="columnheader"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className={labelClass} htmlFor={`option-${option.id}`}>
                            Option {index + 1}
                          </label>
                          <Button
                            aria-label={`Remove ${displayName}`}
                            className={minorButtonClass}
                            disabled={!canRemoveOptions}
                            onClick={() => onRemoveOption(option.id)}
                            size="sm"
                            variant="ghost"
                          >
                            Remove
                          </Button>
                        </div>
                        <Input
                          className="mt-3 h-11"
                          id={`option-${option.id}`}
                          onChange={(event) =>
                            onOptionNameChange(option.id, event.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          value={option.name}
                        />
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-accent px-3 py-2">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Live total
                          </span>
                          <output
                            aria-label={`Live score for ${displayName}`}
                            className="rounded-md bg-black/20 px-3 py-1 text-sm font-semibold text-foreground"
                          >
                            {formatPoints(totalsByOptionId.get(option.id) ?? 0)}
                          </output>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {matrix.categories.map((category, categoryIndex) => (
                  <div
                    className="grid gap-3"
                    key={category.id}
                    role="row"
                    style={gridStyle}
                  >
                    <div
                      className="rounded-lg border border-border bg-white/5 p-5"
                      role="rowheader"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className={labelClass} htmlFor={`category-${category.id}`}>
                          Category {categoryIndex + 1}
                        </label>
                        <Button
                          aria-label={`Remove ${getDisplayName(category.name, `Category ${categoryIndex + 1}`)}`}
                          className={minorButtonClass}
                          disabled={!canRemoveCategories}
                          onClick={() => onRemoveCategory(category.id)}
                          size="sm"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      </div>

                      <Input
                        className="mt-3 h-11"
                        id={`category-${category.id}`}
                        onChange={(event) =>
                          onCategoryNameChange(category.id, event.target.value)
                        }
                        placeholder={`Category ${categoryIndex + 1}`}
                        value={category.name}
                      />

                      <div className="mt-5 space-y-3">
                        <label className={labelClass} htmlFor={`weight-${category.id}`}>
                          Importance
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            aria-label={`Importance for ${getDisplayName(category.name, `Category ${categoryIndex + 1}`)}`}
                            className="matrix-range"
                            id={`weight-${category.id}`}
                            max="100"
                            min="0"
                            onChange={(event) =>
                              onCategoryWeightChange(
                                category.id,
                                Number(event.target.value),
                              )
                            }
                            style={getRangeStyle(category.weight)}
                            type="range"
                            value={category.weight}
                          />
                          <output className="rounded-md bg-accent px-3 py-1 text-sm font-semibold text-foreground">
                            {category.weight}%
                          </output>
                        </div>
                      </div>
                    </div>

                    {matrix.options.map((option, optionIndex) => {
                      const score = matrix.scores[option.id]?.[category.id] ?? 0;

                      return (
                        <div
                          className="rounded-lg border border-border bg-white/5 p-5"
                          key={`${option.id}-${category.id}`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground/80">
                              {getDisplayName(option.name, `Option ${optionIndex + 1}`)}
                            </span>
                            <output className="rounded-md bg-accent px-3 py-1 text-sm font-semibold text-foreground">
                              {score}%
                            </output>
                          </div>
                          <input
                            aria-label={`Score for ${getDisplayName(option.name, `Option ${optionIndex + 1}`)} on ${getDisplayName(category.name, `Category ${categoryIndex + 1}`)}`}
                            className="matrix-range"
                            id={`score-${option.id}-${category.id}`}
                            max="100"
                            min="0"
                            onChange={(event) =>
                              onScoreChange(
                                option.id,
                                category.id,
                                Number(event.target.value),
                              )
                            }
                            style={getRangeStyle(score)}
                            type="range"
                            value={score}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
