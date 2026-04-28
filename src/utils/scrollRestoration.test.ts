import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetScrollOnReload } from './scrollRestoration';

beforeEach(() => {
  Object.defineProperty(window.history, 'scrollRestoration', {
    configurable: true,
    value: 'auto',
    writable: true,
  });

  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    },
  });
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

describe('resetScrollOnReload', () => {
  it('scrolls to the top and removes the hash when the page reloads', () => {
    window.history.replaceState(null, '', '/#decision-matrix');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      { type: 'reload' } as PerformanceNavigationTiming,
    ]);

    resetScrollOnReload();

    expect(window.history.scrollRestoration).toBe('manual');
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      document.title,
      '/',
    );
    expect(scrollToSpy).toHaveBeenCalledWith({
      behavior: 'auto',
      left: 0,
      top: 0,
    });
  });

  it('leaves the current scroll position alone on non-reload visits', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window.performance, 'getEntriesByType').mockReturnValue([
      { type: 'navigate' } as PerformanceNavigationTiming,
    ]);

    resetScrollOnReload();

    expect(window.history.scrollRestoration).toBe('manual');
    expect(scrollToSpy).not.toHaveBeenCalled();
  });
});
