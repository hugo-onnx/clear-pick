import { ChevronDown, CircleHelp, Plus, Sparkles, X } from 'lucide-react';
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
import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix, ScoreMode } from '../types';
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
  SCORE_MODE_BOOLEAN,
  SCORE_MODE_SCALE,
  clampScore,
  clampWeight,
  getDisplayName,
  isBlankDecisionMatrix,
} from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';
import {
  loadOnboardingDismissed,
  saveOnboardingDismissed,
} from '../utils/storage';

interface MatrixEditorProps {
  areResultsHidden: boolean;
  copy: TranslationCopy['matrix'];
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onAddOption: (name?: string) => void;
  onRemoveOption: (optionId: string) => void;
  onOptionNameChange: (optionId: string, name: string) => void;
  onAddCategory: (name?: string) => void;
  onRemoveCategory: (categoryId: string) => void;
  onCategoryNameChange: (categoryId: string, name: string) => void;
  onCategoryWeightChange: (categoryId: string, weight: number) => void;
  onScoreModeChange: (
    optionId: string,
    categoryId: string,
    scoreMode: ScoreMode,
  ) => void;
  onScoreChange: (optionId: string, categoryId: string, score: number) => void;
  onLoadExample: () => void;
  onResultsHiddenChange: (areResultsHidden: boolean) => void;
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

function formatScoreValue(
  value: number,
  scoreMode: ScoreMode,
  copy: TranslationCopy['matrix'],
): string {
  if (scoreMode === SCORE_MODE_BOOLEAN) {
    return value >= 5 ? copy.yes : copy.no;
  }

  return formatSliderValue(value);
}

function selectInputText(input: HTMLInputElement) {
  input.focus();
  input.setSelectionRange(0, input.value.length);
}

function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.right <= viewportWidth
  );
}

function revealInputIfNeeded(input: HTMLInputElement) {
  const revealInput = () => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = 'auto';
    input.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  };

  if (!isElementInViewport(input)) {
    revealInput();
  }

  const scheduleAfterPaint =
    window.requestAnimationFrame?.bind(window) ??
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));

  scheduleAfterPaint(() => {
    if (!isElementInViewport(input)) {
      revealInput();
    }
  });
}

function focusInputText(
  input: HTMLInputElement,
  options: { reveal?: boolean } = {},
) {
  if (options.reveal) {
    revealInputIfNeeded(input);
  }

  input.focus();

  const end = input.value.length;
  input.setSelectionRange(end, end);
}

const minorButtonClass =
  'h-8 w-8 rounded-full text-muted-foreground hover:bg-slate-900/5 hover:text-foreground';

const labelClass =
  'text-[11px] font-semibold uppercase text-muted-foreground';

const segmentedControlClass =
  'inline-flex rounded-md border border-border bg-white/80 p-1 shadow-sm';

const segmentedButtonClass =
  'min-h-9 flex-1 whitespace-nowrap rounded-[6px] px-3 text-xs font-semibold transition sm:flex-none';

function getSegmentedButtonClass(isSelected: boolean): string {
  return cn(
    segmentedButtonClass,
    isSelected
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  );
}

