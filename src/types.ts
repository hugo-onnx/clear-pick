export interface Option {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  weight: number;
}

export type ScoresByOption = Record<string, Record<string, number>>;

export interface DecisionMatrix {
  options: Option[];
  categories: Category[];
  scores: ScoresByOption;
}
