import { Plus } from 'lucide-react';
import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';
import type { DecisionMatrix } from '@/types';
import { MIN_CATEGORIES } from '@/utils/matrix';
import type { DecisionSummary } from '@/utils/scoring';
import { focusCriterionWeightSlider, focusEntryInput } from '@/utils/matrixEditorUtils';
import { CriterionRow } from './CriterionRow';

interface CriteriaSectionProps {
  matrix: DecisionMatrix;
  summary: DecisionSummary;
  areResultsHidden: boolean;
  copy: TranslationCopy['matrix'];
  onAddCategory: (name?: string) => void;
  onRemoveCategory: (id: string) => void;
  onCategoryNameChange: (id: string, name: string) => void;
  onCategoryWeightChange: (id: string, weight: number) => void;
  onCategoryRankingChange: (id: string, optionIds: string[]) => void;
}

const labelClass = 'text-[11px] font-semibold uppercase text-muted-foreground';

export function CriteriaSection({
  matrix,
  summary,
  areResultsHidden,
  copy,
  onAddCategory,
  onRemoveCategory,
  onCategoryNameChange,
  onCategoryWeightChange,
  onCategoryRankingChange,
}: CriteriaSectionProps) {
  const [pendingCategoryName, setPendingCategoryName] = useState('');
  const pendingCategoryFormRef = useRef<HTMLFormElement>(null);
  const pendingCategoryInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusNewCategoryRef = useRef(false);
  const shouldFocusNewCategoryWeightRef = useRef(false);
  const previousCategoryCountRef = useRef(matrix.categories.length);

  const canRemoveCategories = matrix.categories.length > MIN_CATEGORIES;

  useLayoutEffect(() => {
    const previousCategoryCount = previousCategoryCountRef.current;
    previousCategoryCountRef.current = matrix.categories.length;

    if (matrix.categories.length <= previousCategoryCount) return;

    if (!shouldFocusNewCategoryRef.current) {
      if (shouldFocusNewCategoryWeightRef.current) {
        shouldFocusNewCategoryWeightRef.current = false;
        const newCategory = matrix.categories[matrix.categories.length - 1];
        const newCategoryInput = document.getElementById(`category-${newCategory.id}`);
        if (newCategoryInput instanceof HTMLInputElement) newCategoryInput.blur();
        pendingCategoryInputRef.current?.blur();
      }
      return;
    }

    shouldFocusNewCategoryRef.current = false;

    const newCategory = matrix.categories[matrix.categories.length - 1];
    const newCategoryInput = document.getElementById(`category-${newCategory.id}`);
    const newCategoryCard = document.getElementById(`criterion-card-${newCategory.id}`);

    if (newCategoryInput instanceof HTMLInputElement) {
      focusEntryInput(newCategoryInput, {
        revealTarget: newCategoryCard instanceof HTMLElement ? newCategoryCard : null,
        select: true,
      });
    }
  }, [matrix.categories]);

  const handleAddCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCategoryName = pendingCategoryName.trim();
    const shouldFocusNewCategory = nextCategoryName.length === 0;
    const isKeyboardSubmit =
      document.activeElement === pendingCategoryInputRef.current;
    shouldFocusNewCategoryRef.current = shouldFocusNewCategory;
    shouldFocusNewCategoryWeightRef.current = !shouldFocusNewCategory;

    if (isKeyboardSubmit && !shouldFocusNewCategory) {
      const pendingInput = pendingCategoryInputRef.current;
      const pendingForm = pendingCategoryFormRef.current;

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

    onAddCategory(nextCategoryName);
    setPendingCategoryName('');
  };

  return (
    <section aria-labelledby="criteria-heading" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:flex-1">
          <h3
            className="font-display text-2xl font-semibold tracking-normal text-foreground"
            id="criteria-heading"
          >
            {copy.criteriaHeading}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {copy.criteriaDescription}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            {copy.criteriaCount(matrix.categories.length)}
          </p>
        </div>
      </div>

      <div aria-label={copy.criteriaList} className="space-y-4" role="list">
        {matrix.categories.map((category, categoryIndex) => (
          <CriterionRow
            key={category.id}
            areResultsHidden={areResultsHidden}
            canRemove={canRemoveCategories}
            category={category}
            categoryIndex={categoryIndex}
            copy={copy}
            matrix={matrix}
            onCategoryNameChange={onCategoryNameChange}
            onCategoryRankingChange={onCategoryRankingChange}
            onCategoryWeightChange={onCategoryWeightChange}
            onRemoveCategory={onRemoveCategory}
            summary={summary}
          />
        ))}
      </div>

      <form
        aria-label={copy.addCriterion}
        className="rounded-lg border border-dashed border-primary/40 bg-white/55 p-4 shadow-sm backdrop-blur transition duration-200 hover:border-primary/55 hover:bg-white/75 focus-within:border-primary/60 focus-within:bg-white/80 sm:p-5"
        data-criterion-focus-card=""
        data-focus-card=""
        onSubmit={handleAddCategorySubmit}
        ref={pendingCategoryFormRef}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className={labelClass} htmlFor="new-criterion-name">
              {copy.newCriterion}
            </label>
            <Input
              className="mt-3 h-11 rounded-lg bg-white/90 text-base font-semibold shadow-sm placeholder:text-foreground/45"
              id="new-criterion-name"
              onChange={(event) => setPendingCategoryName(event.target.value)}
              placeholder={copy.criterionLabel(matrix.categories.length + 1)}
              ref={pendingCategoryInputRef}
              value={pendingCategoryName}
            />
          </div>
          <Button
            aria-label={copy.addCriterion}
            className="h-11 w-full shrink-0 sm:w-11"
            size="icon"
            type="submit"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </section>
  );
}
