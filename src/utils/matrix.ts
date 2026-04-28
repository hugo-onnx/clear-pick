import type { Category, DecisionMatrix, Option, ScoresByOption } from '../types';

export const MIN_SCORE = 1;
export const MAX_SCORE = 10;
export const DEFAULT_SCORE = MIN_SCORE;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_CATEGORIES = 1;

const STARTER_OPTIONS = ['', ''];
const STARTER_CATEGORIES = [{ name: '', weight: DEFAULT_SCORE }];
const LEGACY_BLANK_DEFAULT_SCORES = [0, 50];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SCORE;
  }

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(value)));
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
    weight: clampScore(weight),
  };
}

export function getDisplayName(name: string, fallback: string): string {
  return name.trim() || fallback;
}

function buildScores(
  options: Option[],
  categories: Category[],
  seed: ScoresByOption = {},
  normalizeScore = clampScore,
): ScoresByOption {
  const nextScores: ScoresByOption = {};

  for (const option of options) {
    const optionSeed = isRecord(seed[option.id]) ? seed[option.id] : {};
    nextScores[option.id] = {};

    for (const category of categories) {
      const seededValue = optionSeed[category.id];
      nextScores[option.id][category.id] =
        typeof seededValue === 'number' ? normalizeScore(seededValue) : DEFAULT_SCORE;
    }
  }

  return nextScores;
}

function isLegacyBlankDefaultScore(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    LEGACY_BLANK_DEFAULT_SCORES.includes(Math.round(value))
  );
}

function isLegacyBlankStarterMatrix(value: Record<string, unknown>): boolean {
  const rawOptions = Array.isArray(value.options) ? value.options : [];
  const rawCategories = Array.isArray(value.categories) ? value.categories : [];

  if (
    rawOptions.length !== STARTER_OPTIONS.length ||
    rawCategories.length !== STARTER_CATEGORIES.length
  ) {
    return false;
  }

  const optionIds = rawOptions.map((item) => {
    if (!isRecord(item) || typeof item.id !== 'string' || item.name !== '') {
      return null;
    }

    return item.id;
  });
  const categoryIds = rawCategories.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      item.name !== '' ||
      !isLegacyBlankDefaultScore(item.weight)
    ) {
      return null;
    }

    return item.id;
  });

  if (
    optionIds.some((id) => id === null) ||
    categoryIds.some((id) => id === null)
  ) {
    return false;
  }

  const rawScores = isRecord(value.scores) ? value.scores : {};

  return optionIds.every((optionId) => {
    if (optionId === null) {
      return false;
    }

    const optionScores = rawScores[optionId];

    if (!isRecord(optionScores)) {
      return false;
    }

    return categoryIds.every((categoryId) => {
      if (categoryId === null) {
        return false;
      }

      const score = optionScores[categoryId];
      return isLegacyBlankDefaultScore(score);
    });
  });
}

function hasLegacyPercentageScale(value: Record<string, unknown>): boolean {
  const rawCategories = Array.isArray(value.categories) ? value.categories : [];

  if (
    rawCategories.some(
      (item) =>
        isRecord(item) &&
        typeof item.weight === 'number' &&
        item.weight > MAX_SCORE,
    )
  ) {
    return true;
  }

  const rawScores = isRecord(value.scores) ? value.scores : {};

  return Object.values(rawScores).some((optionScores) => {
    if (!isRecord(optionScores)) {
      return false;
    }

    return Object.values(optionScores).some(
      (score) => typeof score === 'number' && score > MAX_SCORE,
    );
  });
}

function normalizeStoredScore(value: number, usesLegacyPercentageScale: boolean): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SCORE;
  }

  if (usesLegacyPercentageScale) {
    return clampScore(value / 10);
  }

  return clampScore(value);
}

export function synchronizeScores(matrix: DecisionMatrix): DecisionMatrix {
  return {
    ...matrix,
    categories: matrix.categories.map((category) => ({
      ...category,
      weight: clampScore(category.weight),
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

  if (isLegacyBlankStarterMatrix(value)) {
    return createStarterMatrix();
  }

  const rawOptions = Array.isArray(value.options) ? value.options : [];
  const rawCategories = Array.isArray(value.categories) ? value.categories : [];
  const usesLegacyPercentageScale = hasLegacyPercentageScale(value);

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
      const name =
        typeof item.name === 'string' ? item.name : `Criterion ${index + 1}`;
      const weight =
        typeof item.weight === 'number'
          ? normalizeStoredScore(item.weight, usesLegacyPercentageScale)
          : DEFAULT_SCORE;
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
    scores: buildScores(options, categories, rawScores, (score) =>
      normalizeStoredScore(score, usesLegacyPercentageScale),
    ),
  };
}
