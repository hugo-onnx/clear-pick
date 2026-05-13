import { describe, expect, it } from 'vitest';
import type { DecisionMatrix } from '../types';
import {
  SCORE_MODE_BOOLEAN,
  SCORE_MODE_SCALE,
  applyRankingScores,
  clampScoreForMode,
  createStarterMatrix,
  getInterpolatedRankScore,
  getRankedOptionsForCategory,
  isBlankDecisionMatrix,
  normalizeDecisionMatrix,
  refreshRankedCategoryScores,
  synchronizeScores,
} from './matrix';

const storedOptions = [
  { id: 'stay', name: 'Stay' },
  { id: 'go', name: 'Go' },
];

describe('matrix normalization', () => {
  it('defaults old stored criteria to scale scoring', () => {
    const matrix = normalizeDecisionMatrix({
      options: storedOptions,
      categories: [{ id: 'fit', name: 'Fit', weight: 7 }],
      scores: {
        stay: { fit: 6 },
        go: { fit: 3 },
      },
    });

    expect(matrix.categories[0]?.scoreMode).toBe(SCORE_MODE_SCALE);
    expect(matrix.scoreModes.stay?.fit).toBe(SCORE_MODE_SCALE);
    expect(matrix.scoreModes.go?.fit).toBe(SCORE_MODE_SCALE);
    expect(matrix.scores.stay?.fit).toBe(6);
    expect(matrix.scores.go?.fit).toBe(3);
  });

  it('migrates boolean criteria into per-option scoring modes', () => {
    const matrix = normalizeDecisionMatrix({
      options: storedOptions,
      categories: [
        {
          id: 'eligible',
          name: 'Eligible',
          weight: 10,
          scoreMode: SCORE_MODE_BOOLEAN,
        },
      ],
      scores: {
        stay: { eligible: 4 },
        go: { eligible: 5 },
      },
    });

    expect(matrix.categories[0]?.scoreMode).toBe(SCORE_MODE_BOOLEAN);
    expect(matrix.scoreModes.stay?.eligible).toBe(SCORE_MODE_BOOLEAN);
    expect(matrix.scoreModes.go?.eligible).toBe(SCORE_MODE_BOOLEAN);
    expect(matrix.scores.stay?.eligible).toBe(0);
    expect(matrix.scores.go?.eligible).toBe(10);
  });

  it('creates starter criteria as scale scoring', () => {
    const matrix = createStarterMatrix();

    expect(matrix.categories[0]?.scoreMode).toBe(SCORE_MODE_SCALE);
    expect(matrix.scoreModes[matrix.options[0].id]?.[matrix.categories[0].id]).toBe(
      SCORE_MODE_SCALE,
    );
    expect(isBlankDecisionMatrix(matrix)).toBe(true);
  });

  it('detects when a starter matrix is no longer blank', () => {
    const namedOption = createStarterMatrix();
    namedOption.options[0].name = 'Remote role';

    const weightedCriterion = createStarterMatrix();
    weightedCriterion.categories[0].weight = 1;

    const scoredOption = createStarterMatrix();
    scoredOption.scores[scoredOption.options[0].id][scoredOption.categories[0].id] =
      1;

    expect(isBlankDecisionMatrix(namedOption)).toBe(false);
    expect(isBlankDecisionMatrix(weightedCriterion)).toBe(false);
    expect(isBlankDecisionMatrix(scoredOption)).toBe(false);
  });

  it('uses a five-point threshold when converting scores to boolean scoring', () => {
    expect(clampScoreForMode(4, SCORE_MODE_BOOLEAN)).toBe(0);
    expect(clampScoreForMode(5, SCORE_MODE_BOOLEAN)).toBe(10);
    expect(clampScoreForMode(10, SCORE_MODE_BOOLEAN)).toBe(10);
  });

  it('synchronizes scores using each option criterion scoring mode', () => {
    const matrix: DecisionMatrix = {
      options: storedOptions,
      categories: [
        {
          id: 'eligible',
          name: 'Eligible',
          weight: 10,
          scoreMode: SCORE_MODE_SCALE,
        },
      ],
      scores: {
        stay: { eligible: 2 },
        go: { eligible: 8 },
      },
      scoreModes: {
        stay: { eligible: SCORE_MODE_BOOLEAN },
        go: { eligible: SCORE_MODE_SCALE },
      },
    };

    const synchronized = synchronizeScores(matrix);

    expect(synchronized.scores.stay?.eligible).toBe(0);
    expect(synchronized.scores.go?.eligible).toBe(8);
    expect(synchronized.scoreModes.stay?.eligible).toBe(SCORE_MODE_BOOLEAN);
    expect(synchronized.scoreModes.go?.eligible).toBe(SCORE_MODE_SCALE);
  });

  it('interpolates ranking scores linearly across option counts', () => {
    expect([0, 1].map((rank) => getInterpolatedRankScore(rank, 2))).toEqual([
      10,
      0,
    ]);
    expect([0, 1, 2].map((rank) => getInterpolatedRankScore(rank, 3))).toEqual([
      10,
      5,
      0,
    ]);
    expect(getInterpolatedRankScore(0, 4)).toBeCloseTo(10);
    expect(getInterpolatedRankScore(1, 4)).toBeCloseTo(6.6666666667);
    expect(getInterpolatedRankScore(2, 4)).toBeCloseTo(3.3333333333);
    expect(getInterpolatedRankScore(3, 4)).toBeCloseTo(0);
  });

  it('applies ranked option order as interpolated criterion scores', () => {
    const matrix = createStarterMatrix();
    const categoryId = matrix.categories[0].id;
    const [firstOption, secondOption] = matrix.options;

    const ranked = applyRankingScores(matrix, categoryId, [
      secondOption.id,
      firstOption.id,
    ]);

    expect(ranked.scores[secondOption.id]?.[categoryId]).toBe(10);
    expect(ranked.scores[firstOption.id]?.[categoryId]).toBe(0);
    expect(ranked.scoreModes[secondOption.id]?.[categoryId]).toBe(
      SCORE_MODE_SCALE,
    );
  });

  it('orders saved score rankings without rewriting until refreshed', () => {
    const matrix = createStarterMatrix();
    const categoryId = matrix.categories[0].id;
    matrix.scores[matrix.options[0].id][categoryId] = 4;
    matrix.scores[matrix.options[1].id][categoryId] = 9;

    expect(
      getRankedOptionsForCategory(matrix, categoryId).map((option) => option.id),
    ).toEqual([matrix.options[1].id, matrix.options[0].id]);
    expect(matrix.scores[matrix.options[0].id]?.[categoryId]).toBe(4);
    expect(matrix.scores[matrix.options[1].id]?.[categoryId]).toBe(9);

    const refreshed = refreshRankedCategoryScores(matrix);
    expect(refreshed.scores[matrix.options[1].id]?.[categoryId]).toBe(10);
    expect(refreshed.scores[matrix.options[0].id]?.[categoryId]).toBe(0);
  });
});
