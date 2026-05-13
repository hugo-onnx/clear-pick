import type { CSSProperties } from 'react';
import type { Option } from '../types';
import {
  DEFAULT_SCORE,
  DEFAULT_WEIGHT,
  MAX_SCORE,
  MAX_WEIGHT,
  MIN_SCORE,
  MIN_WEIGHT,
  clampScore,
  clampWeight,
} from './matrix';

export type SliderConfig = {
  min: number;
  max: number;
  fallback: number;
  clamp: (value: number) => number;
};

export const scoreSliderConfig: SliderConfig = {
  min: MIN_SCORE,
  max: MAX_SCORE,
  fallback: DEFAULT_SCORE,
  clamp: clampScore,
};

export const weightSliderConfig: SliderConfig = {
  min: MIN_WEIGHT,
  max: MAX_WEIGHT,
  fallback: DEFAULT_WEIGHT,
  clamp: clampWeight,
};

export function clampVisualValue(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): number {
  if (!Number.isFinite(value)) {
    return config.fallback;
  }
  return Math.min(config.max, Math.max(config.min, value));
}

export function getRangeStyle(
  value: number,
  config: SliderConfig = scoreSliderConfig,
): CSSProperties {
  const clampedValue = Math.max(config.min, Math.min(config.max, value));
  const range = config.max - config.min;
  const progress = range > 0 ? ((clampedValue - config.min) / range) * 100 : 0;

  if (progress <= 0) {
    return { background: 'var(--range-empty, rgba(255, 255, 255, 0.12))' };
  }

  if (progress >= 100) {
    return {
      background:
        'linear-gradient(90deg, var(--range-start, #06b6d4) 0%, var(--range-end, #f97316) 100%)',
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

export function formatSliderValue(
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

export function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

export function getOptionId(option: Option): string {
  return option.id;
}

export function moveRankedOption(
  rankedOptions: Option[],
  optionId: string,
  offset: -1 | 1,
): string[] {
  const currentIndex = rankedOptions.findIndex((option) => option.id === optionId);
  const nextIndex = currentIndex + offset;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= rankedOptions.length) {
    return rankedOptions.map((option) => option.id);
  }

  const nextOptions = [...rankedOptions];
  const [movedOption] = nextOptions.splice(currentIndex, 1);
  nextOptions.splice(nextIndex, 0, movedOption);
  return nextOptions.map((option) => option.id);
}

export function getSliderOutputSelector(sliderId: string): string {
  return `[data-slider-output="${sliderId.replace(/["\\]/g, '\\$&')}"]`;
}

export function updateSliderDisplay(
  sliderId: string,
  value: number,
  config: SliderConfig = scoreSliderConfig,
  formatValue: (value: number) => string = (v) => formatSliderValue(v, config),
  input?: HTMLInputElement | null,
): void {
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
}

export type FocusInputOptions = { reveal?: boolean };

export const smBreakpointWidth = 640;
export const lgBreakpointWidth = 1024;
export const revealRetryDelays = [90, 240, 420];
export const visualViewportRevealMargin = 16;
export const programmaticCriterionWeightFocusTargets = new WeakSet<HTMLElement>();

export function isElementInViewport(element: HTMLElement): boolean {
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

export function getViewportWidth(): number {
  const visualViewportWidth = window.visualViewport?.width;
  return typeof visualViewportWidth === 'number' && visualViewportWidth > 0
    ? visualViewportWidth
    : (window.innerWidth ?? document.documentElement.clientWidth);
}

export function getFocusRevealViewport(): 'mobile' | 'tablet' | 'desktop' {
  const viewportWidth = getViewportWidth();
  if (viewportWidth < smBreakpointWidth) return 'mobile';
  if (viewportWidth < lgBreakpointWidth) return 'tablet';
  return 'desktop';
}

export function getMotionSafeScrollBehavior(): ScrollBehavior {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto';
  }
  return 'smooth';
}

export function getWindowScrollY(): number {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    document.body.scrollTop ??
    0
  );
}

export function getViewportBounds() {
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

  return { bottom: top + height, left, right: left + width, top };
}

export function isElementComfortablyVisible(
  element: HTMLElement,
  margin = visualViewportRevealMargin,
): boolean {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportBounds();
  return (
    rect.top >= viewport.top + margin &&
    rect.left >= viewport.left &&
    rect.bottom <= viewport.bottom - margin &&
    rect.right <= viewport.right
  );
}

export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportBounds();
  return (
    rect.bottom > viewport.top &&
    rect.top < viewport.bottom &&
    rect.right > viewport.left &&
    rect.left < viewport.right
  );
}

export function revealMobileFocusCard(element: HTMLElement): void {
  if (typeof window.scrollTo !== 'function') {
    element.scrollIntoView?.({
      behavior: getMotionSafeScrollBehavior(),
      block: 'start',
      inline: 'nearest',
    });
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
    scrollTo({ behavior, top });
  } catch {
    element.scrollIntoView?.({ behavior, block: 'start', inline: 'nearest' });
  }
}

export function revealFocusCard(
  card: HTMLElement,
  focusedControl?: HTMLElement | null,
): void {
  const behavior = getMotionSafeScrollBehavior();
  const viewport = getFocusRevealViewport();

  if (viewport === 'mobile') {
    revealMobileFocusCard(card);
    return;
  }

  if (viewport === 'tablet' && isElementComfortablyVisible(card)) return;

  if (
    viewport === 'desktop' &&
    (isElementInViewport(card) ||
      (focusedControl && isElementVisible(focusedControl)))
  ) {
    return;
  }

  card.scrollIntoView?.({ behavior, block: 'nearest', inline: 'nearest' });
}

export function nudgeElementIntoVisualViewport(element: HTMLElement): void {
  if (typeof window.scrollBy !== 'function' || !window.visualViewport) return;

  const rect = element.getBoundingClientRect();
  const visibleTop =
    window.visualViewport.offsetTop + visualViewportRevealMargin;
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

  if (Math.abs(scrollDelta) < 1) return;

  window.scrollBy({ behavior: 'auto', top: scrollDelta });
}

export function revealElementIfNeeded(
  element: HTMLElement,
  options: { block?: ScrollLogicalPosition; force?: boolean } = {},
): void {
  const revealElement = () => {
    if (typeof element.scrollIntoView !== 'function') return;

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
    if (!isElementInViewport(element)) revealElement();
  });

  if (options.force) {
    for (const delay of revealRetryDelays) {
      window.setTimeout(() => {
        if (!isElementInViewport(element)) revealElement();
      }, delay);
    }
  }
}

