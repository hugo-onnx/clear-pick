import type { TranslationCopy } from '../i18n';
import type { DecisionMatrix } from '../types';
import type { DecisionSummary } from '../utils/scoring';
import { BlindScoringControls } from './matrix/BlindScoringControls';
import { CriteriaSection } from './matrix/CriteriaSection';
import { OptionsSection } from './matrix/OptionsSection';

interface MatrixEditorProps {
  areResultsHidden: boolean;
  copy: TranslationCopy['matrix'];
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  onAddOption: (name?: string) => void;
  onRemoveOption: (optionId: string) => void;
  onOptionNameChange: (optionId: string, name: string) => void;
  onAddCategory: (name?: string) => void;
  onRemoveCategory: (categoryId: string) => void;
  onCategoryNameChange: (categoryId: string, name: string) => void;
  onCategoryWeightChange: (categoryId: string, weight: number) => void;
  onCategoryRankingChange: (categoryId: string, optionIds: string[]) => void;
  onResultsHiddenChange: (areResultsHidden: boolean) => void;
}

export function MatrixEditor({
  areResultsHidden,
  copy,
  matrix,
  summary,
  onAddOption,
  onRemoveOption,
  onOptionNameChange,
  onAddCategory,
  onRemoveCategory,
  onCategoryNameChange,
  onCategoryWeightChange,
  onCategoryRankingChange,
  onResultsHiddenChange,
}: MatrixEditorProps) {
  return (
    <section aria-label={copy.editorAria} className="min-w-0 space-y-9">
      <header className="border-b border-border pb-5 sm:pb-6">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {copy.intro}
          </p>
          <div className="mt-5">
            <BlindScoringControls
              areResultsHidden={areResultsHidden}
              copy={copy}
              onResultsHiddenChange={onResultsHiddenChange}
            />
          </div>
        </div>
      </header>

      <section
        aria-label={copy.onboardingGuideAria}
        className="w-fit rounded-lg border border-border bg-white/[0.76] p-4 shadow-sm sm:p-5"
      >
        <ol className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
          {copy.onboardingSteps.map((step, index) => (
            <li
              className="border-l-2 border-cyan-900/25 pl-3 leading-6"
              key={step}
            >
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </section>

      <OptionsSection
        areResultsHidden={areResultsHidden}
        copy={copy}
        matrix={matrix}
        onAddOption={onAddOption}
        onOptionNameChange={onOptionNameChange}
        onRemoveOption={onRemoveOption}
        summary={summary}
      />

      <CriteriaSection
        areResultsHidden={areResultsHidden}
        copy={copy}
        matrix={matrix}
        onAddCategory={onAddCategory}
        onCategoryNameChange={onCategoryNameChange}
        onCategoryRankingChange={onCategoryRankingChange}
        onCategoryWeightChange={onCategoryWeightChange}
        onRemoveCategory={onRemoveCategory}
        summary={summary}
      />
    </section>
  );
}
