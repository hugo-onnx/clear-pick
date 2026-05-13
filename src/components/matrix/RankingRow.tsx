import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';
import type { Category, Option } from '@/types';
import { formatSliderValue, moveRankedOption, revealClosestFocusCard } from '@/utils/matrixEditorUtils';

interface RankingRowProps {
  className?: string;
  option: Option;
  rankIndex: number;
  rankedOptions: Option[];
  category: Category;
  optionDisplayName: string;
  displayedScore: number;
  isLeading: boolean;
  isTie: boolean;
  areResultsHidden: boolean;
  criterionDisplayName: string;
  copy: Pick<
    TranslationCopy['matrix'],
    | 'rankPosition'
    | 'rankScoreAria'
    | 'dragOption'
    | 'moveOptionUp'
    | 'moveOptionDown'
  >;
  onCategoryRankingChange: (categoryId: string, optionIds: string[]) => void;
  value: string;
}

export function RankingRow({
  className,
  option,
  rankIndex,
  rankedOptions,
  category,
  optionDisplayName,
  displayedScore,
  isLeading,
  isTie,
  areResultsHidden,
  criterionDisplayName,
  copy,
  onCategoryRankingChange,
  value,
}: RankingRowProps) {
  const displayedScoreLabel = formatSliderValue(displayedScore);
  const scoreRowHighlightClassName = isTie
    ? 'border-amber-400/50 bg-amber-50/75'
    : 'border-cyan-600/30 bg-cyan-600/[0.04]';

  return (
    <SortableItem
      className={className}
      key={`${option.id}-${category.id}`}
      value={value}
    >
      <div
        className={cn(
          'matrix-ranking-card grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md border border-border bg-white/70 p-2.5 sm:gap-3 sm:p-3 md:grid-cols-[auto_auto_minmax(8rem,1fr)_minmax(5.75rem,auto)_auto] md:gap-4',
          !areResultsHidden && isLeading ? scoreRowHighlightClassName : null,
        )}
        data-focus-card=""
        data-scoring-focus-card=""
        onFocusCapture={(event) => revealClosestFocusCard(event.target)}
      >
        <span
          aria-label={copy.rankPosition(rankIndex + 1, optionDisplayName)}
          className="matrix-ranking-rank flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950/[0.055] text-xs font-bold text-foreground"
        >
          {rankIndex + 1}
        </span>

        <SortableItemHandle
          className="matrix-ranking-drag-handle inline-flex h-10 w-10 touch-none select-none items-center justify-center rounded-md text-muted-foreground transition hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-8 sm:w-8"
          cursor
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
          <span className="sr-only">{copy.dragOption(optionDisplayName)}</span>
        </SortableItemHandle>

        <span
          className="matrix-ranking-label min-w-0 truncate text-sm font-semibold leading-5 text-foreground/85"
          title={optionDisplayName}
        >
          {optionDisplayName}
        </span>

        <output
          aria-label={copy.rankScoreAria(optionDisplayName, criterionDisplayName)}
          className="matrix-ranking-score min-w-10 whitespace-nowrap text-right text-sm font-semibold text-foreground"
        >
          {displayedScoreLabel}
        </output>

        <div className="matrix-ranking-arrows flex items-center gap-1 justify-self-end">
          <Button
            aria-label={copy.moveOptionUp(optionDisplayName, criterionDisplayName)}
            className="h-8 w-8 rounded-md"
            disabled={rankIndex === 0}
            onClick={() =>
              onCategoryRankingChange(
                category.id,
                moveRankedOption(rankedOptions, option.id, -1),
              )
            }
            size="icon"
            variant="ghost"
          >
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={copy.moveOptionDown(optionDisplayName, criterionDisplayName)}
            className="h-8 w-8 rounded-md"
            disabled={rankIndex === rankedOptions.length - 1}
            onClick={() =>
              onCategoryRankingChange(
                category.id,
                moveRankedOption(rankedOptions, option.id, 1),
              )
            }
            size="icon"
            variant="ghost"
          >
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </SortableItem>
  );
}
