export const LAUNCH_SIGNALS_STORAGE_KEY = 'clearpick:launch-signals:v1';

export type LaunchSignalName =
  | 'pro-export'
  | 'pro-save'
  | 'pro-share'
  | 'pro-request';

export type LaunchSignals = Partial<Record<LaunchSignalName, number>>;

export function loadLaunchSignals(): LaunchSignals {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(LAUNCH_SIGNALS_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return parsedValue as LaunchSignals;
  } catch {
    return {};
  }
}

export function recordLaunchSignal(signalName: LaunchSignalName): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const signals = loadLaunchSignals();
    signals[signalName] = (signals[signalName] ?? 0) + 1;
    window.localStorage.setItem(
      LAUNCH_SIGNALS_STORAGE_KEY,
      JSON.stringify(signals),
    );
  } catch {
    // Ignore storage errors. The click still works as a product signal in-session.
  }
}
