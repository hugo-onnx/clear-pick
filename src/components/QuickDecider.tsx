import { Dices, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TranslationCopy } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  createOption,
  getDisplayName,
} from '../utils/matrix';
import {
  chooseQuickDecisionOption,
  createBlankQuickDecisionOptions,
  getNamedQuickDecisionOptions,
} from '../utils/quickDecider';
import {
  loadQuickDecisionOptions,
  saveQuickDecisionOptions,
} from '../utils/storage';

interface QuickDeciderProps {
  copy: TranslationCopy['quickDecider'];
}

const disabledHintId = 'quick-decider-disabled-hint';
const limitHintId = 'quick-decider-limit-hint';

export function QuickDecider({ copy }: QuickDeciderProps) {
  const [options, setOptions] = useState(() => loadQuickDecisionOptions());
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const pendingFocusOptionIdRef = useRef<string | null>(null);

  const namedOptions = useMemo(
    () => getNamedQuickDecisionOptions(options),
    [options],
  );
  const selectedOption = selectedOptionId
    ? namedOptions.find((option) => option.id === selectedOptionId) ?? null
    : null;
  const canAddOption = options.length < MAX_OPTIONS;
  const canRemoveOption = options.length > MIN_OPTIONS;
  const canDecide = namedOptions.length >= MIN_OPTIONS;

  useEffect(() => {
    saveQuickDecisionOptions(options);
  }, [options]);

  useEffect(() => {
    const optionId = pendingFocusOptionIdRef.current;

    if (!optionId) {
      return;
    }

    const input = document.getElementById(`quick-option-${optionId}`);

    if (input instanceof HTMLInputElement) {
      input.focus();
      pendingFocusOptionIdRef.current = null;
    }
  }, [options]);

  useEffect(() => {
    if (
      selectedOptionId &&
      (namedOptions.length < MIN_OPTIONS ||
        !namedOptions.some((option) => option.id === selectedOptionId))
    ) {
      setSelectedOptionId(null);
    }
  }, [namedOptions, selectedOptionId]);

  const handleOptionNameChange = (optionId: string, name: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId ? { ...option, name } : option,
      ),
    );
  };

  const handleAddOption = () => {
    if (!canAddOption) {
      return;
    }

    const newOption = createOption('');
    pendingFocusOptionIdRef.current = newOption.id;
    setOptions((current) => [...current, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    if (!canRemoveOption) {
      return;
    }

    setOptions((current) => current.filter((option) => option.id !== optionId));
  };

  const handleDecide = () => {
    if (!canDecide) {
      return;
    }

    const selectedOption = chooseQuickDecisionOption(options);

    if (selectedOption) {
      setSelectedOptionId(selectedOption.id);
    }
  };

  const handleReset = () => {
    setOptions(createBlankQuickDecisionOptions());
    setSelectedOptionId(null);
  };

  return (
    <section
      aria-label={copy.sectionAria}
      className="mx-auto max-w-5xl px-1 py-2 sm:px-4 sm:py-6"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase text-cyan-800">
          {copy.sectionLabel}
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
          {copy.headline}
        </h2>
      </div>

      <div
        aria-describedby={canAddOption ? undefined : limitHintId}
        aria-label={copy.optionsGroupAria}
        className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        role="group"
      >
        {options.map((option, index) => {
          const fallbackName = copy.optionLabel(index + 1);
          const displayName = getDisplayName(option.name, fallbackName);

          return (
            <div
              className="relative flex aspect-[1.12/1] min-h-[5.25rem] cursor-text flex-col items-center justify-center rounded-lg border border-cyan-900/10 bg-white/78 p-2 shadow-sm transition duration-200 focus-within:border-cyan-600/50 focus-within:bg-white hover:-translate-y-0.5 hover:border-cyan-700/20 hover:bg-white sm:min-h-[6rem] sm:p-3"
              key={option.id}
              onClick={(event) => {
                const target = event.target as HTMLElement;

                if (target.closest('button')) {
                  return;
                }

                document.getElementById(`quick-option-${option.id}`)?.focus();
              }}
            >
              {canRemoveOption ? (
                <Button
                  aria-label={copy.removeOption(displayName)}
                  className="absolute right-2 top-2 h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveOption(option.id)}
                  size="icon"
                  title={copy.removeOption(displayName)}
                  variant="ghost"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              ) : null}

              <label className="sr-only" htmlFor={`quick-option-${option.id}`}>
                {fallbackName}
              </label>
              <Input
                className={cn(
                  'h-auto border-0 bg-transparent px-6 py-0 text-center font-display text-3xl font-semibold shadow-none placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0 sm:px-8',
                  option.name.trim().length > 18 ? 'text-2xl' : undefined,
                )}
                id={`quick-option-${option.id}`}
                onChange={(event) =>
                  handleOptionNameChange(option.id, event.target.value)
                }
                placeholder={copy.optionPlaceholder(index + 1)}
                value={option.name}
              />
            </div>
          );
        })}

        {canAddOption ? (
          <button
            aria-label={copy.addOption}
            className="flex aspect-[1.12/1] min-h-[5.25rem] items-center justify-center rounded-lg border border-dashed border-cyan-700/30 bg-cyan-50/50 text-cyan-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-700/45 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-600/15 sm:min-h-[6rem]"
            onClick={handleAddOption}
            title={copy.addOption}
            type="button"
          >
            <Plus aria-hidden="true" className="h-10 w-10" />
          </button>
        ) : null}
      </div>

      {!canAddOption ? (
        <p
          className="mt-3 text-center text-sm font-medium text-muted-foreground"
          id={limitHintId}
        >
          {copy.limitHint}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button
          aria-describedby={!canDecide ? disabledHintId : undefined}
          className="gap-2"
          disabled={!canDecide}
          onClick={handleDecide}
          size="lg"
        >
          <Dices aria-hidden="true" className="h-4 w-4" />
          {copy.decide}
        </Button>
        <Button
          className="gap-2"
          onClick={handleReset}
          size="lg"
          variant="outline"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          {copy.reset}
        </Button>
      </div>

      {!canDecide ? (
        <p
          className="mt-3 text-center text-sm font-medium text-muted-foreground"
          id={disabledHintId}
        >
          {copy.disabledHint}
        </p>
      ) : null}

      <p
        aria-live="polite"
        className="mx-auto mt-6 min-h-10 max-w-3xl text-center font-display text-3xl font-semibold tracking-normal text-foreground sm:text-4xl"
        role="status"
      >
        {selectedOption ? copy.result(selectedOption.name.trim()) : ''}
      </p>
    </section>
  );
}
