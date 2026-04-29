import { cn } from '@/lib/utils';
import type { TranslationCopy } from '../i18n';
import type { Category, DecisionMatrix, ScoreMode } from '../types';
import {
  DEFAULT_SCORE,
  SCORE_MODE_BOOLEAN,
  getDisplayName,
  getScoreModeForCell,
} from '../utils/matrix';
import type { CategoryInfluence, DecisionSummary } from '../utils/scoring';

interface ScoringAuditPanelProps {
  areResultsHidden: boolean;
  copy: TranslationCopy['audit'];
  matrix: DecisionMatrix;
  summary: DecisionSummary;
}

function formatWholePercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatWeightedScore(value: number): string {
  return `${value.toFixed(1)}/10`;
}

function formatWholeWeightedScore(value: number): string {
  return `${Math.round(value)}/10`;
}

function formatPoints(value: number): string {
  return `${value.toFixed(1)} pts`;
}

function formatRawWeight(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function getScoreModeLabel(
  scoreMode: ScoreMode,
  copy: TranslationCopy['audit'],
): string {
  return scoreMode === SCORE_MODE_BOOLEAN ? copy.booleanScore : copy.scaleScore;
}

function getOptionName(
  optionId: string,
  optionIndex: number,
  summary: DecisionSummary,
): string {
  return (
    summary.rankedOptions.find((option) => option.id === optionId)?.name ??
    `Option ${optionIndex + 1}`
  );
}

function getCategoryInfluence(
  categoryId: string,
  summary: DecisionSummary,
): CategoryInfluence | null {
  return (
    summary.categoryInfluence.find((category) => category.id === categoryId) ??
    null
  );
}

function hasActiveInfluence(entry: {
  category: Category;
  influence: CategoryInfluence | null;
}): entry is { category: Category; influence: CategoryInfluence } {
  return entry.influence !== null && entry.influence.normalizedWeight > 0;
}

export function ScoringAuditPanel({
  areResultsHidden,
  copy,
  matrix,
  summary,
}: ScoringAuditPanelProps) {
  const activeCategories = matrix.categories
    .map((category) => ({
      category,
      influence: getCategoryInfluence(category.id, summary),
    }))
    .filter(hasActiveInfluence);

  return (
    <section
      aria-labelledby="scoring-audit-title"
      className="space-y-8"
    >
      <div className="max-w-4xl space-y-3">
        <h2
          className="font-display text-3xl font-semibold tracking-normal text-foreground sm:text-4xl"
          id="scoring-audit-title"
        >
          {copy.title}
        </h2>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {copy.intro}
        </p>
      </div>

      <section className="rounded-lg border border-border bg-white/75 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">
          {copy.formulaTitle}
        </h3>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <p>{copy.formulaWeight}</p>
          <p>{copy.formulaContribution}</p>
          <p>{copy.formulaTotal}</p>
          <p>{copy.zeroWeightRule}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-600/20 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
            {copy.scaleRule}
          </span>
          <span className="rounded-full border border-orange-600/20 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-900">
            {copy.booleanRule}
          </span>
        </div>
      </section>

      {areResultsHidden ? (
        <section className="rounded-lg border border-dashed border-border bg-white/70 p-5">
          <h3 className="text-base font-semibold text-foreground">
            {copy.hiddenTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground" role="status">
            {copy.hiddenDescription}
          </p>
          <p className="mt-3 text-sm font-semibold text-cyan-900">
            {copy.showResults}
          </p>
        </section>
      ) : null}

      <section
        aria-labelledby="scoring-audit-weights-title"
        className="space-y-4"
      >
        <div className="max-w-3xl">
          <h3
            className="font-display text-2xl font-semibold tracking-normal text-foreground"
            id="scoring-audit-weights-title"
          >
            {copy.weightsTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy.weightsDescription}
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-white/75 shadow-sm">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold" scope="col">
                  {copy.criterionColumn}
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  {copy.rawWeightColumn}
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  {copy.influenceColumn}
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  {copy.scoringColumn}
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  {copy.behaviorColumn}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrix.categories.map((category, index) => {
                const influence = getCategoryInfluence(category.id, summary);
                const categoryName =
                  influence?.name ?? getDisplayName(category.name, `Criterion ${index + 1}`);
                const normalizedWeight = influence?.normalizedWeight ?? 0;
                const isIncluded = normalizedWeight > 0;

                return (
                  <tr key={category.id}>
                    <th className="px-4 py-3 font-semibold text-foreground" scope="row">
                      {categoryName}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRawWeight(category.weight)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatWholePercent(normalizedWeight * 100)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getScoreModeLabel(category.scoreMode, copy)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          isIncluded
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-100 text-slate-700',
                        )}
                      >
                        {isIncluded ? copy.included : copy.excluded}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {!summary.hasScoringBasis ? (
        <section className="rounded-lg border border-dashed border-border bg-white/70 p-5">
          <h3 className="text-base font-semibold text-foreground">
            {copy.neutralTitle}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground" role="status">
            {copy.noPositiveWeights}
          </p>
        </section>
      ) : null}

      {!areResultsHidden && summary.hasScoringBasis ? (
        <section
          aria-label={copy.contributionBreakdownAria}
          className="space-y-4"
        >
          <div className="max-w-3xl">
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
              {copy.contributionTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.contributionDescription}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {matrix.options.map((option, optionIndex) => {
              const optionName = getOptionName(option.id, optionIndex, summary);
              const total = summary.rankedOptions.find(
                (rankedOption) => rankedOption.id === option.id,
              )?.total ?? 0;

              return (
                <article
                  aria-label={copy.optionContributionAria(optionName)}
                  className="rounded-lg border border-border bg-white/75 p-5 shadow-sm"
                  key={option.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h4 className="text-base font-semibold text-foreground">
                      {optionName}
                    </h4>
                    <p className="text-sm font-semibold text-cyan-900">
                      {copy.optionTotal(optionName, formatWeightedScore(total))}
                    </p>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-md border border-border bg-white/70">
                    <table className="min-w-full divide-y divide-border text-left text-sm">
                      <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {copy.criterionColumn}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {copy.scoringColumn}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {copy.scoreColumn}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {copy.influenceColumn}
                          </th>
                          <th className="px-3 py-2 font-semibold" scope="col">
                            {copy.contributionColumn}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activeCategories.map(({ category, influence }) => {
                          const score =
                            matrix.scores[option.id]?.[category.id] ??
                            DEFAULT_SCORE;
                          const scoreMode = getScoreModeForCell(
                            matrix,
                            option.id,
                            category.id,
                          );
                          const weightShare = formatWholePercent(
                            influence.normalizedWeight * 100,
                          );
                          const contribution =
                            influence.normalizedWeight * score;

                          return (
                            <tr key={category.id}>
                              <th
                                className="px-3 py-2 font-semibold text-foreground"
                                scope="row"
                              >
                                {influence.name}
                              </th>
                              <td className="px-3 py-2 text-muted-foreground">
                                {getScoreModeLabel(scoreMode, copy)}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {formatWholeWeightedScore(score)}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {weightShare}
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  <p className="font-semibold text-foreground">
                                    {copy.contributionValue(
                                      formatPoints(contribution),
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {copy.contributionFormula(
                                      formatWholeWeightedScore(score),
                                      weightShare,
                                    )}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {!areResultsHidden && summary.hasScoringBasis ? (
        <section
          aria-label={copy.rankingAria}
          className="space-y-4"
        >
          <div className="max-w-3xl">
            <h3 className="font-display text-2xl font-semibold tracking-normal text-foreground">
              {copy.rankingTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.rankingDescription}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-white/75 shadow-sm">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    {copy.rankColumn}
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    {copy.optionColumn}
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    {copy.totalColumn}
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    {copy.noteColumn}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.rankedOptions.map((option, index) => {
                  const isTopOption = summary.leadingOptionIds.includes(option.id);
                  const gapFromLeader = Math.max(
                    0,
                    (summary.topOption?.total ?? 0) - option.total,
                  );
                  const note = isTopOption
                    ? summary.isTie
                      ? copy.rankingTiedForLead
                      : copy.rankingLeader
                    : copy.rankingBehindLeader(formatPoints(gapFromLeader));

                  return (
                    <tr key={option.id}>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        #{index + 1}
                      </td>
                      <th className="px-4 py-3 font-semibold text-foreground" scope="row">
                        {option.name}
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatWeightedScore(option.total)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            {copy.tieHandlingNote}
          </p>
        </section>
      ) : null}
    </section>
  );
}
