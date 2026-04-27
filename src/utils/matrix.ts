import type { Category, DecisionMatrix, Option, ScoresByOption } from '../types';

export const DEFAULT_SCORE = 50;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_CATEGORIES = 1;

const STARTER_OPTIONS = ['', ''];
const STARTER_CATEGORIES = [{ name: '', weight: DEFAULT_SCORE }];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `matrix-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createOption(name: string): Option {
  return {
    id: createId(),
    name,
  };
}

export function createCategory(name: string, weight = DEFAULT_SCORE): Category {
  return {
    id: createId(),
    name,
    weight: clampPercentage(weight),
  };
}

export function getDisplayName(name: string, fallback: string): string {
  return name.trim() || fallback;
}

function buildScores(
  options: Option[],
  categories: Category[],
  seed: ScoresByOption = {},
): ScoresByOption {
  const nextScores: ScoresByOption = {};

  for (const option of options) {
    const optionSeed = isRecord(seed[option.id]) ? seed[option.id] : {};
    nextScores[option.id] = {};

    for (const category of categories) {
      const seededValue = optionSeed[category.id];
      nextScores[option.id][category.id] =
        typeof seededValue === 'number' ? clampPercentage(seededValue) : DEFAULT_SCORE;
    }
  }

  return nextScores;
}

export function synchronizeScores(matrix: DecisionMatrix): DecisionMatrix {
  return {
    ...matrix,
    categories: matrix.categories.map((category) => ({
      ...category,
      weight: clampPercentage(category.weight),
    })),
    scores: buildScores(matrix.options, matrix.categories, matrix.scores),
  };
}

export function createStarterMatrix(): DecisionMatrix {
  const options = STARTER_OPTIONS.map((name) => createOption(name));
  const categories = STARTER_CATEGORIES.map((category) =>
    createCategory(category.name, category.weight),
  );

  const scores: ScoresByOption = {};

  options.forEach((option, optionIndex) => {
    scores[option.id] = {};
    categories.forEach((category, categoryIndex) => {
      scores[option.id][category.id] = DEFAULT_SCORE;
    });
  });

  return {
    options,
    categories,
    scores,
  };
}

export function normalizeDecisionMatrix(value: unknown): DecisionMatrix {
  if (!isRecord(value)) {
    return createStarterMatrix();
  }

  const rawOptions = Array.isArray(value.options) ? value.options : [];
  const rawCategories = Array.isArray(value.categories) ? value.categories : [];

  const options = rawOptions
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = typeof item.id === 'string' && item.id ? item.id : createId();
      const name = typeof item.name === 'string' ? item.name : `Option ${index + 1}`;
      return { id, name };
    })
    .filter((item): item is Option => item !== null);

  const categories = rawCategories
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = typeof item.id === 'string' && item.id ? item.id : createId();
      const name = typeof item.name === 'string' ? item.name : `Category ${index + 1}`;
      const weight =
        typeof item.weight === 'number' ? clampPercentage(item.weight) : DEFAULT_SCORE;
      return { id, name, weight };
    })
    .filter((item): item is Category => item !== null);

  if (options.length < MIN_OPTIONS || categories.length < MIN_CATEGORIES) {
    return createStarterMatrix();
  }

  const rawScores = isRecord(value.scores) ? (value.scores as ScoresByOption) : {};

  return {
    options,
    categories,
    scores: buildScores(options, categories, rawScores),
  };
}
