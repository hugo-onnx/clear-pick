import { Plus } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';
import type { DecisionMatrix } from '@/types';
import { MAX_OPTIONS, MIN_OPTIONS, getDisplayName } from '@/utils/matrix';
import type { DecisionSummary } from '@/utils/scoring';
import { focusEntryInput, revealFocusCard } from '@/utils/matrixEditorUtils';
import { OptionCard } from './OptionCard';

interface OptionsSectionProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  areResultsHidden: boolean;
  copy: TranslationCopy['matrix'];
  onAddOption: (name?: string) => void;
  onRemoveOption: (id: string) => void;
  onOptionNameChange: (id: string, name: string) => void;
}

const labelClass = 'text-[11px] font-semibold uppercase text-muted-foreground';

export function OptionsSection({
  matrix,
  summary,
  areResultsHidden,
  copy,
  onAddOption,
  onRemoveOption,
  onOptionNameChange,
}: OptionsSectionProps) {
  const [pendingOptionName, setPendingOptionName] = useState('');
  const [draftOptionNames, setDraftOptionNames] = useState<Record<string, string>>(
    () => Object.fromEntries(matrix.options.map((option) => [option.id, option.name])),
  );
  const pendingOptionFormRef = useRef<HTMLFormElement>(null);
  const pendingOptionInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusPendingOptionAfterAddRef = useRef(false);
  const shouldFocusAddedOptionAfterAddRef = useRef(false);
  const shouldBlurAddedOptionAfterAddRef = useRef(false);
  const isKeyboardSubmittingOptionRef = useRef(false);
  const isPointerSubmittingOptionRef = useRef(false);
  const shouldRevealNewOptionRef = useRef(false);
  const previousOptionCountRef = useRef(matrix.options.length);

  const canRemoveOptions = matrix.options.length > MIN_OPTIONS;
  const canAddOptions = matrix.options.length < MAX_OPTIONS;
  const totalsByOptionId = new Map(
    summary.rankedOptions.map((option) => [option.id, option.total]),
  );

  useEffect(() => {
    setDraftOptionNames((current) => {
      const nextDrafts: Record<string, string> = {};
      for (const option of matrix.options) {
        nextDrafts[option.id] = current[option.id] ?? option.name;
      }
      return nextDrafts;
    });
  }, [matrix.options]);

  useLayoutEffect(() => {
    const previousOptionCount = previousOptionCountRef.current;
    previousOptionCountRef.current = matrix.options.length;

    if (
      !shouldRevealNewOptionRef.current ||
      matrix.options.length <= previousOptionCount
    ) {
      return;
    }

    shouldRevealNewOptionRef.current = false;

    const newOption = matrix.options[matrix.options.length - 1];
    const newOptionCard = document.getElementById(`option-card-${newOption.id}`);
    const newOptionInput = document.getElementById(`option-${newOption.id}`);
    const pendingOptionForm = pendingOptionFormRef.current;
    const pendingOptionInput = pendingOptionInputRef.current;
    const shouldFocusPendingOptionAfterAdd =
      shouldFocusPendingOptionAfterAddRef.current &&
      matrix.options.length < MAX_OPTIONS;
    const shouldBlurAddedOptionAfterAdd = shouldBlurAddedOptionAfterAddRef.current;
    const shouldFocusAddedOptionAfterAdd = shouldFocusAddedOptionAfterAddRef.current;
    shouldFocusPendingOptionAfterAddRef.current = false;
    shouldFocusAddedOptionAfterAddRef.current = false;
    shouldBlurAddedOptionAfterAddRef.current = false;

    if (shouldBlurAddedOptionAfterAdd) {
      if (newOptionInput instanceof HTMLInputElement) {
        newOptionInput.blur();
      }

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        pendingOptionForm instanceof HTMLElement &&
        pendingOptionForm.contains(activeElement)
      ) {
        activeElement.blur();
      } else if (activeElement instanceof HTMLInputElement) {
        activeElement.blur();
      }
    }

    if (
      shouldFocusPendingOptionAfterAdd &&
      pendingOptionInput instanceof HTMLInputElement
    ) {
      focusEntryInput(pendingOptionInput, { revealTarget: pendingOptionForm });
      return;
    }

    if (
      shouldFocusAddedOptionAfterAdd &&
      newOptionInput instanceof HTMLInputElement
    ) {
      focusEntryInput(newOptionInput, {
        revealTarget: newOptionCard instanceof HTMLElement ? newOptionCard : null,
        select: true,
      });
      return;
    }

    if (newOptionCard instanceof HTMLElement) {
      revealFocusCard(newOptionCard, null);
    }
  }, [matrix.options]);

  const handleAddOptionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAddOptions) {
      shouldFocusPendingOptionAfterAddRef.current = false;
      shouldFocusAddedOptionAfterAddRef.current = false;
      shouldBlurAddedOptionAfterAddRef.current = false;
      isKeyboardSubmittingOptionRef.current = false;
      isPointerSubmittingOptionRef.current = false;
      return;
    }

    const isKeyboardSubmit =
      !isPointerSubmittingOptionRef.current &&
      (isKeyboardSubmittingOptionRef.current ||
        document.activeElement === pendingOptionInputRef.current);
    shouldFocusPendingOptionAfterAddRef.current = false;
    shouldFocusAddedOptionAfterAddRef.current = !isKeyboardSubmit;
    shouldBlurAddedOptionAfterAddRef.current = isKeyboardSubmit;
    isKeyboardSubmittingOptionRef.current = false;
    isPointerSubmittingOptionRef.current = false;

    if (isKeyboardSubmit) {
      const pendingInput = pendingOptionInputRef.current;
      const pendingForm = pendingOptionFormRef.current;

      if (pendingInput) {
        pendingInput.style.transition = 'none';
        pendingInput.blur();
      }
      if (pendingForm) pendingForm.style.transition = 'none';

      const requestNextFrame =
        window.requestAnimationFrame?.bind(window) ??
        ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));
      requestNextFrame(() => {
        if (pendingInput) pendingInput.style.transition = '';
        if (pendingForm) pendingForm.style.transition = '';
      });
    }

    shouldRevealNewOptionRef.current = true;
    onAddOption(pendingOptionName.trim());
    setPendingOptionName('');
  };

  const handlePendingOptionKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    isKeyboardSubmittingOptionRef.current = true;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <section
      aria-label={copy.optionsRegionAria}
      className="space-y-5"
      role="region"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:flex-1">
          <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
            {copy.optionsHeading}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {copy.optionsDescription}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            {copy.optionsCount(matrix.options.length)}
          </p>
        </div>
        {!canAddOptions ? (
          <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
            {copy.limitReached}
          </p>
        ) : null}
      </div>

      <div
        aria-label={copy.optionCards}
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="group"
      >
        {matrix.options.map((option, index) => {
          const displayName = getDisplayName(option.name, copy.optionLabel(index + 1));
          const hasOptionName = option.name.trim().length > 0;
          const isTopOption =
            !areResultsHidden &&
            hasOptionName &&
            summary.leadingOptionIds.includes(option.id);
          const optionTotal = totalsByOptionId.get(option.id) ?? 0;
          const draftName = draftOptionNames[option.id] ?? option.name;

          return (
            <OptionCard
              key={option.id}
              areResultsHidden={areResultsHidden}
              canAddMore={canAddOptions}
              canRemove={canRemoveOptions}
              copy={copy}
              displayName={displayName}
              draftName={draftName}
              index={index}
              isTopOption={isTopOption}
              isTie={summary.isTie}
              onDraftNameChange={(name) =>
                setDraftOptionNames((current) => ({ ...current, [option.id]: name }))
              }
              onOptionNameChange={(name) => onOptionNameChange(option.id, name)}
              onRemoveOption={() => onRemoveOption(option.id)}
              option={option}
              optionTotal={optionTotal}
            />
          );
        })}

        {canAddOptions ? (
          <form
            aria-label={copy.addOption}
            className="flex min-h-[12.5rem] flex-col justify-between rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80"
            data-add-option-card=""
            data-option-focus-card=""
            data-focus-card=""
            onSubmit={handleAddOptionSubmit}
            ref={pendingOptionFormRef}
          >
            <div>
              <div className="flex h-8 items-start justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                  <label className={labelClass} htmlFor="new-option-name">
                    {copy.newOption}
                  </label>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  className="h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
                  enterKeyHint={
                    matrix.options.length + 1 < MAX_OPTIONS ? 'next' : 'done'
                  }
                  id="new-option-name"
                  onChange={(event) => setPendingOptionName(event.target.value)}
                  onKeyDown={handlePendingOptionKeyDown}
                  placeholder={copy.optionPlaceholder(matrix.options.length + 1)}
                  ref={pendingOptionInputRef}
                  value={pendingOptionName}
                />
                <Button
                  aria-label={copy.addOption}
                  className="h-11 w-11 shrink-0"
                  onPointerDown={() => {
                    isPointerSubmittingOptionRef.current = true;
                    shouldFocusPendingOptionAfterAddRef.current = false;
                  }}
                  size="icon"
                  type="submit"
                >
                  <Plus aria-hidden="true" className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