export function revealInputIfNeeded(input: HTMLInputElement): void {
  revealElementIfNeeded(input);
}

export function getFocusCard(element: HTMLElement): HTMLElement | null {
  const card = element.closest('[data-focus-card], [data-option-focus-card]');
  return card instanceof HTMLElement ? card : null;
}

export function focusInputWithoutScrolling(input: HTMLInputElement): void {
  try {
    input.focus({ preventScroll: true });
  } catch {
    input.focus();
  }
}

export function focusCriterionWeightSlider(categoryId: string): boolean {
  const weightSlider = document.getElementById(`weight-${categoryId}`);
  const criterionCard = document.getElementById(`criterion-card-${categoryId}`);

  if (!(weightSlider instanceof HTMLInputElement)) return false;

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

export function focusEntryInput(
  input: HTMLInputElement,
  options: { reveal?: boolean; revealTarget?: HTMLElement | null; select?: boolean } = {},
): void {
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

export function revealClosestFocusCard(target: EventTarget | null): void {
  if (!(target instanceof HTMLElement)) return;

  if (programmaticCriterionWeightFocusTargets.delete(target)) return;

  if (target instanceof HTMLSelectElement && getFocusRevealViewport() === 'mobile') {
    return;
  }

  const revealTarget = getFocusCard(target);
  if (revealTarget) revealFocusCard(revealTarget, target);
}

export function focusInputText(
  input: HTMLInputElement,
  options: FocusInputOptions = {},
): void {
  if (options.reveal) revealInputIfNeeded(input);
  input.focus();
  const end = input.value.length;
  input.setSelectionRange(end, end);
}
