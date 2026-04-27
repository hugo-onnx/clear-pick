import { Plus, X } from 'lucide-react';
import {
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '../types';
import { MIN_CATEGORIES, MIN_OPTIONS, getDisplayName } from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

interface MatrixEditorProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onAddOption: (name?: string) => void;
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
    background: `linear-gradient(90deg, var(--range-start, #06b6d4) 0%, var(--range-end, #f97316) ${value}%, var(--range-empty, rgba(255, 255, 255, 0.12)) ${value}%, var(--range-empty, rgba(255, 255, 255, 0.12)) 100%)`,
  };
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function getProgressWidth(value: number): string {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function moveCaretToEnd(input: HTMLInputElement) {
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

const minorButtonClass =
  'h-8 w-8 rounded-full text-muted-foreground hover:bg-slate-900/5 hover:text-foreground';

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
  const [pendingOptionName, setPendingOptionName] = useState('');
  const [draftOptionNames, setDraftOptionNames] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        matrix.options.map((option) => [option.id, option.name]),
      ),
  );
  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `minmax(260px, 1.15fr) repeat(${matrix.options.length}, minmax(220px, 1fr))`,
  };
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );
  const handleAddOptionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddOption(pendingOptionName.trim() || undefined);
    setPendingOptionName('');
  };
  const handleOptionNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    event.currentTarget.blur();
  };
  const handleOptionNameFocus = (event: FocusEvent<HTMLInputElement>) => {
    moveCaretToEnd(event.currentTarget);
  };
  const handleOptionNameMouseDown = (event: MouseEvent<HTMLInputElement>) => {
    if (document.activeElement === event.currentTarget) {
      return;
    }

    event.preventDefault();
    event.currentTarget.focus();
    moveCaretToEnd(event.currentTarget);
  };

  useEffect(() => {
    setDraftOptionNames((current) => {
      const nextDrafts: Record<string, string> = {};

      for (const option of matrix.options) {
        nextDrafts[option.id] = current[option.id] ?? option.name;
      }

      return nextDrafts;
    });
  }, [matrix.options]);

  return (
    <section aria-label="Decision matrix editor" className="min-w-0 space-y-8">
      <section
        aria-label="Options to compare"
        className="space-y-4"
        role="region"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Options to compare
            </h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {matrix.options.length} options
          </p>
        </div>

        <div className="overflow-x-auto pb-4 pt-3">
          <div className="grid min-w-fit grid-flow-col auto-cols-[minmax(17.5rem,20rem)] items-stretch gap-4">
            {matrix.options.map((option, index) => {
              const displayName = getDisplayName(
                option.name,
                `Option ${index + 1}`,
              );
              const hasOptionName = option.name.trim().length > 0;
              const isLeading =
                hasOptionName && summary.leadingOptionIds.includes(option.id);
              const optionTotal = totalsByOptionId.get(option.id) ?? 0;
              const draftOptionName = draftOptionNames[option.id] ?? option.name;

              return (
                <article
                  className={cn(
                    'relative flex min-h-[13.5rem] flex-col overflow-hidden rounded-lg border bg-white/85 p-4 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-within:border-primary/55',
                    isLeading
                      ? 'border-cyan-400/60 bg-[linear-gradient(180deg,rgba(236,254,255,0.9),rgba(255,255,255,0.86))]'
                      : 'border-border',
                  )}
                  key={option.id}
                >
                  {isLeading ? (
                    <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500" />
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                      <label className={labelClass} htmlFor={`option-${option.id}`}>
                        Option {index + 1}
                      </label>
                      {isLeading ? (
                        <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-cyan-800">
                          Leading
                        </span>
                      ) : null}
                    </div>
                    <Button
                      aria-label={`Remove ${displayName}`}
                      className={minorButtonClass}
                      disabled={!canRemoveOptions}
                      onClick={() => onRemoveOption(option.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    className="mt-4 h-12 rounded-lg bg-white/90 text-lg font-semibold shadow-sm placeholder:text-foreground/45"
                    id={`option-${option.id}`}
                    onKeyDown={handleOptionNameKeyDown}
                    onFocus={handleOptionNameFocus}
                    onMouseDown={handleOptionNameMouseDown}
                    onBlur={(event) =>
                      onOptionNameChange(option.id, event.currentTarget.value)
                    }
                    onChange={(event) => {
                      const { value } = event.target;
                      setDraftOptionNames((current) => ({
                        ...current,
                        [option.id]: value,
                      }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    value={draftOptionName}
                  />

                  <div className="mt-auto min-h-[4.75rem] space-y-3 rounded-md bg-slate-950/[0.035] p-3">
                    {hasOptionName ? (
                      <>
                        <div className="flex items-end justify-between gap-3">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Live total
                          </span>
                          <output
                            aria-label={`Live score for ${displayName}`}
                            className="text-xl font-semibold leading-none text-foreground"
                          >
                            {formatPoints(optionTotal)}
                          </output>
                        </div>
                        <div
                          aria-hidden="true"
                          className="h-2 overflow-hidden rounded-full bg-slate-200/80"
                        >
                          <div
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r from-cyan-600 to-orange-600 transition-[width] duration-300',
                            )}
                            style={{ width: getProgressWidth(optionTotal) }}
                          />
                        </div>
                      </>
                    ) : (
                      <p
                        className="flex min-h-[3.25rem] items-center text-sm font-medium text-muted-foreground"
                      >
                        Add an option to score
                      </p>
                    )}
                  </div>
                </article>
              );
            })}

            <form
              aria-label="Add option"
              className="flex min-h-[13.5rem] flex-col justify-between rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80"
              onSubmit={handleAddOptionSubmit}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/35 bg-white/70 text-primary">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <label className={labelClass} htmlFor="new-option-name">
                    New option
                  </label>
                </div>
                <div className="flex gap-2">
                  <Input
                    className="h-12 rounded-lg bg-white/90 text-lg font-semibold shadow-sm placeholder:text-foreground/45"
                    id="new-option-name"
                    onChange={(event) => setPendingOptionName(event.target.value)}
                    placeholder={`Option ${matrix.options.length + 1}`}
                    value={pendingOptionName}
                  />
                  <Button
                    aria-label="Add option"
                    className="h-12 w-12 shrink-0"
                    size="icon"
                    type="submit"
                  >
                    <Plus aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="rounded-md bg-slate-950/[0.025] px-3 py-2 text-xs font-medium text-muted-foreground">
                Adds to this comparison
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Criteria
            </p>
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
              Weight and score
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {matrix.categories.length} categories
          </p>
          <Button onClick={onAddCategory} size="sm" variant="secondary">
            Add category
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-white/75 shadow-sm">
          <div className="min-w-fit">
            <div
              aria-label="Decision matrix comparison"
              className="divide-y divide-border"
              role="table"
            >
              <div className="grid" role="row" style={gridStyle}>
                <div
                  className="sticky left-0 z-20 border-r border-border bg-white/95 p-5"
                  role="columnheader"
                >
                  <p className="font-display text-2xl font-semibold tracking-normal text-foreground">
                    Criteria
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
                        'border-r border-border p-5 last:border-r-0',
                        isLeading ? 'bg-cyan-50/70' : 'bg-white/30',
                      )}
                      key={option.id}
                      role="columnheader"
                    >
                      <p className={labelClass}>Option {index + 1}</p>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">
                        {displayName}
                      </h3>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          Live total
                        </span>
                        <output
                          aria-label={`Column total for ${displayName}`}
                          className="text-sm font-semibold text-foreground"
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
                  className="grid"
                  key={category.id}
                  role="row"
                  style={gridStyle}
                >
                  <div
                    className="sticky left-0 z-10 border-r border-border bg-white/95 p-5"
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
                        size="icon"
                        variant="ghost"
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
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
                        <output className="min-w-12 text-right text-sm font-semibold text-foreground">
                          {category.weight}%
                        </output>
                      </div>
                    </div>
                  </div>

                  {matrix.options.map((option, optionIndex) => {
                    const score = matrix.scores[option.id]?.[category.id] ?? 0;

                    return (
                      <div
                        className="border-r border-border bg-white/30 p-5 last:border-r-0"
                        key={`${option.id}-${category.id}`}
                        role="cell"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground/80">
                            {getDisplayName(option.name, `Option ${optionIndex + 1}`)}
                          </span>
                          <output className="min-w-10 text-right text-sm font-semibold text-foreground">
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
      </section>
    </section>
  );
}
