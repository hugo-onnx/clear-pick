import { X } from 'lucide-react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sortable } from '@/components/ui/sortable';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';
import type { Category, DecisionMatrix } from '@/types';
import {
  DEFAULT_SCORE,
  MAX_WEIGHT,
  MIN_WEIGHT,
  getDisplayName,
  getRankedOptionsForCategory,
} from '@/utils/matrix';
import type { DecisionSummary } from '@/utils/scoring';
import {
  formatSliderValue,
  getOptionId,
  getRangeStyle,
  revealClosestFocusCard,
  updateSliderDisplay,
  weightSliderConfig,
} from '@/utils/matrixEditorUtils';
import { RankingRow } from './RankingRow';

interface CriterionRowProps {
  category: Category;
  categoryIndex: number;
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  areResultsHidden: boolean;
  canRemove: boolean;
  copy: TranslationCopy['matrix'];
  onRemoveCategory: (id: string) => void;
  onCategoryNameChange: (id: string, name: string) => void;
  onCategoryWeightChange: (id: string, weight: number) => void;
  onCategoryRankingChange: (id: string, optionIds: string[]) => void;
}

const labelClass = 'text-[11px] font-semibold uppercase text-muted-foreground';
const minorButtonClass =
  'h-8 w-8 rounded-full text-muted-foreground hover:bg-slate-900/5 hover:text-foreground';

