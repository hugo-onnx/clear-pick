import { describe, expect, it } from 'vitest';
import type { DecisionMatrix } from '../types';
import { getDecisionSummary } from './scoring';

function createMatrix(overrides?: Partial<DecisionMatrix>): DecisionMatrix {
  return {
    title: 'Test decision',
    updatedAt: '2026-04-17T10:00:00.000Z',
    options: [
      { id: 'stay', name: 'Stay' },
      { id: 'go', name: 'Go' },
    ],
    categories: [
      { id: 'growth', name: 'Growth', weight: 60 },
      { id: 'balance', name: 'Balance', weight: 40 },
    ],
    scores: {
      stay: {
        growth: 60,
        balance: 80,
      },
      go: {
        growth: 90,
        balance: 50,
      },
    },
    ...overrides,
  };
}

describe('getDecisionSummary', () => {
  it('normalizes category weights and ranks options', () => {
    const summary = getDecisionSummary(createMatrix());

    expect(summary.totalWeight).toBe(100);
    expect(summary.categoryInfluence[0]?.normalizedWeight).toBeCloseTo(0.6);
    expect(summary.rankedOptions[0]?.name).toBe('Go');
    expect(summary.rankedOptions[0]?.total).toBeCloseTo(74);
    expect(summary.rankedOptions[1]?.total).toBeCloseTo(68);
  });

  it('returns zero totals and no active recommendation when all weights are zero', () => {
    const summary = getDecisionSummary(
      createMatrix({
        categories: [
          { id: 'growth', name: 'Growth', weight: 0 },
          { id: 'balance', name: 'Balance', weight: 0 },
        ],
      }),
    );

    expect(summary.totalWeight).toBe(0);
    expect(summary.hasScoringBasis).toBe(false);
    expect(summary.isTie).toBe(false);
    expect(summary.rankedOptions.map((option) => option.total)).toEqual([0, 0]);
  });

  it('detects ties from raw totals', () => {
    const summary = getDecisionSummary(
      createMatrix({
        scores: {
          stay: {
            growth: 80,
            balance: 60,
          },
          go: {
            growth: 60,
            balance: 90,
          },
        },
      }),
    );

    expect(summary.hasScoringBasis).toBe(true);
    expect(summary.isTie).toBe(true);
    expect(summary.leadingOptionIds).toHaveLength(2);
    expect(summary.rankedOptions[0]?.total).toBeCloseTo(summary.rankedOptions[1]?.total);
  });
});
