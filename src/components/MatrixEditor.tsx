import { ArrowDown, ArrowUp, CircleHelp, GripVertical, Plus, X } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sortable, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix, Option } from '../types';
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
  getRankedOptionsForCategory,
} from '../utils/matrix';
import type { DecisionSummary } from '../utils/scoring';

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
  onCategoryRankingChange: (categoryId: string, optionIds: string[]) => void;
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
    };
  }

  if (progress >= 100) {
    return {
      background: 'linear-gradient(90deg, var(--range-start, #06b6d4) 0%, var(--range-end, #f97316) 100%)',
    };
  }

  return {
    background: `linear-gradient(90deg,
      var(--range-start, #06b6d4) 0%,
      var(--range-end, #f97316) ${progress}%,
      var(--range-empty, rgba(255, 255, 255, 0.12)) ${progress}%,
      var(--range-empty, rgba(255, 255, 255, 0.12)) 100%)`,
  };
}

function formatSliderValue(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): string {
  const clampedValue = config.clamp(value);
  const roundedValue = Math.round(clampedValue * 10) / 10;
  const displayValue = Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(1);

  return `${displayValue}/10`;
}

function formatDraftSliderValue(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): string {
  return formatSliderValue(value, config);
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function getOptionId(option: Option): string {
  return option.id;
}

function moveRankedOption(
  rankedOptions: Option[],
  optionId: string,
  offset: -1 | 1,
): string[] {
  const currentIndex = rankedOptions.findIndex((option) => option.id === optionId);
  const nextIndex = currentIndex + offset;

  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= rankedOptions.length
  ) {
    return rankedOptions.map((option) => option.id);
  }

  const nextOptions = [...rankedOptions];
  const [movedOption] = nextOptions.splice(currentIndex, 1);
  nextOptions.splice(nextIndex, 0, movedOption);

  return nextOptions.map((option) => option.id);
}

function getSliderOutputSelector(sliderId: string): string {
  return `[data-slider-output="${sliderId.replace(/["\\]/g, '\\$&')}"]`;
}

type FocusInputOptions = {
  reveal?: boolean;
};

const smBreakpointWidth = 640;
const lgBreakpointWidth = 1024;

function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const visualViewport = window.visualViewport;
  const viewportTop = visualViewport?.offsetTop ?? 0;
  const viewportLeft = visualViewport?.offsetLeft ?? 0;
  const viewportHeight =
    visualViewport?.height ??
    window.innerHeight ??
    document.documentElement.clientHeight;
  const viewportWidth =
    visualViewport?.width ??
    window.innerWidth ??
    document.documentElement.clientWidth;

  return (
    rect.top >= viewportTop &&
    rect.left >= viewportLeft &&
    rect.bottom <= viewportTop + viewportHeight &&
    rect.right <= viewportLeft + viewportWidth
  );
}

const revealRetryDelays = [90, 240, 420];
const visualViewportRevealMargin = 16;
const programmaticCriterionWeightFocusTargets = new WeakSet<HTMLElement>();

function getViewportWidth() {
  const visualViewportWidth = window.visualViewport?.width;

  return (
    typeof visualViewportWidth === 'number' && visualViewportWidth > 0
      ? visualViewportWidth
      : (window.innerWidth ?? document.documentElement.clientWidth)
  );
}

function getFocusRevealViewport() {
  const viewportWidth = getViewportWidth();

  if (viewportWidth < smBreakpointWidth) {
    return 'mobile';
  }

  if (viewportWidth < lgBreakpointWidth) {
    return 'tablet';
  }

  return 'desktop';
}

function getMotionSafeScrollBehavior(): ScrollBehavior {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto';
  }

  return 'smooth';
}

function getWindowScrollY() {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    document.body.scrollTop ??
    0
  );
}

function getViewportBounds() {
  const visualViewport = window.visualViewport;
  const top = visualViewport?.offsetTop ?? 0;
  const left = visualViewport?.offsetLeft ?? 0;
  const height =
    visualViewport?.height ??
    window.innerHeight ??
    document.documentElement.clientHeight;
  const width =
    visualViewport?.width ??
    window.innerWidth ??
    document.documentElement.clientWidth;

  return {
    bottom: top + height,
    left,
    right: left + width,
    top,
  };
}

