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
import {
  DEFAULT_SCORE,
  MAX_SCORE,
  MAX_OPTIONS,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  MIN_SCORE,
  clampScore,
  getDisplayName,
} from '../utils/matrix';
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

function clampVisualScore(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SCORE;
  }

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

function getRangeStyle(value: number): CSSProperties {
  const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
  const progress =
    ((clampedValue - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100;

  if (progress <= 0) {
    return {
      background: 'var(--range-empty, rgba(255, 255, 255, 0.12))',
      transition: 'background 180ms ease',
    };
  }

  if (progress >= 100) {
    return {
      background: 'linear-gradient(90deg, var(--range-start, #06b6d4) 0%, var(--range-end, #f97316) 100%)',
      transition: 'background 180ms ease',
    };
  }

  return {
    background: `linear-gradient(90deg,
      var(--range-start, #06b6d4) 0%,
      var(--range-end, #f97316) ${progress}%,
      var(--range-empty, rgba(255, 255, 255, 0.12)) ${progress}%,
      var(--range-empty, rgba(255, 255, 255, 0.12)) 100%)`,
    transition: 'background 180ms ease',
  };
}

function formatSliderValue(value: number): string {
  return `${clampScore(value)}/10`;
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function moveCaretToEnd(input: HTMLInputElement) {
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

function selectInputText(input: HTMLInputElement) {
  input.focus();
  input.setSelectionRange(0, input.value.length);
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
  const [draftSliderValues, setDraftSliderValues] = useState<
    Record<string, number>
  >({});
  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canAddOptions = matrix.options.length < MAX_OPTIONS;
  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );
  const handleAddOptionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAddOptions) {
      return;
    }

    onAddOption(pendingOptionName.trim());
    setPendingOptionName('');
  };
  const handleOptionNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    optionId: string,
    optionIndex: number,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onOptionNameChange(optionId, event.currentTarget.value);

    const nextOption = matrix.options[optionIndex + 1];
    const nextInputId = nextOption?.id
      ? `option-${nextOption.id}`
      : canAddOptions
        ? 'new-option-name'
        : null;

    if (!nextInputId) {
      event.currentTarget.blur();
      return;
    }

    const nextInput = document.getElementById(nextInputId);

    if (nextInput instanceof HTMLInputElement) {
      selectInputText(nextInput);
    }
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
  const handleCategoryNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    categoryId: string,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onCategoryNameChange(categoryId, event.currentTarget.value);
    event.currentTarget.blur();
  };
  const getSliderDisplayValue = (sliderId: string, value: number) => {
    return draftSliderValues[sliderId] ?? value;
  };
  const setDraftSliderValue = (sliderId: string, value: number) => {
    setDraftSliderValues((current) => ({
      ...current,
      [sliderId]: clampVisualScore(value),
    }));
  };
  const clearDraftSliderValue = (sliderId: string) => {
    setDraftSliderValues((current) => {
      if (!(sliderId in current)) {
        return current;
      }

      const { [sliderId]: _removedValue, ...nextDraftValues } = current;
      return nextDraftValues;
    });
  };
  const handleSliderStart = (sliderId: string, value: number) => {
    setDraftSliderValue(sliderId, value);
  };
  const handleSliderChange = (
    sliderId: string,
    value: number,
  ) => {
    setDraftSliderValue(sliderId, value);
  };
  const handleSliderEnd = (
    sliderId: string,
    value: number,
    commit: (value: number) => void,
  ) => {
    commit(clampScore(value));
    clearDraftSliderValue(sliderId);
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
    <section aria-label="Decision matrix editor" className="min-w-0 space-y-10">
      <header className="border-b border-border pb-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Weighted Scoring Model
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground lg:whitespace-nowrap">
            Build a weighted comparison by naming your options, setting what
            matters, and scoring each choice.
          </p>
        </div>
      </header>

      <section
        aria-label="Options to compare"
        className="space-y-4"
        role="region"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 sm:flex-1">
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              Options to compare
            </h3>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground lg:whitespace-nowrap">
              Name the choices you&apos;re deciding between. You&apos;ll score
              each option against the weighted criteria below.
            </p>
            <p className="mt-2 whitespace-nowrap text-sm font-medium text-muted-foreground">
              {matrix.options.length} options
            </p>
          </div>
          {!canAddOptions ? (
            <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              Limit reached: remove an option to add another.
            </p>
          ) : null}
        </div>

        <div
          aria-label="Option cards"
          className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="group"
        >
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
                  'relative flex min-h-[12.5rem] flex-col overflow-hidden rounded-lg border bg-white/85 p-4 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-within:border-primary/55',
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
                  className="mt-3 h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                  id={`option-${option.id}`}
                  onKeyDown={(event) =>
                    handleOptionNameKeyDown(event, option.id, index)
                  }
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

                <div
                  className={cn(
                    'mt-auto rounded-md bg-slate-950/[0.035] p-3',
                    hasOptionName ? 'min-h-[4.5rem] space-y-3' : 'py-2',
                  )}
                >
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
                        className="h-2 rounded-full"
                        style={getRangeStyle(optionTotal)}
                      />
                    </>
                  ) : (
                    <p className="text-sm font-medium leading-5 text-muted-foreground">
                      Add an option to score
                    </p>
                  )}
                </div>
              </article>
            );
          })}

          {canAddOptions ? (
            <form
              aria-label="Add option"
              className="flex min-h-[12.5rem] flex-col justify-between rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80"
              onSubmit={handleAddOptionSubmit}
            >
              <div>
                <div className="flex h-8 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                    <label className={labelClass} htmlFor="new-option-name">
                      New option
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    className="h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                    id="new-option-name"
                    onChange={(event) => setPendingOptionName(event.target.value)}
                    placeholder={`Option ${matrix.options.length + 1}`}
                    value={pendingOptionName}
                  />
                  <Button
                    aria-label="Add option"
                    className="h-11 w-11 shrink-0"
                    size="icon"
                    type="submit"
                  >
                    <Plus aria-hidden="true" className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="criteria-heading" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              className="font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
              id="criteria-heading"
            >
              Criteria, weights, and scores
            </h3>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              Name the factors that matter, set how strongly each one should
              influence the decision, then score every option against each
              factor on a 1-10 scale.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              {matrix.categories.length}{' '}
              {matrix.categories.length === 1 ? 'criterion' : 'criteria'}
            </p>
            <Button onClick={onAddCategory} size="sm" variant="secondary">
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              Add criterion
            </Button>
          </div>
        </div>

        <div aria-label="Criteria list" className="space-y-4" role="list">
          {matrix.categories.map((category, categoryIndex) => {
            const criterionFallback = `Criterion ${categoryIndex + 1}`;
            const criterionDisplayName = getDisplayName(
              category.name,
              criterionFallback,
            );
            const weightSliderId = `weight:${category.id}`;
            const displayedWeight = getSliderDisplayValue(
              weightSliderId,
              category.weight,
            );

            return (
              <article
                aria-label={`${criterionDisplayName} criterion row`}
                className="rounded-lg border border-border bg-white/75 p-5 shadow-sm"
                key={category.id}
                role="listitem"
              >
                <div className="space-y-5">
                  <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.75fr)]">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <label className={labelClass} htmlFor={`category-${category.id}`}>
                          {criterionFallback}
                        </label>
                        <Button
                          aria-label={`Remove ${criterionDisplayName}`}
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
                        className="h-11 rounded-lg bg-white/90 font-semibold shadow-sm placeholder:text-foreground/45"
                        id={`category-${category.id}`}
                        onChange={(event) =>
                          onCategoryNameChange(category.id, event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleCategoryNameKeyDown(event, category.id)
                        }
                        placeholder={criterionFallback}
                        value={category.name}
                      />
                    </div>

                    <div className="space-y-3 rounded-md bg-slate-950/[0.035] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className={labelClass} htmlFor={`weight-${category.id}`}>
                          Importance
                        </label>
                        <output className="min-w-12 text-right text-sm font-semibold text-foreground">
                          {formatSliderValue(displayedWeight)}
                        </output>
                      </div>
                      <input
                        aria-label={`Importance for ${criterionDisplayName}`}
                        className="matrix-range"
                        id={`weight-${category.id}`}
                        max={MAX_SCORE}
                        min={MIN_SCORE}
                        onBlur={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                          )
                        }
                        onChange={(event) =>
                          handleSliderChange(
                            weightSliderId,
                            Number(event.currentTarget.value),
                          )
                        }
                        onFocus={() =>
                          handleSliderStart(weightSliderId, displayedWeight)
                        }
                        onKeyUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                          )
                        }
                        onPointerCancel={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                          )
                        }
                        onPointerDown={() =>
                          handleSliderStart(weightSliderId, displayedWeight)
                        }
                        onPointerUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                          )
                        }
                        step="0.1"
                        style={getRangeStyle(displayedWeight)}
                        type="range"
                        value={displayedWeight}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className={labelClass}>Option scores</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {matrix.options.length}{' '}
                        {matrix.options.length === 1 ? 'option' : 'options'}
                      </p>
                    </div>

                    <div
                      aria-label={`${criterionDisplayName} option scores`}
                      className="criteria-score-rows space-y-2"
                      role="group"
                    >
                      {matrix.options.map((option, optionIndex) => {
                        const optionDisplayName = getDisplayName(
                          option.name,
                          `Option ${optionIndex + 1}`,
                        );
                        const score =
                          matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;
                        const scoreSliderId = `score:${option.id}:${category.id}`;
                        const displayedScore = getSliderDisplayValue(
                          scoreSliderId,
                          score,
                        );

                        return (
                          <div
                            className={cn(
                              'grid gap-3 rounded-md border border-border bg-white/65 p-3 sm:grid-cols-[minmax(10rem,0.9fr)_minmax(12rem,1.6fr)_3.75rem] sm:items-center',
                              summary.leadingOptionIds.includes(option.id)
                                ? 'border-cyan-400/50 bg-cyan-50/70'
                                : null,
                            )}
                            key={`${option.id}-${category.id}`}
                          >
                            <div className="flex min-w-0 items-center justify-between gap-3 sm:block">
                              <span className="min-w-0 break-words text-sm font-semibold leading-5 text-foreground/85">
                                {optionDisplayName}
                              </span>
                              <output className="text-sm font-semibold text-foreground sm:hidden">
                                {formatSliderValue(displayedScore)}
                              </output>
                            </div>
                            <input
                              aria-label={`Score for ${optionDisplayName} on ${criterionDisplayName}`}
                              className="matrix-range"
                              id={`score-${option.id}-${category.id}`}
                              max={MAX_SCORE}
                              min={MIN_SCORE}
                              onBlur={(event) =>
                                handleSliderEnd(
                                  scoreSliderId,
                                  Number(event.currentTarget.value),
                                  (value) =>
                                    onScoreChange(option.id, category.id, value),
                                )
                              }
                              onChange={(event) =>
                                handleSliderChange(
                                  scoreSliderId,
                                  Number(event.currentTarget.value),
                                )
                              }
                              onFocus={() =>
                                handleSliderStart(scoreSliderId, displayedScore)
                              }
                              onKeyUp={(event) =>
                                handleSliderEnd(
                                  scoreSliderId,
                                  Number(event.currentTarget.value),
                                  (value) =>
                                    onScoreChange(option.id, category.id, value),
                                )
                              }
                              onPointerCancel={(event) =>
                                handleSliderEnd(
                                  scoreSliderId,
                                  Number(event.currentTarget.value),
                                  (value) =>
                                    onScoreChange(option.id, category.id, value),
                                )
                              }
                              onPointerDown={() =>
                                handleSliderStart(scoreSliderId, displayedScore)
                              }
                              onPointerUp={(event) =>
                                handleSliderEnd(
                                  scoreSliderId,
                                  Number(event.currentTarget.value),
                                  (value) =>
                                    onScoreChange(option.id, category.id, value),
                                )
                              }
                              step="0.1"
                              style={getRangeStyle(displayedScore)}
                              type="range"
                              value={displayedScore}
                            />
                            <output className="hidden text-right text-sm font-semibold text-foreground sm:block">
                              {formatSliderValue(displayedScore)}
                            </output>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