export function CriterionRow({
  category,
  categoryIndex,
  matrix,
  summary,
  areResultsHidden,
  canRemove,
  copy,
  onRemoveCategory,
  onCategoryNameChange,
  onCategoryWeightChange,
  onCategoryRankingChange,
}: CriterionRowProps) {
  const criterionFallback = copy.criterionLabel(categoryIndex + 1);
  const criterionDisplayName = getDisplayName(category.name, criterionFallback);
  const weightSliderId = `weight:${category.id}`;
  const displayedWeight = category.weight;
  const rankedOptions = getRankedOptionsForCategory(matrix, category.id);

  const handleCategoryNameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onCategoryNameChange(category.id, event.currentTarget.value);
    event.currentTarget.blur();
  };

  return (
    <article
      aria-label={copy.criterionRowAria(criterionDisplayName)}
      className="rounded-lg border border-border bg-white/[0.78] p-4 shadow-sm transition duration-200 hover:bg-white focus-within:border-primary/55 sm:p-5"
      data-criterion-focus-card=""
      data-focus-card=""
      id={`criterion-card-${category.id}`}
      role="listitem"
    >
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(200px,0.78fr)_minmax(0,1.8fr)]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <label className={labelClass} htmlFor={`category-${category.id}`}>
                {criterionFallback}
              </label>
              <Button
                aria-label={copy.removeCriterion(criterionDisplayName)}
                className={minorButtonClass}
                disabled={!canRemove}
                onClick={() => onRemoveCategory(category.id)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>

            <Input
              className="h-11 rounded-lg bg-white/90 font-semibold shadow-sm placeholder:text-foreground/45"
              id={`category-${category.id}`}
              onChange={(event) => onCategoryNameChange(category.id, event.target.value)}
              onKeyDown={handleCategoryNameKeyDown}
              placeholder={criterionFallback}
              value={category.name}
            />
          </div>

          <div
            className="space-y-3 rounded-md bg-slate-950/[0.035] p-3 sm:p-4"
            data-focus-card=""
            data-scoring-focus-card=""
            onFocusCapture={(event) => revealClosestFocusCard(event.target)}
          >
            <div className="flex items-center justify-between gap-3">
              <label className={labelClass} htmlFor={`weight-${category.id}`}>
                {copy.importance}
              </label>
              <output
                className="min-w-12 text-right text-sm font-semibold text-foreground"
                data-slider-output={weightSliderId}
              >
                {formatSliderValue(displayedWeight, weightSliderConfig)}
              </output>
            </div>
            <input
              aria-label={copy.importanceAria(criterionDisplayName)}
              className="matrix-range"
              defaultValue={displayedWeight}
              id={`weight-${category.id}`}
              key={`${weightSliderId}:${displayedWeight}`}
              max={MAX_WEIGHT}
              min={MIN_WEIGHT}
              onBlur={(event) => {
                const value = Number(event.currentTarget.value);
                updateSliderDisplay(weightSliderId, value, weightSliderConfig, undefined, event.currentTarget);
                onCategoryWeightChange(category.id, weightSliderConfig.clamp(value));
              }}
              onChange={(event) =>
                updateSliderDisplay(weightSliderId, Number(event.currentTarget.value), weightSliderConfig, undefined, event.currentTarget)
              }
              onFocus={(event) =>
                updateSliderDisplay(weightSliderId, displayedWeight, weightSliderConfig, undefined, event.currentTarget)
              }
              onInput={(event) =>
                updateSliderDisplay(weightSliderId, Number(event.currentTarget.value), weightSliderConfig, undefined, event.currentTarget)
              }
              onKeyUp={(event) => {
                const value = Number(event.currentTarget.value);
                updateSliderDisplay(weightSliderId, value, weightSliderConfig, undefined, event.currentTarget);
                onCategoryWeightChange(category.id, weightSliderConfig.clamp(value));
              }}
              onPointerCancel={(event) => {
                const value = Number(event.currentTarget.value);
                updateSliderDisplay(weightSliderId, value, weightSliderConfig, undefined, event.currentTarget);
                onCategoryWeightChange(category.id, weightSliderConfig.clamp(value));
              }}
              onPointerDown={(event) =>
                updateSliderDisplay(weightSliderId, displayedWeight, weightSliderConfig, undefined, event.currentTarget)
              }
              onPointerUp={(event) => {
                const value = Number(event.currentTarget.value);
                updateSliderDisplay(weightSliderId, value, weightSliderConfig, undefined, event.currentTarget);
                onCategoryWeightChange(category.id, weightSliderConfig.clamp(value));
              }}
              step="0.1"
              style={getRangeStyle(displayedWeight, weightSliderConfig)}
              type="range"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className={labelClass}>{copy.optionRanking}</p>
            <p className="text-sm font-medium text-muted-foreground">
              {copy.optionsCount(matrix.options.length)}
            </p>
          </div>

          <div
            aria-label={copy.optionRankingAria(criterionDisplayName)}
            role="group"
          >
            <Sortable
              className="criteria-score-rows space-y-2"
              getItemValue={getOptionId}
              onValueChange={(nextRankedOptions) =>
                onCategoryRankingChange(
                  category.id,
                  nextRankedOptions.map((option) => option.id),
                )
              }
              strategy="vertical"
              value={rankedOptions}
            >
              {rankedOptions.map((option, rankIndex) => {
                const optionIndex = matrix.options.findIndex(
                  (matrixOption) => matrixOption.id === option.id,
                );
                const optionDisplayName = getDisplayName(
                  option.name,
                  copy.optionLabel(optionIndex + 1),
                );
                const displayedScore =
                  matrix.scores[option.id]?.[category.id] ?? DEFAULT_SCORE;

                return (
                  <RankingRow
                    key={`${option.id}-${category.id}`}
                    areResultsHidden={areResultsHidden}
                    category={category}
                    copy={copy}
                    criterionDisplayName={criterionDisplayName}
                    displayedScore={displayedScore}
                    isLeading={summary.leadingOptionIds.includes(option.id)}
                    isTie={summary.isTie}
                    onCategoryRankingChange={onCategoryRankingChange}
                    option={option}
                    optionDisplayName={optionDisplayName}
                    rankIndex={rankIndex}
                    rankedOptions={rankedOptions}
                  />
                );
              })}
            </Sortable>
          </div>
        </div>
      </div>
    </article>
  );
}
