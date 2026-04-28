export interface Option {
  id: string;
  name: string;
}

export type ScoreMode = 'scale' | 'boolean';

export interface Category {
  id: string;
  name: string;
  weight: number;
  scoreMode: ScoreMode;
}

export type ScoresByOption = Record<string, Record<string, number>>;
export type ScoreModesByOption = Record<string, Record<string, ScoreMode>>;

export interface DecisionMatrix {
  options: Option[];
  categories: Category[];
  scores: ScoresByOption;
  scoreModes: ScoreModesByOption;
}
