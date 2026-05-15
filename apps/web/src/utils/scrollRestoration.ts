function isReloadNavigation(): boolean {
  const navigationEntries = window.performance.getEntriesByType('navigation');
  const navigationEntry = navigationEntries[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (navigationEntry) {
    return navigationEntry.type === 'reload';
  }

  const legacyNavigation = window.performance.navigation;

  return legacyNavigation?.type === legacyNavigation?.TYPE_RELOAD;
}

function scrollToPageTop(): void {
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;

  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo({
    behavior: 'auto',
    left: 0,
    top: 0,
  });
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
}

export function resetScrollOnReload(): void {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  if (!isReloadNavigation()) {
    return;
  }

  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
  }

  const scheduleAfterPaint =
    window.requestAnimationFrame?.bind(window) ??
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 0));

  scrollToPageTop();
  scheduleAfterPaint(scrollToPageTop);

  window.addEventListener(
    'load',
    () => {
      scrollToPageTop();
      scheduleAfterPaint(scrollToPageTop);
    },
    { once: true },
  );
}
