import { describe, expect, it } from 'vitest';
import type { DecisionMatrix } from '../types';
import {
  SCORE_MODE_BOOLEAN,
  SCORE_MODE_SCALE,
  createCareerMoveMatrix,
  clampScoreForMode,
  createStarterMatrix,
  isBlankDecisionMatrix,
  normalizeDecisionMatrix,
  synchronizeScores,
} from './matrix';
import { getDecisionSummary } from './scoring';

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

  it('creates the localized career move sample matrix', () => {
    const matrix = createCareerMoveMatrix({
      options: {
        stayCurrentRole: 'Stay in current role',
        acceptNewRole: 'Accept new role',
        startFreelancing: 'Start freelancing',
      },
      criteria: {
        growth: 'Growth',
        compensation: 'Compensation',
        workLifeBalance: 'Work-life balance',
        risk: 'Risk',
      },
    });
    const ids = [
      ...matrix.options.map((option) => option.id),
      ...matrix.categories.map((category) => category.id),
    ];
    const summary = getDecisionSummary(matrix);

    expect(new Set(ids).size).toBe(ids.length);
    expect(matrix.options.map((option) => option.name)).toEqual([
      'Stay in current role',
      'Accept new role',
      'Start freelancing',
    ]);
    expect(matrix.categories.map((category) => category.name)).toEqual([
      'Growth',
      'Compensation',
      'Work-life balance',
      'Risk',
    ]);
    expect(matrix.categories.map((category) => category.weight)).toEqual([
      9, 8, 7, 6,
    ]);
    expect(matrix.scoreModes[matrix.options[0].id]?.[matrix.categories[0].id]).toBe(
      SCORE_MODE_SCALE,
    );
    expect(matrix.scores[matrix.options[1].id]?.[matrix.categories[0].id]).toBe(9);
    expect(matrix.scores[matrix.options[2].id]?.[matrix.categories[3].id]).toBe(3);
    expect(summary.topOption?.name).toBe('Accept new role');
    expect(summary.sortedLeaderContributions[0]?.name).toBe('Growth');
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
});
