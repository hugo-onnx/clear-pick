import { afterEach, describe, expect, it } from 'vitest';
import {
  LAUNCH_SIGNALS_STORAGE_KEY,
  loadLaunchSignals,
  recordLaunchSignal,
} from './launchSignals';

afterEach(() => {
  window.localStorage.clear();
});

describe('launchSignals', () => {
  it('counts repeated launch validation clicks locally', () => {
    recordLaunchSignal('pro-export');
    recordLaunchSignal('pro-export');
    recordLaunchSignal('pro-save');

    expect(loadLaunchSignals()).toEqual({
      'pro-export': 2,
      'pro-save': 1,
    });
    expect(
      JSON.parse(
        window.localStorage.getItem(LAUNCH_SIGNALS_STORAGE_KEY) ?? '{}',
      ),
    ).toEqual({
      'pro-export': 2,
      'pro-save': 1,
    });
  });

  it('ignores malformed stored signal data', () => {
    window.localStorage.setItem(LAUNCH_SIGNALS_STORAGE_KEY, 'not-json');

    expect(loadLaunchSignals()).toEqual({});
  });
});
