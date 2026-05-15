import { describe, expect, it } from 'vitest';
import type { Option } from '../types';
import { createQuickDecisionOptionsFromMatrixOptions } from './quickDecider';

describe('quick decider utilities', () => {
  it('creates quick options from named matrix options with trimmed names and a six-option cap', () => {
    const matrixOptions: Option[] = [
      { id: 'matrix-1', name: '  Alpha  ' },
      { id: 'matrix-2', name: '' },
      { id: 'matrix-3', name: 'Bravo' },
      { id: 'matrix-4', name: '   ' },
      { id: 'matrix-5', name: 'Charlie' },
      { id: 'matrix-6', name: 'Delta' },
      { id: 'matrix-7', name: 'Echo' },
      { id: 'matrix-8', name: 'Foxtrot' },
      { id: 'matrix-9', name: 'Golf' },
    ];

    const quickOptions =
      createQuickDecisionOptionsFromMatrixOptions(matrixOptions);

    expect(quickOptions.map((option) => option.name)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
      'Delta',
      'Echo',
      'Foxtrot',
    ]);
    expect(quickOptions.map((option) => option.id)).not.toEqual(
      matrixOptions.slice(0, 6).map((option) => option.id),
    );
  });
});
