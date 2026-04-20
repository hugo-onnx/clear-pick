import type { DecisionMatrix } from '../types';
import { createStarterMatrix, normalizeDecisionMatrix } from './matrix';

export const STORAGE_KEY = 'weighted-matrix:active-decision:v1';

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