function isElementComfortablyVisible(
  element: HTMLElement,
  margin = visualViewportRevealMargin,
) {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportBounds();

  return (
    rect.top >= viewport.top + margin &&
    rect.left >= viewport.left &&
    rect.bottom <= viewport.bottom - margin &&
    rect.right <= viewport.right
  );
}

function isElementVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportBounds();

  return (
    rect.bottom > viewport.top &&
    rect.top < viewport.bottom &&
    rect.right > viewport.left &&
    rect.left < viewport.right
  );
}

function revealMobileFocusCard(element: HTMLElement) {
  if (typeof window.scrollTo !== 'function') {
    if (typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: getMotionSafeScrollBehavior(),
        block: 'start',
        inline: 'nearest',
      });
    }

    return;
  }

  const scrollTo = window.scrollTo.bind(window);
  const behavior = getMotionSafeScrollBehavior();
  const rect = element.getBoundingClientRect();
  const viewportTop = window.visualViewport?.offsetTop ?? 0;
  const top = Math.max(
    0,
    getWindowScrollY() + rect.top - viewportTop - visualViewportRevealMargin,
  );

  try {
    scrollTo({
      behavior,
      top,
    });
  } catch {
    element.scrollIntoView?.({
      behavior,
      block: 'start',
      inline: 'nearest',
    });
  }
}

function revealFocusCard(
  card: HTMLElement,
  focusedControl?: HTMLElement | null,
) {
  const behavior = getMotionSafeScrollBehavior();
  const viewport = getFocusRevealViewport();

  if (viewport === 'mobile') {
    revealMobileFocusCard(card);
    return;
  }

  if (viewport === 'tablet' && isElementComfortablyVisible(card)) {
    return;
  }

  if (
    viewport === 'desktop' &&
    (isElementInViewport(card) ||
      (focusedControl && isElementVisible(focusedControl)))
  ) {
    return;
  }

  card.scrollIntoView?.({
    behavior,
    block: 'nearest',
    inline: 'nearest',
  });
}

function nudgeElementIntoVisualViewport(element: HTMLElement) {
  if (typeof window.scrollBy !== 'function' || !window.visualViewport) {
    return;
  }

  const rect = element.getBoundingClientRect();
  const visibleTop = window.visualViewport.offsetTop + visualViewportRevealMargin;
  const visibleBottom =
    window.visualViewport.offsetTop +
    window.visualViewport.height -
    visualViewportRevealMargin;
  const visibleHeight = visibleBottom - visibleTop;
  let scrollDelta = 0;

  if (rect.height > visibleHeight) {
    if (rect.top < visibleTop || rect.bottom > visibleBottom) {
      scrollDelta = rect.top - visibleTop;
    }
  } else if (rect.bottom > visibleBottom) {
    scrollDelta = rect.bottom - visibleBottom;
  } else if (rect.top < visibleTop) {
    scrollDelta = rect.top - visibleTop;
  }

  if (Math.abs(scrollDelta) < 1) {
    return;
  }

  window.scrollBy({
    behavior: 'auto',
    top: scrollDelta,
  });
}

function revealElementIfNeeded(
  element: HTMLElement,
  options: { block?: ScrollLogicalPosition; force?: boolean } = {},
) {
  const revealElement = () => {
    if (typeof element.scrollIntoView !== 'function') {
      return;
    }

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = 'auto';
    element.scrollIntoView({
      behavior: 'auto',
      block: options.block ?? 'center',
      inline: 'nearest',
    });
    nudgeElementIntoVisualViewport(element);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  };

  if (options.force) {
    revealElement();
  } else if (!isElementInViewport(element)) {
    revealElement();
  }

  const scheduleAfterPaint =
    window.requestAnimationFrame?.bind(window) ??
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));

  scheduleAfterPaint(() => {
    if (!isElementInViewport(element)) {
      revealElement();
    }
  });

  if (options.force) {
    for (const delay of revealRetryDelays) {
      window.setTimeout(() => {
        if (!isElementInViewport(element)) {
          revealElement();
        }
      }, delay);
    }
  }
}

