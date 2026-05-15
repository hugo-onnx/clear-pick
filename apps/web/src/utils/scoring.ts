import type { DecisionMatrix } from '../types';
import { DEFAULT_SCORE, getDisplayName } from './matrix';

export interface RankedOption {
  id: string;
  name: string;
  total: number;
}

export interface CategoryInfluence {
  id: string;
  name: string;
  rawWeight: number;
  normalizedWeight: number;
}

export interface CriterionContribution extends CategoryInfluence {
  score: number;
  contribution: number;
}

export interface DecisionSummary {
  rankedOptions: RankedOption[];
  categoryInfluence: CategoryInfluence[];
  topOption: RankedOption | null;
  runnerUpOption: RankedOption | null;
  scoreGap: number;
  leaderContributions: CriterionContribution[];
  sortedLeaderContributions: CriterionContribution[];
  totalWeight: number;
  hasScoringBasis: boolean;
  isTie: boolean;
  leadingOptionIds: string[];
}

const EPSILON = 0.000001;

function getPositiveWeight(weight: number): number {
  return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

export function getTotalWeight(matrix: DecisionMatrix): number {
  return matrix.categories.reduce(
    (sum, category) => sum + getPositiveWeight(category.weight),
    0,
  );
}

export function getDecisionSummary(matrix: DecisionMatrix): DecisionSummary {
  const totalWeight = getTotalWeight(matrix);
  const hasScoringBasis =
    matrix.options.length > 0 && matrix.categories.length > 0 && totalWeight > 0;

  const categoryInfluence = matrix.categories.map((category, index) => ({
    id: category.id,
    name: getDisplayName(category.name, `Criterion ${index + 1}`),
    rawWeight: category.weight,
    normalizedWeight:
      totalWeight > 0 ? getPositiveWeight(category.weight) / totalWeight : 0,
  }));

  const rankedOptions = matrix.options
    .map((option, optionIndex) => {
      const total = matrix.categories.reduce((sum, category, categoryIndex) => {
        const normalizedWeight =
          categoryInfluence[categoryIndex]?.normalizedWeight ?? 0;
        const score = matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;
        return sum + normalizedWeight * score;
      }, 0);

      return {
        id: option.id,
        name: getDisplayName(option.name, `Option ${optionIndex + 1}`),
        total,
      };
    })
    .sort((left, right) => right.total - left.total);

  const topOption = rankedOptions[0] ?? null;
  const runnerUpOption = rankedOptions[1] ?? null;
  const topTotal = topOption?.total ?? 0;
  const leadingOptionIds = hasScoringBasis
    ? rankedOptions
        .filter((option) => Math.abs(option.total - topTotal) < EPSILON)
        .map((option) => option.id)
    : [];
  const leaderContributions = topOption
    ? categoryInfluence.map((category) => {
        const score =
          matrix.scores[topOption.id]?.[category.id] ?? DEFAULT_SCORE;

        return {
          ...category,
          score,
          contribution: category.normalizedWeight * score,
        };
      })
    : [];
  const sortedLeaderContributions = [...leaderContributions].sort(
    (left, right) => right.contribution - left.contribution,
  );

  return {
    rankedOptions,
    categoryInfluence,
    topOption,
    runnerUpOption,
    scoreGap:
      topOption && runnerUpOption
        ? Math.max(0, topOption.total - runnerUpOption.total)
        : 0,
    leaderContributions,
    sortedLeaderContributions,
    totalWeight,
    hasScoringBasis,
    isTie: hasScoringBasis && leadingOptionIds.length > 1,
    leadingOptionIds,
  };
}
