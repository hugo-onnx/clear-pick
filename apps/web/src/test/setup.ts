import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

vi.mock('@paper-design/shaders-react', async () => {
  const React = await import('react');
  const createShaderMock =
    (testId: string) =>
    ({
      className,
      maxPixelCount,
      minPixelRatio,
      speed,
      style,
      webGlContextAttributes,
    }: {
      className?: string;
      maxPixelCount?: number;
      minPixelRatio?: number;
      speed?: number;
      style?: object;
      webGlContextAttributes?: WebGLContextAttributes;
    }) =>
      React.createElement('div', {
        className,
        'data-max-pixel-count': maxPixelCount,
        'data-min-pixel-ratio': minPixelRatio,
        'data-speed': speed,
        'data-testid': testId,
        'data-webgl-context': JSON.stringify(webGlContextAttributes),
        style,
      });

  return {
    MeshGradient: createShaderMock('mesh-gradient'),
    PulsingBorder: createShaderMock('pulsing-border'),
  };
});

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const localStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