export function MatrixEditor({
  areResultsHidden,
  copy,
  matrix,
  summary,
  onAddOption,
  onRemoveOption,
  onOptionNameChange,
  onAddCategory,
  onRemoveCategory,
  onCategoryNameChange,
  onCategoryWeightChange,
  onScoreModeChange,
  onScoreChange,
  onLoadExample,
  onResultsHiddenChange,
}: MatrixEditorProps) {
  const [pendingOptionName, setPendingOptionName] = useState('');
  const [pendingCategoryName, setPendingCategoryName] = useState('');
  const [isFirstRunHintDismissed, setIsFirstRunHintDismissed] = useState(() =>
    loadOnboardingDismissed(),
  );
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
  const shouldRevealPendingCategoryRef = useRef(false);
  const previousCategoryCountRef = useRef(matrix.categories.length);
  const blindScoringHelpId = 'blind-scoring-help';
  const blindScoringToggleId = 'blind-scoring-toggle';
  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canAddOptions = matrix.options.length < MAX_OPTIONS;
  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );
  const shouldShowFirstRunHint =
    isBlankDecisionMatrix(matrix) && !isFirstRunHintDismissed;
  const handleDismissFirstRunHint = () => {
    setIsFirstRunHintDismissed(true);
    saveOnboardingDismissed();
  };
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
    const shouldFocusNewCategory = nextCategoryName.length === 0;
    shouldFocusNewCategoryRef.current = shouldFocusNewCategory;
    shouldRevealPendingCategoryRef.current = !shouldFocusNewCategory;
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

    const nextInput = pendingCategoryInputRef.current;

    if (nextInput instanceof HTMLInputElement) {
      focusInputText(nextInput, { reveal: true });
      return;
    }

    event.currentTarget.blur();
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

    if (matrix.categories.length <= previousCategoryCount) {
      return;
    }

    if (shouldRevealPendingCategoryRef.current) {
      shouldRevealPendingCategoryRef.current = false;
      const pendingCategoryInput = pendingCategoryInputRef.current;

      if (pendingCategoryInput instanceof HTMLInputElement) {
        focusInputText(pendingCategoryInput, { reveal: true });
      }

      return;
    }

    if (!shouldFocusNewCategoryRef.current) {
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

  const scoringControls = (
    <div
      aria-label={copy.scoringControls}
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-full border border-cyan-700/20 bg-white/85 px-3 py-2 shadow-sm transition hover:border-cyan-700/35 hover:bg-white">
        <input
          aria-describedby={blindScoringHelpId}
          aria-label={copy.blindScoring}
          checked={areResultsHidden}
          className="peer sr-only"
          id={blindScoringToggleId}
          onChange={(event) =>
            onResultsHiddenChange(event.currentTarget.checked)
          }
          role="switch"
          type="checkbox"
        />
        <span
          aria-hidden="true"
          className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-cyan-700 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              areResultsHidden ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </span>
        <span className="whitespace-nowrap text-sm font-semibold text-foreground">
          {copy.blindScoring}
        </span>
      </label>
      <div className="group relative shrink-0">
        <button
          aria-describedby={blindScoringHelpId}
          aria-label={copy.blindScoringHelpLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-700/20 bg-white/85 text-muted-foreground shadow-sm transition hover:border-cyan-700/35 hover:bg-white hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
        >
          <CircleHelp aria-hidden="true" className="h-4 w-4" />
        </button>
        <p
          className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-72 rounded-md border border-border bg-white px-3 py-2 text-sm leading-5 text-muted-foreground opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
          id={blindScoringHelpId}
          role="tooltip"
        >
          {copy.blindScoringHelp}
        </p>
      </div>
    </div>
  );

  return (
    <section aria-label={copy.editorAria} className="min-w-0 space-y-9">
      <header className="border-b border-border pb-5 sm:pb-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {copy.intro}
          </p>
          <div className="mt-5">{scoringControls}</div>
        </div>
      </header>

      <section
        aria-label={copy.onboardingGuideAria}
        className="rounded-lg border border-border bg-white/[0.76] p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ol className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold text-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
            {copy.onboardingSteps.map((step, index) => (
              <li
                className="border-l-2 border-cyan-700/30 pl-3 leading-6"
                key={step}
              >
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <Button
            className="w-full gap-2 sm:w-auto"
            onClick={onLoadExample}
            size="sm"
            variant="secondary"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {copy.loadExample}
          </Button>
        </div>

        {shouldShowFirstRunHint ? (
          <div
            className="mt-4 flex items-start gap-3 border-t border-border pt-4"
            role="status"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {copy.firstRunHintTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {copy.firstRunHintBody}
              </p>
            </div>
            <Button
              aria-label={copy.dismissFirstRunHint}
              className={minorButtonClass}
              onClick={handleDismissFirstRunHint}
              size="icon"
              variant="ghost"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </section>

      <section
        aria-label={copy.optionsRegionAria}
        className="space-y-5"
        role="region"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 sm:flex-1">
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
              {copy.optionsHeading}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {copy.optionsDescription}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
              {copy.optionsCount(matrix.options.length)}
            </p>
          </div>
          {!canAddOptions ? (
            <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
              {copy.limitReached}
            </p>
          ) : null}
        </div>

        <div
          aria-label={copy.optionCards}
          className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="group"
        >
          {matrix.options.map((option, index) => {
            const displayName = getDisplayName(
              option.name,
              copy.optionLabel(index + 1),
            );
            const hasOptionName = option.name.trim().length > 0;
            const isTopOption =
              !areResultsHidden &&
              hasOptionName &&
              summary.leadingOptionIds.includes(option.id);
            const optionStatusLabel = summary.isTie ? copy.tied : copy.leading;
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
                      {copy.optionLabel(index + 1)}
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
                    aria-label={copy.removeOption(displayName)}
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
                  placeholder={copy.optionPlaceholder(index + 1)}
                  value={draftOptionName}
                />

                <div
                  className={cn(
                    'mt-auto rounded-md bg-slate-950/[0.035] p-3',
                    hasOptionName ? 'min-h-[4.5rem] space-y-3' : 'py-2',
                  )}
                >
                  {hasOptionName && !areResultsHidden ? (
                    <>
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          {copy.liveTotal}
                        </span>
                        <output
                          aria-label={copy.liveScoreAria(displayName)}
                          aria-live="polite"
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
                  ) : hasOptionName ? (
                    <p className="text-sm font-medium leading-5 text-muted-foreground">
                      {copy.resultsHiddenWhileScoring}
                    </p>
                  ) : (
                    <p className="text-sm font-medium leading-5 text-muted-foreground">
                      {copy.addOptionToScore}
                    </p>
                  )}
                </div>
              </article>
            );
          })}

          {canAddOptions ? (
            <form
              aria-label={copy.addOption}
              className="flex min-h-[12.5rem] flex-col justify-between rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80"
              onSubmit={handleAddOptionSubmit}
            >
              <div>
                <div className="flex h-8 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                    <label className={labelClass} htmlFor="new-option-name">
                      {copy.newOption}
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    className="h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                    id="new-option-name"
                    onChange={(event) => setPendingOptionName(event.target.value)}
                    placeholder={copy.optionPlaceholder(matrix.options.length + 1)}
                    value={pendingOptionName}
                  />
                  <Button
                    aria-label={copy.addOption}
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
              className="font-display text-2xl font-semibold tracking-normal text-foreground"
              id="criteria-heading"
            >
              {copy.criteriaHeading}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {copy.criteriaDescription}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
              {copy.criteriaCount(matrix.categories.length)}
            </p>
          </div>
        </div>

        <div aria-label={copy.criteriaList} className="space-y-4" role="list">
          {matrix.categories.map((category, categoryIndex) => {
            const criterionFallback = copy.criterionLabel(categoryIndex + 1);
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
                aria-label={copy.criterionRowAria(criterionDisplayName)}
                className="rounded-lg border border-border bg-white/[0.78] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-within:border-primary/55 sm:p-5"
                key={category.id}
                role="listitem"
              >
                <div className="space-y-5">
                  <div className="grid gap-5 lg:grid-cols-[minmax(200px,0.78fr)_minmax(0,1.8fr)]">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <label className={labelClass} htmlFor={`category-${category.id}`}>
                          {criterionFallback}
                        </label>
                        <Button
                          aria-label={copy.removeCriterion(criterionDisplayName)}
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

                    <div className="space-y-3 rounded-md bg-slate-950/[0.035] p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className={labelClass} htmlFor={`weight-${category.id}`}>
                          {copy.importance}
                        </label>
                        <output className="min-w-12 text-right text-sm font-semibold text-foreground">
                          {formatSliderValue(displayedWeight, weightSliderConfig)}
                        </output>
                      </div>
                      <input
                        aria-label={copy.importanceAria(criterionDisplayName)}
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
                      <p className={labelClass}>{copy.optionScores}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {copy.optionsCount(matrix.options.length)}
                      </p>
                    </div>

                    <div
                      aria-label={copy.optionScoresAria(criterionDisplayName)}
                      className="criteria-score-rows space-y-2"
                      role="group"
                    >
                      {matrix.options.map((option, optionIndex) => {
                        const optionDisplayName = getDisplayName(
                          option.name,
                          copy.optionLabel(optionIndex + 1),
                        );
                        const score =
                          matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;
                        const scoreMode =
                          matrix.scoreModes?.[option.id]?.[category.id] ??
                          category.scoreMode;
                        const isBooleanScore = scoreMode === SCORE_MODE_BOOLEAN;
                        const scoreSliderId = `score:${option.id}:${category.id}`;
                        const displayedScore = isBooleanScore
                          ? score
                          : getSliderDisplayValue(scoreSliderId, score);
                        const displayedScoreLabel = formatScoreValue(
                          displayedScore,
                          scoreMode,
                          copy,
                        );
                        const scoreRowHighlightClassName = summary.isTie
                          ? 'border-amber-400/50 bg-amber-50/75'
                          : 'border-cyan-400/50 bg-cyan-50/70';

                        return (
                          <div
                            className={cn(
                              'grid gap-3 rounded-md border border-border bg-white/70 p-3 md:grid-cols-[minmax(8rem,0.85fr)_minmax(9.5rem,auto)_minmax(12rem,1.45fr)_minmax(5.75rem,auto)] md:items-center md:gap-4',
                              !areResultsHidden &&
                                summary.leadingOptionIds.includes(option.id)
                                ? scoreRowHighlightClassName
                                : null,
                            )}
                            key={`${option.id}-${category.id}`}
                          >
                            <div className="flex min-w-0 items-center justify-between gap-3 md:block">
                              <span className="min-w-0 break-words text-sm font-semibold leading-5 text-foreground/85">
                                {optionDisplayName}
                              </span>
                              <output className="text-sm font-semibold text-foreground md:hidden">
                                {displayedScoreLabel}
                              </output>
                            </div>
                            <div className="relative w-full md:w-36">
                              <select
                                aria-label={copy.scoreModeAria(
                                  optionDisplayName,
                                  criterionDisplayName,
                                )}
                                className="h-10 w-full appearance-none rounded-md border border-border bg-white/85 py-1 pl-3 pr-8 text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-white focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/15 md:h-8 md:py-0.5 md:pl-2 md:pr-6 md:text-[11px]"
                                onChange={(event) =>
                                  onScoreModeChange(
                                    option.id,
                                    category.id,
                                    event.currentTarget.value as ScoreMode,
                                  )
                                }
                                value={scoreMode}
                              >
                                <option value={SCORE_MODE_SCALE}>
                                  {copy.scoreModeScale}
                                </option>
                                <option value={SCORE_MODE_BOOLEAN}>
                                  {copy.scoreModeBoolean}
                                </option>
                              </select>
                              <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:right-1.5 md:h-3 md:w-3"
                              />
                            </div>
                            {isBooleanScore ? (
                              <div className="flex flex-wrap items-center gap-2 justify-self-stretch md:justify-self-start">
                                <div
                                  aria-label={copy.scoreAria(
                                    optionDisplayName,
                                    criterionDisplayName,
                                  )}
                                  className={cn(segmentedControlClass, 'w-full md:w-fit')}
                                  role="group"
                                >
                                  <button
                                    aria-pressed={displayedScore >= 5}
                                    className={getSegmentedButtonClass(
                                      displayedScore >= 5,
                                    )}
                                    onClick={() =>
                                      onScoreChange(
                                        option.id,
                                        category.id,
                                        MAX_SCORE,
                                      )
                                    }
                                    type="button"
                                  >
                                    {copy.yes}
                                  </button>
                                  <button
                                    aria-pressed={displayedScore < 5}
                                    className={getSegmentedButtonClass(
                                      displayedScore < 5,
                                    )}
                                    onClick={() =>
                                      onScoreChange(
                                        option.id,
                                        category.id,
                                        MIN_SCORE,
                                      )
                                    }
                                    type="button"
                                  >
                                    {copy.no}
                                  </button>
                                </div>
                                <span
                                  aria-hidden="true"
                                  className="whitespace-nowrap text-[11px] font-medium text-muted-foreground"
                                >
                                  {copy.booleanScoreScale}
                                </span>
                              </div>
                            ) : (
                              <input
                                aria-label={copy.scoreAria(
                                  optionDisplayName,
                                  criterionDisplayName,
                                )}
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
                            )}
                            <output className="hidden text-right text-sm font-semibold text-foreground md:block">
                              {displayedScoreLabel}
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
          aria-label={copy.addCriterion}
          className="rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 shadow-sm backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80 sm:p-5"
          onSubmit={handleAddCategorySubmit}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className={labelClass} htmlFor="new-criterion-name">
                {copy.newCriterion}
              </label>
              <Input
                className="mt-3 h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                id="new-criterion-name"
                onChange={(event) => setPendingCategoryName(event.target.value)}
                placeholder={copy.criterionLabel(matrix.categories.length + 1)}
                ref={pendingCategoryInputRef}
                value={pendingCategoryName}
              />
            </div>
            <Button
              aria-label={copy.addCriterion}
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
