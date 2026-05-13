import type {
  Category,
  DecisionMatrix,
  Option,
  ScoreMode,
  ScoreModesByOption,
  ScoresByOption,
} from '../types';

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;
export const DEFAULT_SCORE = MIN_SCORE;
export const SCORE_MODE_SCALE: ScoreMode = 'scale';
export const SCORE_MODE_BOOLEAN: ScoreMode = 'boolean';
export const DEFAULT_SCORE_MODE = SCORE_MODE_SCALE;
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

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));
}

export function normalizeScoreMode(value: unknown): ScoreMode {
  return value === SCORE_MODE_BOOLEAN ? SCORE_MODE_BOOLEAN : SCORE_MODE_SCALE;
}

export function clampScoreForMode(
  value: number,
  scoreMode: ScoreMode = DEFAULT_SCORE_MODE,
): number {
  if (scoreMode === SCORE_MODE_BOOLEAN) {
    return clampScore(value) >= 5 ? MAX_SCORE : MIN_SCORE;
  }

  return clampScore(value);
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

export function createCategory(
  name: string,
  weight = DEFAULT_WEIGHT,
  scoreMode: ScoreMode = DEFAULT_SCORE_MODE,
): Category {
  return {
    id: createId(),
    name,
    weight: clampWeight(weight),
    scoreMode,
  };
}

export function getDisplayName(name: string, fallback: string): string {
  return name.trim() || fallback;
}

export function getInterpolatedRankScore(
  rankIndex: number,
  optionCount: number,
): number {
  if (optionCount <= 1) {
    return MAX_SCORE;
  }

  return clampScore(
    MAX_SCORE -
      ((MAX_SCORE - MIN_SCORE) * Math.max(0, rankIndex)) /
        (optionCount - 1),
  );
}

function getScoreForCategory(
  matrix: DecisionMatrix,
  optionId: string,
  categoryId: string,
): number {
  return clampScore(matrix.scores[optionId]?.[categoryId] ?? DEFAULT_SCORE);
}

function hasCategoryScoreSpread(
  matrix: DecisionMatrix,
  categoryId: string,
): boolean {
  const scores = matrix.options.map((option) =>
    getScoreForCategory(matrix, option.id, categoryId),
  );
  const firstScore = scores[0] ?? DEFAULT_SCORE;

  return scores.some((score) => score !== firstScore);
}

export function getRankedOptionsForCategory(
  matrix: DecisionMatrix,
  categoryId: string,
): Option[] {
  const optionIndexes = new Map(
    matrix.options.map((option, index) => [option.id, index]),
  );

  return [...matrix.options].sort((left, right) => {
    const scoreDifference =
      getScoreForCategory(matrix, right.id, categoryId) -
      getScoreForCategory(matrix, left.id, categoryId);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (optionIndexes.get(left.id) ?? 0) - (optionIndexes.get(right.id) ?? 0);
  });
}

export function applyRankingScores(
  matrix: DecisionMatrix,
  categoryId: string,
  rankedOptionIds: string[],
): DecisionMatrix {
  const knownOptionIds = new Set(matrix.options.map((option) => option.id));
  const orderedOptionIds = [
    ...rankedOptionIds.filter((optionId) => knownOptionIds.has(optionId)),
    ...matrix.options
      .map((option) => option.id)
      .filter((optionId) => !rankedOptionIds.includes(optionId)),
  ];
  const scoresByOptionId = new Map(
    orderedOptionIds.map((optionId, index) => [
      optionId,
      getInterpolatedRankScore(index, orderedOptionIds.length),
    ]),
  );

  return {
    ...matrix,
    categories: matrix.categories.map((category) =>
      category.id === categoryId
        ? { ...category, scoreMode: SCORE_MODE_SCALE }
        : category,
    ),
    scoreModes: matrix.options.reduce<ScoreModesByOption>((scoreModes, option) => {
      scoreModes[option.id] = {
        ...(matrix.scoreModes[option.id] ?? {}),
        [categoryId]: SCORE_MODE_SCALE,
      };

      return scoreModes;
    }, { ...matrix.scoreModes }),
    scores: matrix.options.reduce<ScoresByOption>((scores, option) => {
      scores[option.id] = {
        ...(matrix.scores[option.id] ?? {}),
        [categoryId]: scoresByOptionId.get(option.id) ?? DEFAULT_SCORE,
      };

      return scores;
    }, { ...matrix.scores }),
  };
}

export function refreshRankedCategoryScores(
  matrix: DecisionMatrix,
  categoryIds = matrix.categories.map((category) => category.id),
): DecisionMatrix {
  return categoryIds.reduce((current, categoryId) => {
    if (!hasCategoryScoreSpread(current, categoryId)) {
      return current;
    }

    return applyRankingScores(
      current,
      categoryId,
      getRankedOptionsForCategory(current, categoryId).map((option) => option.id),
    );
  }, matrix);
}

export function getScoreModeForCell(
  matrix: DecisionMatrix,
  optionId: string,
  categoryId: string,
): ScoreMode {
  const categoryScoreMode = matrix.categories.find(
    (category) => category.id === categoryId,
  )?.scoreMode;

  return normalizeScoreMode(
    matrix.scoreModes?.[optionId]?.[categoryId] ?? categoryScoreMode,
  );
}

export function isBlankDecisionMatrix(matrix: DecisionMatrix): boolean {
  const hasOnlyBlankOptions = matrix.options.every(
    (option) => option.name.trim().length === 0,
  );
  const hasOnlyBlankCategories = matrix.categories.every(
    (category) =>
      category.name.trim().length === 0 &&
      clampWeight(category.weight) === DEFAULT_WEIGHT &&
      normalizeScoreMode(category.scoreMode) === DEFAULT_SCORE_MODE,
  );

  if (!hasOnlyBlankOptions || !hasOnlyBlankCategories) {
    return false;
  }

  return matrix.options.every((option) =>
    matrix.categories.every((category) => {
      const score = matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;
      const scoreMode =
        matrix.scoreModes?.[option.id]?.[category.id] ?? category.scoreMode;

      return (
        clampScore(score) === DEFAULT_SCORE &&
        normalizeScoreMode(scoreMode) === DEFAULT_SCORE_MODE
      );
    }),
  );
}

function buildScoreModes(
  options: Option[],
  categories: Category[],
  seed: ScoreModesByOption = {},
): ScoreModesByOption {
  const nextScoreModes: ScoreModesByOption = {};

  for (const option of options) {
    const optionSeed = isRecord(seed[option.id]) ? seed[option.id] : {};
    nextScoreModes[option.id] = {};

    for (const category of categories) {
      nextScoreModes[option.id][category.id] = normalizeScoreMode(
        optionSeed[category.id] ?? category.scoreMode,
      );
    }
  }

  return nextScoreModes;
}

function buildScores(
  options: Option[],
  categories: Category[],
  seed: ScoresByOption = {},
  scoreModes: ScoreModesByOption = {},
  normalizeScore = (
    value: number,
    category: Category,
    scoreMode: ScoreMode,
  ) => clampScoreForMode(value, scoreMode),
): ScoresByOption {
  const nextScores: ScoresByOption = {};

  for (const option of options) {
    const optionSeed = isRecord(seed[option.id]) ? seed[option.id] : {};
    nextScores[option.id] = {};

    for (const category of categories) {
      const seededValue = optionSeed[category.id];
      const scoreMode =
        scoreModes[option.id]?.[category.id] ?? category.scoreMode;
      nextScores[option.id][category.id] =
        typeof seededValue === 'number'
          ? normalizeScore(seededValue, category, scoreMode)
          : DEFAULT_SCORE;
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
  const categories = matrix.categories.map((category) => ({
    ...category,
    weight: clampWeight(category.weight),
    scoreMode: normalizeScoreMode(category.scoreMode),
  }));
  const scoreModes = buildScoreModes(
    matrix.options,
    categories,
    matrix.scoreModes,
  );

  return {
    ...matrix,
    categories,
    scoreModes,
    scores: buildScores(matrix.options, categories, matrix.scores, scoreModes),
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
  const scoreModes = buildScoreModes(options, categories);

  return {
    options,
    categories,
    scores,
    scoreModes,
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
      const scoreMode = normalizeScoreMode(item.scoreMode);
      return { id, name, weight, scoreMode };
    })
    .filter((item): item is Category => item !== null);

  if (options.length < MIN_OPTIONS || categories.length < MIN_CATEGORIES) {
    return createStarterMatrix();
  }

  const rawScores = isRecord(value.scores) ? (value.scores as ScoresByOption) : {};
  const rawScoreModes = isRecord(value.scoreModes)
    ? (value.scoreModes as ScoreModesByOption)
    : {};
  const scoreModes = buildScoreModes(options, categories, rawScoreModes);

  return {
    options,
    categories,
    scoreModes,
    scores: buildScores(
      options,
      categories,
      rawScores,
      scoreModes,
      (score, category, scoreMode) =>
        clampScoreForMode(
          normalizeStoredScore(score, usesLegacyPercentageScale),
          scoreMode,
        ),
    ),
  };
}
