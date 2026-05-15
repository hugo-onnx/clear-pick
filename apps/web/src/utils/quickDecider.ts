import type { Option } from '../types';
import { createOption, MAX_OPTIONS, MIN_OPTIONS } from './matrix';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeQuickDecisionNames(value: unknown): string[] {
  const rawItems = Array.isArray(value) ? value : [];
  const names = rawItems
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (isRecord(item) && typeof item.name === 'string') {
        return item.name;
      }

      return '';
    })
    .slice(0, MAX_OPTIONS);

  while (names.length < MIN_OPTIONS) {
    names.push('');
  }

  return names;
}

export function createQuickDecisionOptionsFromNames(value: unknown): Option[] {
  return normalizeQuickDecisionNames(value).map((name) => createOption(name));
}

export function createQuickDecisionOptionsFromMatrixOptions(
  options: Option[],
): Option[] {
  return options
    .map((option) => option.name.trim())
    .filter((name) => name.length > 0)
    .slice(0, MAX_OPTIONS)
    .map((name) => createOption(name));
}

export function createBlankQuickDecisionOptions(): Option[] {
  return createQuickDecisionOptionsFromNames([]);
}

export function serializeQuickDecisionOptions(options: Option[]): string[] {
  return normalizeQuickDecisionNames(options);
}

export function getNamedQuickDecisionOptions(options: Option[]): Option[] {
  return options.filter((option) => option.name.trim().length > 0);
}

export function chooseQuickDecisionOption(
  options: Option[],
  random = Math.random,
): Option | null {
  const namedOptions = getNamedQuickDecisionOptions(options);

  if (namedOptions.length < MIN_OPTIONS) {
    return null;
  }

  const randomValue = Math.max(0, Math.min(0.999999999999, random()));
  const index = Math.floor(randomValue * namedOptions.length);

  return namedOptions[index] ?? null;
}
