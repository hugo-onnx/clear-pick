import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copy } from '@/i18n';
import ShaderShowcase from './hero';

const heroCopy = copy.hero;
const originalIntersectionObserver = globalThis.IntersectionObserver;
const originalWindowIntersectionObserver = window.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '-96px 0px';
  readonly thresholds = [0.01];

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();

  trigger(entry: Partial<IntersectionObserverEntry>) {
    this.callback(
      [
        {
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: 0,
          intersectionRect: {} as DOMRectReadOnly,
          isIntersecting: false,
          rootBounds: null,
          target: document.body,
          time: 0,
          ...entry,
        },
      ],
      this,
    );
  }
}

function installIntersectionObserverMock() {
  MockIntersectionObserver.instances = [];

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: MockIntersectionObserver,
  });
}

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    } satisfies MediaQueryList),
  });
}

function getShaderSpeeds() {
  return screen
    .getAllByTestId('mesh-gradient')
    .map((shader) => shader.getAttribute('data-speed'));
}

afterEach(() => {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: originalIntersectionObserver,
  });
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: originalWindowIntersectionObserver,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
  vi.restoreAllMocks();
});

describe('ShaderShowcase', () => {
  it('pauses shader animation when reduced motion is enabled', async () => {
    mockReducedMotion(true);

    render(<ShaderShowcase copy={heroCopy} />);

    await waitFor(() => {
      expect(getShaderSpeeds()).toEqual(['0', '0']);
    });
  });

  it('pauses shader animation when the hero leaves the viewport', async () => {
    installIntersectionObserverMock();

    render(<ShaderShowcase copy={heroCopy} />);

    await waitFor(() => {
      expect(MockIntersectionObserver.instances).toHaveLength(1);
    });
    expect(getShaderSpeeds()).toEqual(['0.28', '0.2']);

    act(() => {
      MockIntersectionObserver.instances[0].trigger({
        intersectionRatio: 0,
        isIntersecting: false,
      });
    });

    await waitFor(() => {
      expect(getShaderSpeeds()).toEqual(['0', '0']);
    });
  });

  it('uses the capped shader budget and lean WebGL context', () => {
    render(<ShaderShowcase copy={heroCopy} />);

    const [primaryShader] = screen.getAllByTestId('mesh-gradient');
    expect(primaryShader).toHaveAttribute('data-min-pixel-ratio', '2');
    expect(primaryShader).toHaveAttribute(
      'data-max-pixel-count',
      String(1920 * 1080 * 4),
    );
    expect(JSON.parse(primaryShader.dataset.webglContext ?? '{}')).toEqual({
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
  });
});
