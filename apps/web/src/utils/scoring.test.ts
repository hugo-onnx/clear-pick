import { describe, expect, it } from 'vitest';
import type { DecisionMatrix } from '../types';
import { SCORE_MODE_SCALE } from './matrix';
import { getDecisionSummary } from './scoring';

function createMatrix(overrides?: Partial<DecisionMatrix>): DecisionMatrix {
  return {
    options: [
      { id: 'stay', name: 'Stay' },
      { id: 'go', name: 'Go' },
    ],
    categories: [
      { id: 'growth', name: 'Growth', weight: 6, scoreMode: SCORE_MODE_SCALE },
      { id: 'balance', name: 'Balance', weight: 4, scoreMode: SCORE_MODE_SCALE },
    ],
    scoreModes: {
      stay: {
        growth: SCORE_MODE_SCALE,
        balance: SCORE_MODE_SCALE,
      },
      go: {
        growth: SCORE_MODE_SCALE,
        balance: SCORE_MODE_SCALE,
      },
    },
    scores: {
      stay: {
        growth: 6,
        balance: 8,
      },
      go: {
        growth: 9,
        balance: 5,
      },
    },
    ...overrides,
  };
}

describe('getDecisionSummary', () => {
  it('normalizes category weights and ranks options', () => {
    const summary = getDecisionSummary(createMatrix());

    expect(summary.totalWeight).toBe(10);
    expect(summary.categoryInfluence[0]?.normalizedWeight).toBeCloseTo(0.6);
    expect(summary.rankedOptions[0]?.name).toBe('Go');
    expect(summary.rankedOptions[0]?.total).toBeCloseTo(7.4);
    expect(summary.rankedOptions[1]?.total).toBeCloseTo(6.8);
    expect(summary.topOption?.name).toBe('Go');
    expect(summary.runnerUpOption?.name).toBe('Stay');
    expect(summary.scoreGap).toBeCloseTo(0.6);
    expect(summary.leaderContributions[0]).toMatchObject({
      id: 'growth',
      score: 9,
    });
    expect(summary.leaderContributions[0]?.contribution).toBeCloseTo(5.4);
    expect(summary.leaderContributions[1]).toMatchObject({
      id: 'balance',
      score: 5,
    });
    expect(summary.leaderContributions[1]?.contribution).toBeCloseTo(2);
    expect(summary.sortedLeaderContributions[0]?.id).toBe('growth');
  });

  it('excludes zero-weight criteria from normalized scoring', () => {
    const summary = getDecisionSummary(
      createMatrix({
        categories: [
          { id: 'growth', name: 'Growth', weight: 0, scoreMode: SCORE_MODE_SCALE },
          { id: 'balance', name: 'Balance', weight: 10, scoreMode: SCORE_MODE_SCALE },
        ],
      }),
    );

    expect(summary.totalWeight).toBe(10);
    expect(summary.categoryInfluence[0]?.normalizedWeight).toBe(0);
    expect(summary.categoryInfluence[1]?.normalizedWeight).toBe(1);
    expect(summary.rankedOptions[0]?.name).toBe('Stay');
    expect(summary.rankedOptions[0]?.total).toBeCloseTo(8);
    expect(summary.rankedOptions[1]?.total).toBeCloseTo(5);
  });

  it('returns zero totals and no active recommendation when all weights are zero', () => {
    const summary = getDecisionSummary(
      createMatrix({
        categories: [
          { id: 'growth', name: 'Growth', weight: 0, scoreMode: SCORE_MODE_SCALE },
          { id: 'balance', name: 'Balance', weight: 0, scoreMode: SCORE_MODE_SCALE },
        ],
      }),
    );

    expect(summary.totalWeight).toBe(0);
    expect(summary.hasScoringBasis).toBe(false);
    expect(summary.isTie).toBe(false);
    expect(summary.leadingOptionIds).toHaveLength(0);
    expect(summary.scoreGap).toBe(0);
    expect(summary.rankedOptions.map((option) => option.total)).toEqual([0, 0]);
  });

  it('detects ties from raw totals', () => {
    const summary = getDecisionSummary(
      createMatrix({
        scores: {
          stay: {
            growth: 8,
            balance: 6,
          },
          go: {
            growth: 6,
            balance: 9,
          },
        },
      }),
    );

    expect(summary.hasScoringBasis).toBe(true);
    expect(summary.isTie).toBe(true);
    expect(summary.leadingOptionIds).toHaveLength(2);
    expect(summary.scoreGap).toBeCloseTo(0);
    expect(summary.rankedOptions[0]?.total).toBeCloseTo(summary.rankedOptions[1]?.total);
  });
});
