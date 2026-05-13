import { X } from 'lucide-react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';
import type { Option } from '@/types';
import { formatPoints, getRangeStyle } from '@/utils/matrixEditorUtils';

interface OptionCardProps {
  option: Option;
  index: number;
  displayName: string;
  draftName: string;
  optionTotal: number;
  isTopOption: boolean;
  isTie: boolean;
  areResultsHidden: boolean;
  canAddMore: boolean;
  canRemove: boolean;
  copy: Pick<
    TranslationCopy['matrix'],
    | 'optionLabel'
    | 'optionPlaceholder'
    | 'removeOption'
    | 'liveTotal'
    | 'liveScoreAria'
    | 'resultsHiddenWhileScoring'
    | 'addOptionToScore'
    | 'leading'
    | 'tied'
  >;
  onDraftNameChange: (name: string) => void;
  onRemoveOption: () => void;
  onOptionNameChange: (name: string) => void;
}

const minorButtonClass =
  'h-8 w-8 rounded-full text-muted-foreground hover:bg-slate-900/5 hover:text-foreground';
const labelClass = 'text-[11px] font-semibold uppercase text-muted-foreground';

export function OptionCard({
  option,
  index,
  displayName,
  draftName,
  optionTotal,
  isTopOption,
  isTie,
  areResultsHidden,
  canAddMore,
  canRemove,
  copy,
  onDraftNameChange,
  onRemoveOption,
  onOptionNameChange,
}: OptionCardProps) {
  const hasOptionName = option.name.trim().length > 0;
  const optionStatusLabel = isTie ? copy.tied : copy.leading;
  const optionHighlightClassName = isTie
    ? 'border-amber-400/70 bg-[linear-gradient(180deg,rgba(254,243,199,0.9),rgba(255,255,255,0.86))]'
    : 'border-cyan-600/40 bg-[linear-gradient(180deg,rgba(207,250,254,0.7),rgba(255,255,255,0.86))]';
  const optionAccentClassName = isTie ? 'bg-amber-500' : 'bg-cyan-600';
  const optionBadgeClassName = isTie
    ? 'bg-amber-100 text-amber-800'
    : 'bg-cyan-100 text-cyan-800';

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onOptionNameChange(event.currentTarget.value);
    event.currentTarget.blur();
    const card = event.currentTarget.closest('[data-option-card]');
    if (card instanceof HTMLElement) {
      card.style.pointerEvents = 'none';
      requestAnimationFrame(() => {
        card.style.pointerEvents = '';
      });
    }
  };

  return (
    <article
      className={cn(
        'relative flex min-h-[12.5rem] flex-col overflow-hidden rounded-lg border bg-white/85 p-4 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white focus-within:border-primary/55',
        isTopOption ? optionHighlightClassName : 'border-border',
      )}
      data-option-card=""
      data-option-focus-card=""
      data-focus-card=""
      id={`option-card-${option.id}`}
    >
      {isTopOption ? (
        <div className={cn('absolute inset-x-0 top-0 h-1', optionAccentClassName)} />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
          <label className={labelClass} htmlFor={`option-${option.id}`}>
            {copy.optionLabel(index + 1)}
          </label>
          {isTopOption ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase',
                optionBadgeClassName,
              )}
            >
              {optionStatusLabel}
            </span>
          ) : null}
        </div>
        <Button
          aria-label={copy.removeOption(displayName)}
          className={minorButtonClass}
          disabled={!canRemove}
          onClick={onRemoveOption}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <Input
        className="mt-3 h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
        enterKeyHint={canAddMore ? 'next' : 'done'}
        id={`option-${option.id}`}
        onBlur={(event) => onOptionNameChange(event.currentTarget.value)}
        onChange={(event) => onDraftNameChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={copy.optionPlaceholder(index + 1)}
        value={draftName}
      />

      <div
        className={cn(
          'mt-auto min-h-[4.5rem] rounded-md bg-slate-950/[0.035] p-3',
          hasOptionName && !areResultsHidden ? 'space-y-3' : null,
        )}
      >
        {hasOptionName && !areResultsHidden ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.liveTotal}
              </span>
              <output
                aria-label={copy.liveScoreAria(displayName)}
                aria-live="polite"
                className="text-xl font-semibold leading-none text-foreground"
              >
                {formatPoints(optionTotal)}
              </output>
            </div>
            <div
              aria-hidden="true"
              className="h-2 rounded-full"
              style={getRangeStyle(optionTotal)}
            />
          </>
        ) : hasOptionName ? (
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            {copy.resultsHiddenWhileScoring}
          </p>
        ) : (
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            {copy.addOptionToScore}
          </p>
        )}
      </div>
    </article>
  );
}
