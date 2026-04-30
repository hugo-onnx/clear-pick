import type { DecisionMatrix } from '../types';
import { createStarterMatrix, normalizeDecisionMatrix } from './matrix';

export const STORAGE_KEY = 'weighted-matrix:active-decision:v1';
export const ONBOARDING_DISMISSAL_STORAGE_KEY =
  'weighted-matrix:onboarding-dismissed:v1';

export function loadActiveDecision(): DecisionMatrix {
  if (typeof window === 'undefined') {
    return createStarterMatrix();
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return createStarterMatrix();
    }

    return normalizeDecisionMatrix(JSON.parse(rawValue));
  } catch {
    return createStarterMatrix();
  }
}

export function saveActiveDecision(matrix: DecisionMatrix): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
  } catch {
    // Ignore storage errors and keep the in-memory session alive.
  }
}

export function loadOnboardingDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(ONBOARDING_DISMISSAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveOnboardingDismissed(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ONBOARDING_DISMISSAL_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage errors and keep the hint local to the in-memory session.
  }
}
