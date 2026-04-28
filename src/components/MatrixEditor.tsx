import { Plus, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DecisionMatrix } from '../types';
import {
  DEFAULT_SCORE,
  DEFAULT_WEIGHT,
  MAX_OPTIONS,
  MAX_SCORE,
  MAX_WEIGHT,
  MIN_CATEGORIES,
  MIN_OPTIONS,
  MIN_SCORE,
  MIN_WEIGHT,
  clampScore,
  clampWeight,
  getDisplayName,
} from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

interface MatrixEditorProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onAddOption: (name?: string) => void;
  onRemoveOption: (optionId: string) => void;
  onOptionNameChange: (optionId: string, name: string) => void;
  onAddCategory: (name?: string) => void;
  onRemoveCategory: (categoryId: string) => void;
  onCategoryNameChange: (categoryId: string, name: string) => void;
  onCategoryWeightChange: (categoryId: string, weight: number) => void;
  onScoreChange: (optionId: string, categoryId: string, score: number) => void;
}

type SliderConfig = {
  min: number;
  max: number;
  fallback: number;
  clamp: (value: number) => number;
};

const scoreSliderConfig: SliderConfig = {
  min: MIN_SCORE,
  max: MAX_SCORE,
  fallback: DEFAULT_SCORE,
  clamp: clampScore,
};

const weightSliderConfig: SliderConfig = {
  min: MIN_WEIGHT,
  max: MAX_WEIGHT,
  fallback: DEFAULT_WEIGHT,
  clamp: clampWeight,
};

function clampVisualValue(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): number {
  if (!Number.isFinite(value)) {
    return config.fallback;
  }

  return Math.min(config.max, Math.max(config.min, value));
}

