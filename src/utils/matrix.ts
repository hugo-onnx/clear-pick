import type { Category, DecisionMatrix, Option, ScoresByOption } from '../types';

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;
export const DEFAULT_SCORE = MIN_SCORE;
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 10;
export const DEFAULT_WEIGHT = MIN_WEIGHT;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
export const MIN_CATEGORIES = 1;

const STARTER_OPTIONS = ['', ''];
const STARTER_CATEGORIES = [{ name: '', weight: DEFAULT_WEIGHT }];
const BLANK_STARTER_WEIGHT_VALUES = [0, 1, 50];
const BLANK_STARTER_SCORE_VALUES = [0, 1, 50];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SCORE;
  }

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(value)));
}

export function clampWeight(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_WEIGHT;
  }

  return Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, Math.round(value)));
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

export function createCategory(name: string, weight = DEFAULT_WEIGHT): Category {
  return {
    id: createId(),
    name,
    weight: clampWeight(weight),
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

function isBlankStarterWeightValue(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    BLANK_STARTER_WEIGHT_VALUES.includes(Math.round(value))
  );
}

function isBlankStarterScoreValue(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    BLANK_STARTER_SCORE_VALUES.includes(Math.round(value))
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
  const categoryEntries = rawCategories.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      item.name !== '' ||
      !isBlankStarterWeightValue(item.weight)
    ) {
      return null;
    }

    return {
      id: item.id,
      weight: Math.round(item.weight),
    };
  });

  if (
    optionIds.some((id) => id === null) ||
    categoryEntries.some((entry) => entry === null)
  ) {
    return false;
  }

  const rawScores = isRecord(value.scores) ? value.scores : {};
  const scoreValues: number[] = [];

  const hasOnlyBlankScores = optionIds.every((optionId) => {
    if (optionId === null) {
      return false;
    }

    const optionScores = rawScores[optionId];

    if (!isRecord(optionScores)) {
      return false;
    }

    return categoryEntries.every((categoryEntry) => {
      if (categoryEntry === null) {
        return false;
      }

      const score = optionScores[categoryEntry.id];

      if (!isBlankStarterScoreValue(score)) {
        return false;
      }

      scoreValues.push(Math.round(score));
      return true;
    });
  });

  if (!hasOnlyBlankScores) {
    return false;
  }

  const usesCurrentStarterDefaults =
    categoryEntries.every(
      (categoryEntry) => categoryEntry?.weight === DEFAULT_WEIGHT,
    ) && scoreValues.every((score) => score === DEFAULT_SCORE);

  return !usesCurrentStarterDefaults;
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

function normalizeStoredWeight(value: number, usesLegacyPercentageScale: boolean): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_WEIGHT;
  }

  if (usesLegacyPercentageScale) {
    return clampWeight(value / 10);
  }

  return clampWeight(value);
}

export function synchronizeScores(matrix: DecisionMatrix): DecisionMatrix {
  return {
    ...matrix,
    categories: matrix.categories.map((category) => ({
      ...category,
      weight: clampWeight(category.weight),
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
          ? normalizeStoredWeight(item.weight, usesLegacyPercentageScale)
          : DEFAULT_WEIGHT;
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
