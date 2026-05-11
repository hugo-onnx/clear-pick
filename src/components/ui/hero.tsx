"use client";

import { MeshGradient } from '@paper-design/shaders-react';
import { ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import type { TranslationCopy } from '@/i18n';
import { cn } from '@/lib/utils';

interface ShaderShowcaseProps {
  copy: TranslationCopy['hero'];
  headingId?: string;
  onPrimaryCtaClick?: () => void;
}

const SHADER_MIN_PIXEL_RATIO = 2;
const SHADER_MAX_PIXEL_COUNT = 1920 * 1080 * 4;
const SHADER_CONTEXT = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
} satisfies WebGLContextAttributes;
const PRIMARY_SHADER_COLORS = [
  '#000000',
  '#06b6d4',
  '#0891b2',
  '#164e63',
  '#f97316',
];
const HIGHLIGHT_SHADER_COLORS = ['#000000', '#ffffff', '#06b6d4', '#f97316'];
const TRANSPARENT_SHADER_STYLE = {
  backgroundColor: 'transparent',
} satisfies CSSProperties;
const PRIMARY_SHADER_IDLE_SPEED = 0.28;
const PRIMARY_SHADER_ACTIVE_SPEED = 0.42;
const HIGHLIGHT_SHADER_IDLE_SPEED = 0.2;
const HIGHLIGHT_SHADER_ACTIVE_SPEED = 0.32;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

function useHeroVisibility(containerRef: RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);

      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(Boolean(entry?.isIntersecting || entry?.intersectionRatio > 0));
      },
      {
        rootMargin: '-96px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  return isVisible;
}

export default function ShaderShowcase({
  copy,
  headingId = 'landing-title',
  onPrimaryCtaClick,
}: ShaderShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isHeroVisible = useHeroVisibility(containerRef);
  const shouldAnimateShaders = isHeroVisible && !prefersReducedMotion;
  const primaryShaderSpeed = shouldAnimateShaders
    ? isActive
      ? PRIMARY_SHADER_ACTIVE_SPEED
      : PRIMARY_SHADER_IDLE_SPEED
    : 0;
  const highlightShaderSpeed = shouldAnimateShaders
    ? isActive
      ? HIGHLIGHT_SHADER_ACTIVE_SPEED
      : HIGHLIGHT_SHADER_IDLE_SPEED
    : 0;
  const overlayOpacity = prefersReducedMotion ? 0.36 : isActive ? 0.42 : 0.34;

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex min-h-svh overflow-hidden bg-black text-white sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-5rem)]"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      ref={containerRef}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#063547_34%,#111827_62%,#9a3412_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.24)_44%,rgba(0,0,0,0.72)_100%)]"
      />

      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-90"
        colors={PRIMARY_SHADER_COLORS}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={primaryShaderSpeed}
        style={TRANSPARENT_SHADER_STYLE}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-45 mix-blend-screen"
        colors={HIGHLIGHT_SHADER_COLORS}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={highlightShaderSpeed}
        style={TRANSPARENT_SHADER_STYLE}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.5))] transition-opacity duration-500 motion-reduce:transition-none"
        style={{ opacity: overlayOpacity }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-black/85"
      />

      <div className="relative z-20 flex min-h-svh w-full flex-col sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        <main className="relative z-20 mx-auto flex min-h-svh w-full max-w-4xl flex-col items-center justify-center px-4 pb-32 pt-20 text-center sm:min-h-[calc(100svh-4rem)] sm:px-8 sm:pb-28 sm:pt-24 lg:min-h-[calc(100vh-5rem)]">
          <div className="relative isolate mb-4 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.24)] sm:px-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cyan-400/[0.04]"
            />
            <Sparkles aria-hidden="true" className="relative z-10 size-4 text-cyan-100" />
            <span className="relative z-10 min-w-0 text-xs font-semibold leading-5 text-white/95 sm:text-sm">
              {copy.eyebrow}
            </span>
          </div>

          <h1
            aria-label={copy.headingAria}
            className="mb-5 w-full max-w-[22rem] text-balance text-[clamp(2.55rem,12vw,4rem)] font-bold leading-none tracking-normal text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.45)] sm:max-w-4xl sm:text-6xl md:text-7xl lg:text-8xl"
            id={headingId}
          >
            <span className="mx-auto mb-2 block max-w-[18rem] pb-1 text-[clamp(1.75rem,8vw,3rem)] font-normal leading-[1.16] tracking-normal text-white sm:max-w-none sm:text-6xl lg:text-7xl">
              {copy.headingFirst}
            </span>
            <span className="block font-black text-white drop-shadow-2xl">
              {copy.headingEmphasis}
            </span>
            <span className="block font-light italic text-white/90">
              {copy.headingLast}
            </span>
          </h1>

          <p
            className="mx-auto mb-7 w-full max-w-[19.5rem] text-pretty text-base font-medium leading-7 text-white/86 sm:max-w-2xl sm:text-lg sm:leading-8"
          >
            {copy.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              className="inline-flex min-h-12 w-full max-w-[13rem] cursor-pointer transform-gpu items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 px-7 py-3 text-base font-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition-all duration-300 [font-weight:900] hover:scale-[1.03] hover:from-cyan-400 hover:to-orange-400 hover:shadow-[0_20px_54px_rgba(0,0,0,0.34)] active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto sm:max-w-none sm:px-9 sm:py-4"
              onClick={onPrimaryCtaClick}
              type="button"
            >
              {copy.start}
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </main>

        <aside
          aria-describedby="local-save-notice-body"
          aria-labelledby="local-save-notice-title"
          aria-expanded={isNoticeExpanded}
          className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 outline-none sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-6"
          role="note"
          tabIndex={0}
          id="local-save-notice"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsNoticeExpanded(false);
            }
          }}
          onFocus={() => setIsNoticeExpanded(true)}
          onMouseEnter={() => setIsNoticeExpanded(true)}
          onMouseLeave={() => setIsNoticeExpanded(false)}
        >
          <div
            className={cn(
              'pointer-events-none absolute bottom-full left-1/2 mb-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 transform-gpu rounded-lg border border-white/15 bg-black/70 px-4 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-[opacity,transform] duration-[160ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:left-auto sm:translate-x-0 sm:right-0 sm:w-[min(22rem,calc(100vw-2rem))]',
              isNoticeExpanded
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-1.5 scale-[0.98] opacity-0',
            )}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-lg bg-[linear-gradient(135deg,rgba(6,182,212,0.14),transparent_48%),linear-gradient(315deg,rgba(249,115,22,0.12),transparent_54%)]"
            />
            <p
              className="relative z-10 text-sm leading-6 text-white/84"
              id="local-save-notice-body"
            >
              {copy.localStorageNoticeBody}
            </p>
          </div>

          <div className="relative w-fit overflow-hidden rounded-lg border border-white/15 bg-black/35 px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),transparent_50%),linear-gradient(315deg,rgba(249,115,22,0.12),transparent_58%)] opacity-90"
            />
            <div className="relative z-10 flex items-center gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-cyan-200"
              />
              <h2
                className="whitespace-nowrap text-xs font-semibold uppercase leading-4 text-white/95"
                id="local-save-notice-title"
              >
                {copy.localStorageNoticeTitle}
              </h2>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