function getRangeStyle(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): CSSProperties {
  const clampedValue = Math.max(config.min, Math.min(config.max, value));
  const range = config.max - config.min;
  const progress = range > 0 ? ((clampedValue - config.min) / range) * 100 : 0;

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

function formatSliderValue(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): string {
  return `${config.clamp(value)}/10`;
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function selectInputText(input: HTMLInputElement) {
  input.focus();
  input.setSelectionRange(0, input.value.length);
}

function focusInputText(input: HTMLInputElement) {
  input.focus();
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
  const [pendingCategoryName, setPendingCategoryName] = useState('');
  const [draftOptionNames, setDraftOptionNames] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        matrix.options.map((option) => [option.id, option.name]),
      ),
  );
  const [draftSliderValues, setDraftSliderValues] = useState<
    Record<string, number>
  >({});
  const pendingCategoryInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusNewCategoryRef = useRef(false);
  const previousCategoryCountRef = useRef(matrix.categories.length);
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
  const handleAddCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCategoryName = pendingCategoryName.trim();
    shouldFocusNewCategoryRef.current = nextCategoryName.length === 0;
    onAddCategory(nextCategoryName);
    setPendingCategoryName('');
    pendingCategoryInputRef.current?.focus();
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
  const handleCategoryNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    categoryId: string,
    categoryIndex: number,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onCategoryNameChange(categoryId, event.currentTarget.value);

    const nextCategory = matrix.categories[categoryIndex + 1];

    if (nextCategory) {
      const nextInput = document.getElementById(`category-${nextCategory.id}`);

      if (nextInput instanceof HTMLInputElement) {
        focusInputText(nextInput);
      }

      return;
    }

    shouldFocusNewCategoryRef.current = true;
    onAddCategory();
  };
  const getSliderDisplayValue = (sliderId: string, value: number) => {
    return draftSliderValues[sliderId] ?? value;
  };
  const setDraftSliderValue = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
  ) => {
    setDraftSliderValues((current) => ({
      ...current,
      [sliderId]: clampVisualValue(value, config),
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
  const handleSliderStart = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
  ) => {
    setDraftSliderValue(sliderId, value, config);
  };
  const handleSliderChange = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
  ) => {
    setDraftSliderValue(sliderId, value, config);
  };
  const handleSliderEnd = (
    sliderId: string,
    value: number,
    commit: (value: number) => void,
    config: SliderConfig = scoreSliderConfig,
  ) => {
    commit(config.clamp(value));
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

  useEffect(() => {
    const previousCategoryCount = previousCategoryCountRef.current;
    previousCategoryCountRef.current = matrix.categories.length;

    if (
      !shouldFocusNewCategoryRef.current ||
      matrix.categories.length <= previousCategoryCount
    ) {
      return;
    }

    shouldFocusNewCategoryRef.current = false;

    const newCategory = matrix.categories[matrix.categories.length - 1];
    const newCategoryInput = document.getElementById(
      `category-${newCategory.id}`,
    );

    if (newCategoryInput instanceof HTMLInputElement) {
      focusInputText(newCategoryInput);
    }
  }, [matrix.categories]);

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
            const isTopOption =
              hasOptionName && summary.leadingOptionIds.includes(option.id);
            const optionStatusLabel = summary.isTie ? 'Tied' : 'Leading';
            const optionHighlightClassName = summary.isTie
              ? 'border-amber-400/70 bg-[linear-gradient(180deg,rgba(254,243,199,0.9),rgba(255,255,255,0.86))]'
              : 'border-cyan-400/60 bg-[linear-gradient(180deg,rgba(236,254,255,0.9),rgba(255,255,255,0.86))]';
            const optionAccentClassName = summary.isTie
              ? 'bg-amber-500'
              : 'bg-cyan-500';
            const optionBadgeClassName = summary.isTie
              ? 'bg-amber-100 text-amber-800'
              : 'bg-cyan-100 text-cyan-800';
            const optionTotal = totalsByOptionId.get(option.id) ?? 0;
            const draftOptionName = draftOptionNames[option.id] ?? option.name;

            return (
              <article
                className={cn(
                  'relative flex min-h-[12.5rem] flex-col overflow-hidden rounded-lg border bg-white/85 p-4 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-within:border-primary/55',
                  isTopOption ? optionHighlightClassName : 'border-border',
                )}
                key={option.id}
              >
                {isTopOption ? (
                  <div
                    className={cn('absolute inset-x-0 top-0 h-1', optionAccentClassName)}
                  />
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                    <label className={labelClass} htmlFor={`option-${option.id}`}>
                      Option {index + 1}
                    </label>
                    {isTopOption ? (
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase',
                          optionBadgeClassName,
                        )}
                      >
                        {optionStatusLabel}
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
          <div className="min-w-0 sm:flex-1">
            <h3
              className="font-display text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
              id="criteria-heading"
            >
              Criteria, weights, and scores
            </h3>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              Name the factors that matter, set how strongly each one should
              influence the decision from 0-10, then score every option against
              each factor on a 0-10 scale. A weight of 0 excludes that criterion.
            </p>
            <p className="mt-2 whitespace-nowrap text-sm font-medium text-muted-foreground">
              {matrix.categories.length}{' '}
              {matrix.categories.length === 1 ? 'criterion' : 'criteria'}
            </p>
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
                          handleCategoryNameKeyDown(event, category.id, categoryIndex)
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
                          {formatSliderValue(displayedWeight, weightSliderConfig)}
                        </output>
                      </div>
                      <input
                        aria-label={`Importance for ${criterionDisplayName}`}
                        className="matrix-range"
                        id={`weight-${category.id}`}
                        max={MAX_WEIGHT}
                        min={MIN_WEIGHT}
                        onBlur={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                          )
                        }
                        onChange={(event) =>
                          handleSliderChange(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            weightSliderConfig,
                          )
                        }
                        onFocus={() =>
                          handleSliderStart(
                            weightSliderId,
                            displayedWeight,
                            weightSliderConfig,
                          )
                        }
                        onKeyUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                          )
                        }
                        onPointerCancel={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                          )
                        }
                        onPointerDown={() =>
                          handleSliderStart(
                            weightSliderId,
                            displayedWeight,
                            weightSliderConfig,
                          )
                        }
                        onPointerUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                          )
                        }
                        step="0.1"
                        style={getRangeStyle(displayedWeight, weightSliderConfig)}
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
                        const scoreRowHighlightClassName = summary.isTie
                          ? 'border-amber-400/50 bg-amber-50/75'
                          : 'border-cyan-400/50 bg-cyan-50/70';

                        return (
                          <div
                            className={cn(
                              'grid gap-3 rounded-md border border-border bg-white/65 p-3 sm:grid-cols-[minmax(10rem,0.9fr)_minmax(12rem,1.6fr)_3.75rem] sm:items-center',
                              summary.leadingOptionIds.includes(option.id)
                                ? scoreRowHighlightClassName
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

        <form
          aria-label="Add criterion"
          className="rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 shadow-sm backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80 sm:p-5"
          onSubmit={handleAddCategorySubmit}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className={labelClass} htmlFor="new-criterion-name">
                New criterion
              </label>
              <Input
                className="mt-3 h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                id="new-criterion-name"
                onChange={(event) => setPendingCategoryName(event.target.value)}
                placeholder={`Criterion ${matrix.categories.length + 1}`}
                ref={pendingCategoryInputRef}
                value={pendingCategoryName}
              />
            </div>
            <Button
              aria-label="Add criterion"
              className="h-11 w-full shrink-0 sm:w-11"
              size="icon"
              type="submit"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </section>
    </section>
  );
}