function revealInputIfNeeded(input: HTMLInputElement) {
  revealElementIfNeeded(input);
}

function getFocusCard(element: HTMLElement): HTMLElement | null {
  const card = element.closest('[data-focus-card], [data-option-focus-card]');

  return card instanceof HTMLElement ? card : null;
}

function focusInputWithoutScrolling(input: HTMLInputElement) {
  try {
    input.focus({ preventScroll: true });
  } catch {
    input.focus();
  }
}

function focusCriterionWeightSlider(categoryId: string) {
  const weightSlider = document.getElementById(`weight-${categoryId}`);
  const criterionCard = document.getElementById(`criterion-card-${categoryId}`);

  if (!(weightSlider instanceof HTMLInputElement)) {
    return false;
  }

  programmaticCriterionWeightFocusTargets.add(weightSlider);

  try {
    weightSlider.focus({ preventScroll: true });
  } catch {
    weightSlider.focus();
  }

  if (criterionCard instanceof HTMLElement) {
    revealFocusCard(criterionCard, weightSlider);
  }

  return true;
}

function focusEntryInput(
  input: HTMLInputElement,
  options: {
    reveal?: boolean;
    revealTarget?: HTMLElement | null;
    select?: boolean;
  } = {},
) {
  const shouldSelect = options.select ?? false;
  const shouldReveal = options.reveal ?? true;
  const revealTarget = options.revealTarget ?? getFocusCard(input);

  focusInputWithoutScrolling(input);

  if (shouldSelect) {
    input.setSelectionRange(0, input.value.length);
  } else {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  if (shouldReveal && revealTarget) {
    revealFocusCard(revealTarget, input);
  }
}

function revealClosestFocusCard(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (programmaticCriterionWeightFocusTargets.delete(target)) {
    return;
  }

  if (target instanceof HTMLSelectElement && getFocusRevealViewport() === 'mobile') {
    return;
  }

  const revealTarget = getFocusCard(target);

  if (revealTarget) {
    revealFocusCard(revealTarget, target);
  }
}

function focusInputText(
  input: HTMLInputElement,
  options: FocusInputOptions = {},
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
  onCategoryRankingChange,
  onResultsHiddenChange,
}: MatrixEditorProps) {
  const [pendingOptionName, setPendingOptionName] = useState('');
  const [pendingCategoryName, setPendingCategoryName] = useState('');
  const [draftOptionNames, setDraftOptionNames] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        matrix.options.map((option) => [option.id, option.name]),
      ),
  );
  const [isBlindScoringHelpOpen, setIsBlindScoringHelpOpen] = useState(false);
  const [blindScoringHelpStyle, setBlindScoringHelpStyle] =
    useState<CSSProperties>({});
  const pendingOptionFormRef = useRef<HTMLFormElement>(null);
  const pendingOptionInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusPendingOptionAfterAddRef = useRef(false);
  const shouldFocusAddedOptionAfterAddRef = useRef(false);
  const shouldBlurAddedOptionAfterAddRef = useRef(false);
  const isKeyboardSubmittingOptionRef = useRef(false);
  const isPointerSubmittingOptionRef = useRef(false);
  const pendingCategoryFormRef = useRef<HTMLFormElement>(null);
  const pendingCategoryInputRef = useRef<HTMLInputElement>(null);
  const shouldRevealNewOptionRef = useRef(false);
  const previousOptionCountRef = useRef(matrix.options.length);
  const shouldFocusNewCategoryRef = useRef(false);
  const shouldFocusNewCategoryWeightRef = useRef(false);
  const previousCategoryCountRef = useRef(matrix.categories.length);
  const blindScoringHelpRef = useRef<HTMLDivElement>(null);
  const blindScoringHelpButtonRef = useRef<HTMLButtonElement>(null);
  const blindScoringHelpId = 'blind-scoring-help';
  const blindScoringToggleId = 'blind-scoring-toggle';
  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canAddOptions = matrix.options.length < MAX_OPTIONS;
  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );

  const handleAddOptionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAddOptions) {
      shouldFocusPendingOptionAfterAddRef.current = false;
      shouldFocusAddedOptionAfterAddRef.current = false;
      shouldBlurAddedOptionAfterAddRef.current = false;
      isKeyboardSubmittingOptionRef.current = false;
      isPointerSubmittingOptionRef.current = false;
      return;
    }

    const isKeyboardSubmit =
      !isPointerSubmittingOptionRef.current &&
      (isKeyboardSubmittingOptionRef.current ||
        document.activeElement === pendingOptionInputRef.current);
    shouldFocusPendingOptionAfterAddRef.current = false;
    shouldFocusAddedOptionAfterAddRef.current = !isKeyboardSubmit;
    shouldBlurAddedOptionAfterAddRef.current = isKeyboardSubmit;
    isKeyboardSubmittingOptionRef.current = false;
    isPointerSubmittingOptionRef.current = false;

    if (isKeyboardSubmit) {
      const pendingInput = pendingOptionInputRef.current;
      const pendingForm = pendingOptionFormRef.current;

      if (pendingInput) {
        pendingInput.style.transition = 'none';
        pendingInput.blur();
      }
      if (pendingForm) {
        pendingForm.style.transition = 'none';
      }

      const restorePendingTransitions = () => {
        if (pendingInput) {
          pendingInput.style.transition = '';
        }
        if (pendingForm) {
          pendingForm.style.transition = '';
        }
      };
      const requestNextFrame =
        window.requestAnimationFrame?.bind(window) ??
        ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));
      requestNextFrame(restorePendingTransitions);
    }

    shouldRevealNewOptionRef.current = true;
    onAddOption(pendingOptionName.trim());
    setPendingOptionName('');
  };
  const handlePendingOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    isKeyboardSubmittingOptionRef.current = true;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };
  const updateBlindScoringHelpPosition = () => {
    const helpButton = blindScoringHelpButtonRef.current;

    if (!helpButton) {
      return;
    }

    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const width = Math.min(288, Math.max(0, viewportWidth - 32));
    const buttonRect = helpButton.getBoundingClientRect();
    const rightSideLeft = buttonRect.right + 8;
    const hasRightSideRoom = rightSideLeft + width <= viewportWidth - 16;

    if (hasRightSideRoom) {
      setBlindScoringHelpStyle({
        '--blind-scoring-help-left': `${rightSideLeft}px`,
        '--blind-scoring-help-top': `${buttonRect.top}px`,
        '--blind-scoring-help-width': `${width}px`,
      } as CSSProperties);
      return;
    }

    const centeredLeft = buttonRect.left + buttonRect.width / 2 - width / 2;
    const left = Math.min(
      Math.max(centeredLeft, 16),
      viewportWidth - width - 16,
    );

    setBlindScoringHelpStyle({
      '--blind-scoring-help-left': `${left}px`,
      '--blind-scoring-help-top': `${buttonRect.bottom + 8}px`,
      '--blind-scoring-help-width': `${width}px`,
    } as CSSProperties);
  };
  const handleAddCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCategoryName = pendingCategoryName.trim();
    const shouldFocusNewCategory = nextCategoryName.length === 0;
    const isKeyboardSubmit =
      document.activeElement === pendingCategoryInputRef.current;
    shouldFocusNewCategoryRef.current = shouldFocusNewCategory;
    shouldFocusNewCategoryWeightRef.current = !shouldFocusNewCategory;

    if (isKeyboardSubmit && !shouldFocusNewCategory) {
      const pendingInput = pendingCategoryInputRef.current;
      const pendingForm = pendingCategoryFormRef.current;

      if (pendingInput) {
        pendingInput.style.transition = 'none';
        pendingInput.blur();
      }
      if (pendingForm) {
        pendingForm.style.transition = 'none';
      }

      const requestNextFrame =
        window.requestAnimationFrame?.bind(window) ??
        ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));
      requestNextFrame(() => {
        if (pendingInput) {
          pendingInput.style.transition = '';
        }
        if (pendingForm) {
          pendingForm.style.transition = '';
        }
      });
    }

    onAddCategory(nextCategoryName);
    setPendingCategoryName('');
  };
  const handleOptionNameKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
    optionId: string,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onOptionNameChange(optionId, event.currentTarget.value);
    event.currentTarget.blur();
    const card = event.currentTarget.closest('[data-option-card]');
    if (card instanceof HTMLElement) {
      card.style.pointerEvents = 'none';
      requestAnimationFrame(() => {
        card.style.pointerEvents = '';
      });
    }
  };
  const handleCategoryNameKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
    categoryId: string,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    onCategoryNameChange(categoryId, event.currentTarget.value);
    event.currentTarget.blur();
  };
  const updateSliderDisplay = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
    formatValue: (value: number) => string = (nextValue) =>
      formatDraftSliderValue(nextValue, config),
    input?: HTMLInputElement | null,
  ) => {
    const visualValue = clampVisualValue(value, config);

    for (const output of document.querySelectorAll<HTMLOutputElement>(
      getSliderOutputSelector(sliderId),
    )) {
      output.value = formatValue(visualValue);
      output.textContent = formatValue(visualValue);
    }

    if (input) {
      Object.assign(input.style, getRangeStyle(visualValue, config));
    }
  };
  const handleSliderStart = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
    formatValue?: (value: number) => string,
    input?: HTMLInputElement | null,
  ) => {
    updateSliderDisplay(sliderId, value, config, formatValue, input);
  };
  const handleSliderChange = (
    sliderId: string,
    value: number,
    config: SliderConfig = scoreSliderConfig,
    formatValue?: (value: number) => string,
    input?: HTMLInputElement | null,
  ) => {
    updateSliderDisplay(sliderId, value, config, formatValue, input);
  };
  const handleSliderEnd = (
    sliderId: string,
    value: number,
    commit: (value: number) => void,
    config: SliderConfig = scoreSliderConfig,
    formatValue?: (value: number) => string,
    input?: HTMLInputElement | null,
  ) => {
    updateSliderDisplay(sliderId, value, config, formatValue, input);
    commit(config.clamp(value));
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

  useLayoutEffect(() => {
    const previousOptionCount = previousOptionCountRef.current;
    previousOptionCountRef.current = matrix.options.length;

    if (
      !shouldRevealNewOptionRef.current ||
      matrix.options.length <= previousOptionCount
    ) {
      return;
    }

    shouldRevealNewOptionRef.current = false;

    const newOption = matrix.options[matrix.options.length - 1];
    const newOptionCard = document.getElementById(`option-card-${newOption.id}`);
    const newOptionInput = document.getElementById(`option-${newOption.id}`);
    const pendingOptionForm = pendingOptionFormRef.current;
    const pendingOptionInput = pendingOptionInputRef.current;
    const shouldFocusPendingOptionAfterAdd =
      shouldFocusPendingOptionAfterAddRef.current &&
      matrix.options.length < MAX_OPTIONS;
    const shouldBlurAddedOptionAfterAdd =
      shouldBlurAddedOptionAfterAddRef.current;
    const shouldFocusAddedOptionAfterAdd =
      shouldFocusAddedOptionAfterAddRef.current;
    shouldFocusPendingOptionAfterAddRef.current = false;
    shouldFocusAddedOptionAfterAddRef.current = false;
    shouldBlurAddedOptionAfterAddRef.current = false;

    if (shouldBlurAddedOptionAfterAdd) {
      if (newOptionInput instanceof HTMLInputElement) {
        newOptionInput.blur();
      }

      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        pendingOptionForm instanceof HTMLElement &&
        pendingOptionForm.contains(activeElement)
      ) {
        activeElement.blur();
      } else if (activeElement instanceof HTMLInputElement) {
        activeElement.blur();
      }
    }

    if (
      shouldFocusPendingOptionAfterAdd &&
      pendingOptionInput instanceof HTMLInputElement
    ) {
      focusEntryInput(pendingOptionInput, {
        revealTarget: pendingOptionForm,
      });
      return;
    }

    if (
      shouldFocusAddedOptionAfterAdd &&
      newOptionInput instanceof HTMLInputElement
    ) {
      focusEntryInput(newOptionInput, {
        revealTarget: newOptionCard instanceof HTMLElement ? newOptionCard : null,
        select: true,
      });
      return;
    }

    if (newOptionCard instanceof HTMLElement) {
      revealFocusCard(newOptionCard, null);
    }
  }, [matrix.options]);

  useLayoutEffect(() => {
    const previousCategoryCount = previousCategoryCountRef.current;
    previousCategoryCountRef.current = matrix.categories.length;

    if (matrix.categories.length <= previousCategoryCount) {
      return;
    }

    if (!shouldFocusNewCategoryRef.current) {
      if (shouldFocusNewCategoryWeightRef.current) {
        shouldFocusNewCategoryWeightRef.current = false;
        const newCategory = matrix.categories[matrix.categories.length - 1];
        const newCategoryInput = document.getElementById(
          `category-${newCategory.id}`,
        );
        if (newCategoryInput instanceof HTMLInputElement) {
          newCategoryInput.blur();
        }
        pendingCategoryInputRef.current?.blur();
      }

      return;
    }

    shouldFocusNewCategoryRef.current = false;

    const newCategory = matrix.categories[matrix.categories.length - 1];
    const newCategoryInput = document.getElementById(
      `category-${newCategory.id}`,
    );
    const newCategoryCard = document.getElementById(
      `criterion-card-${newCategory.id}`,
    );

    if (newCategoryInput instanceof HTMLInputElement) {
      focusEntryInput(newCategoryInput, {
        revealTarget:
          newCategoryCard instanceof HTMLElement ? newCategoryCard : null,
        select: true,
      });
    }
  }, [matrix.categories]);

  useEffect(() => {
    if (!isBlindScoringHelpOpen) {
      return;
    }

    updateBlindScoringHelpPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const helpContainer = blindScoringHelpRef.current;
      const target = event.target;

      if (
        helpContainer &&
        target instanceof Node &&
        !helpContainer.contains(target)
      ) {
        setIsBlindScoringHelpOpen(false);
      }
    };
    const handleReposition = () => {
      updateBlindScoringHelpPosition();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBlindScoringHelpOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBlindScoringHelpOpen]);

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
      <div
        className="group relative shrink-0"
        onFocusCapture={updateBlindScoringHelpPosition}
        onMouseEnter={updateBlindScoringHelpPosition}
        ref={blindScoringHelpRef}
      >
        <button
          aria-controls={blindScoringHelpId}
          aria-describedby={blindScoringHelpId}
          aria-expanded={isBlindScoringHelpOpen}
          aria-label={copy.blindScoringHelpLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-700/20 bg-white/85 text-muted-foreground shadow-sm transition hover:border-cyan-700/35 hover:bg-white hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => {
            if (!isBlindScoringHelpOpen) {
              updateBlindScoringHelpPosition();
            }

            setIsBlindScoringHelpOpen((isCurrentlyOpen) => !isCurrentlyOpen);
          }}
          ref={blindScoringHelpButtonRef}
          type="button"
        >
          <CircleHelp aria-hidden="true" className="h-4 w-4" />
        </button>
        <p
          className={cn(
            'pointer-events-none fixed left-[var(--blind-scoring-help-left,1rem)] top-[var(--blind-scoring-help-top,4rem)] z-20 w-[var(--blind-scoring-help-width,18rem)] rounded-md border border-border bg-white px-3 py-2 text-sm leading-5 text-muted-foreground opacity-0 shadow-lg transition group-hover:opacity-100',
            isBlindScoringHelpOpen && 'opacity-100',
          )}
          id={blindScoringHelpId}
          role="tooltip"
          style={blindScoringHelpStyle}
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
        className="w-fit rounded-lg border border-border bg-white/[0.76] p-4 shadow-sm sm:p-5"
      >
        <ol className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
          {copy.onboardingSteps.map((step, index) => (
            <li
              className="border-l-2 border-cyan-700/30 pl-3 leading-6"
              key={step}
            >
              {index + 1}. {step}
            </li>
          ))}
        </ol>


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
                data-option-card=""
                data-option-focus-card=""
                data-focus-card=""
                id={`option-card-${option.id}`}
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
                  enterKeyHint={canAddOptions ? 'next' : 'done'}
                  id={`option-${option.id}`}
                  onKeyDown={(event) =>
                    handleOptionNameKeyDown(event, option.id)
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
                    'mt-auto min-h-[4.5rem] rounded-md bg-slate-950/[0.035] p-3',
                    hasOptionName && !areResultsHidden ? 'space-y-3' : null,
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
              data-add-option-card=""
              data-option-focus-card=""
              data-focus-card=""
              onSubmit={handleAddOptionSubmit}
              ref={pendingOptionFormRef}
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
                    enterKeyHint={
                      matrix.options.length + 1 < MAX_OPTIONS ? 'next' : 'done'
                    }
                    id="new-option-name"
                    onChange={(event) => setPendingOptionName(event.target.value)}
                    onKeyDown={handlePendingOptionKeyDown}
                    placeholder={copy.optionPlaceholder(matrix.options.length + 1)}
                    ref={pendingOptionInputRef}
                    value={pendingOptionName}
                  />
                  <Button
                    aria-label={copy.addOption}
                    className="h-11 w-11 shrink-0"
                    onPointerDown={() => {
                      isPointerSubmittingOptionRef.current = true;
                      shouldFocusPendingOptionAfterAddRef.current = false;
                    }}
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
            const displayedWeight = category.weight;
            const rankedOptions = getRankedOptionsForCategory(matrix, category.id);

            return (
              <article
                aria-label={copy.criterionRowAria(criterionDisplayName)}
                className="rounded-lg border border-border bg-white/[0.78] p-4 shadow-sm transition duration-200 hover:bg-white focus-within:border-primary/55 sm:p-5"
                data-criterion-focus-card=""
                data-focus-card=""
                id={`criterion-card-${category.id}`}
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
                          handleCategoryNameKeyDown(event, category.id)
                        }
                        placeholder={criterionFallback}
                        value={category.name}
                      />

                    </div>

                    <div
                      className="space-y-3 rounded-md bg-slate-950/[0.035] p-3 sm:p-4"
                      data-focus-card=""
                      data-scoring-focus-card=""
                      onFocusCapture={(event) =>
                        revealClosestFocusCard(event.target)
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className={labelClass} htmlFor={`weight-${category.id}`}>
                          {copy.importance}
                        </label>
                        <output
                          className="min-w-12 text-right text-sm font-semibold text-foreground"
                          data-slider-output={weightSliderId}
                        >
                          {formatSliderValue(displayedWeight, weightSliderConfig)}
                        </output>
                      </div>
                      <input
                        aria-label={copy.importanceAria(criterionDisplayName)}
                        className="matrix-range"
                        defaultValue={displayedWeight}
                        id={`weight-${category.id}`}
                        key={`${weightSliderId}:${displayedWeight}`}
                        max={MAX_WEIGHT}
                        min={MIN_WEIGHT}
                        onBlur={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onChange={(event) =>
                          handleSliderChange(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onFocus={(event) =>
                          handleSliderStart(
                            weightSliderId,
                            displayedWeight,
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onInput={(event) =>
                          handleSliderChange(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onKeyUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onPointerCancel={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onPointerDown={(event) =>
                          handleSliderStart(
                            weightSliderId,
                            displayedWeight,
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        onPointerUp={(event) =>
                          handleSliderEnd(
                            weightSliderId,
                            Number(event.currentTarget.value),
                            (value) => onCategoryWeightChange(category.id, value),
                            weightSliderConfig,
                            undefined,
                            event.currentTarget,
                          )
                        }
                        step="0.1"
                        style={getRangeStyle(displayedWeight, weightSliderConfig)}
                        type="range"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className={labelClass}>{copy.optionRanking}</p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {copy.optionsCount(matrix.options.length)}
                      </p>
                    </div>

                    <div
                      aria-label={copy.optionRankingAria(criterionDisplayName)}
                      role="group"
                    >
                      <Sortable
                        className="criteria-score-rows space-y-2"
                        getItemValue={getOptionId}
                        onValueChange={(nextRankedOptions) =>
                          onCategoryRankingChange(
                            category.id,
                            nextRankedOptions.map((option) => option.id),
                          )
                        }
                        strategy="vertical"
                        value={rankedOptions}
                      >
                        {rankedOptions.map((option, rankIndex) => {
                          const optionIndex = matrix.options.findIndex(
                            (matrixOption) => matrixOption.id === option.id,
                          );
                          const optionDisplayName = getDisplayName(
                            option.name,
                            copy.optionLabel(optionIndex + 1),
                          );
                          const displayedScore =
                            matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;
                          const displayedScoreLabel =
                            formatSliderValue(displayedScore);
                          const scoreRowHighlightClassName = summary.isTie
                            ? 'border-amber-400/50 bg-amber-50/75'
                            : 'border-cyan-400/50 bg-cyan-50/70';

                          return (
                            <SortableItem
                              key={`${option.id}-${category.id}`}
                              value={option.id}
                            >
                              <div
                                className={cn(
                                  'grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md border border-border bg-white/70 p-2.5 sm:gap-3 sm:p-3 md:grid-cols-[auto_minmax(8rem,1fr)_minmax(5.75rem,auto)_auto] md:gap-4',
                                  !areResultsHidden &&
                                    summary.leadingOptionIds.includes(option.id)
                                    ? scoreRowHighlightClassName
                                    : null,
                                )}
                                data-focus-card=""
                                data-scoring-focus-card=""
                                onFocusCapture={(event) =>
                                  revealClosestFocusCard(event.target)
                                }
                              >
                                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                  <span
                                    aria-label={copy.rankPosition(
                                      rankIndex + 1,
                                      optionDisplayName,
                                    )}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950/[0.055] text-xs font-bold text-foreground"
                                  >
                                    {rankIndex + 1}
                                  </span>
                                  <SortableItemHandle
                                    className="inline-flex h-10 w-10 touch-none select-none items-center justify-center rounded-md text-muted-foreground transition hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-8 sm:w-8"
                                    cursor
                                  >
                                    <GripVertical aria-hidden="true" className="h-4 w-4" />
                                    <span className="sr-only">
                                      {copy.dragOption(optionDisplayName)}
                                    </span>
                                  </SortableItemHandle>
                                </div>

                                <span
                                  className="min-w-0 truncate text-sm font-semibold leading-5 text-foreground/85"
                                  title={optionDisplayName}
                                >
                                  {optionDisplayName}
                                </span>

                                <output
                                  aria-label={copy.rankScoreAria(
                                    optionDisplayName,
                                    criterionDisplayName,
                                  )}
                                  className="min-w-10 whitespace-nowrap text-right text-sm font-semibold text-foreground"
                                >
                                  {displayedScoreLabel}
                                </output>

                                <div className="flex items-center gap-1 justify-self-end">
                                  <Button
                                    aria-label={copy.moveOptionUp(
                                      optionDisplayName,
                                      criterionDisplayName,
                                    )}
                                    className="h-8 w-8 rounded-md"
                                    disabled={rankIndex === 0}
                                    onClick={() =>
                                      onCategoryRankingChange(
                                        category.id,
                                        moveRankedOption(
                                          rankedOptions,
                                          option.id,
                                          -1,
                                        ),
                                      )
                                    }
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <ArrowUp aria-hidden="true" className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    aria-label={copy.moveOptionDown(
                                      optionDisplayName,
                                      criterionDisplayName,
                                    )}
                                    className="h-8 w-8 rounded-md"
                                    disabled={rankIndex === rankedOptions.length - 1}
                                    onClick={() =>
                                      onCategoryRankingChange(
                                        category.id,
                                        moveRankedOption(
                                          rankedOptions,
                                          option.id,
                                          1,
                                        ),
                                      )
                                    }
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <ArrowDown aria-hidden="true" className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </SortableItem>
                          );
                        })}
                      </Sortable>
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
          data-criterion-focus-card=""
          data-focus-card=""
          onSubmit={handleAddCategorySubmit}
          ref={pendingCategoryFormRef}
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
