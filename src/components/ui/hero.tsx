"use client";

import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import type { TranslationCopy } from '@/i18n';

interface ShaderShowcaseProps {
  copy: TranslationCopy['hero'];
  headingId?: string;
  onPrimaryCtaClick?: () => void;
}

const SHADER_MIN_PIXEL_RATIO = 2;
const SHADER_MAX_PIXEL_COUNT = 32_000_000;
const SHADER_CONTEXT = {
  alpha: true,
  antialias: true,
  depth: false,
  powerPreference: 'high-performance',
} satisfies WebGLContextAttributes;

export default function ShaderShowcase({
  copy,
  headingId = 'landing-title',
  onPrimaryCtaClick,
}: ShaderShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const primaryShaderSpeed = prefersReducedMotion ? 0 : isActive ? 0.42 : 0.28;
  const highlightShaderSpeed = prefersReducedMotion ? 0 : isActive ? 0.32 : 0.2;
  const hoverScale = prefersReducedMotion ? undefined : { scale: 1.03 };
  const tapScale = prefersReducedMotion ? undefined : { scale: 0.97 };

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);
    const container = containerRef.current;

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex min-h-[calc(100svh-3.5rem)] overflow-hidden bg-black text-white sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-5rem)]"
      ref={containerRef}
    >
      <svg aria-hidden="true" className="absolute inset-0 h-0 w-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              result="tint"
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
            />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

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
        colors={['#000000', '#06b6d4', '#0891b2', '#164e63', '#f97316']}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={primaryShaderSpeed}
        style={{ backgroundColor: 'transparent' }}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-45 mix-blend-screen"
        colors={['#000000', '#ffffff', '#06b6d4', '#f97316']}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={highlightShaderSpeed}
        style={{ backgroundColor: 'transparent' }}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <motion.div
        animate={{ opacity: prefersReducedMotion ? 0.36 : isActive ? 0.42 : 0.34 }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.5))]"
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-black/85"
      />

      <div className="relative z-20 flex min-h-[calc(100svh-3.5rem)] w-full flex-col sm:min-h-[calc(100svh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        <main className="relative z-20 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-4xl flex-col items-center justify-center px-4 pb-32 pt-20 text-center sm:min-h-[calc(100svh-4rem)] sm:px-8 sm:pb-28 lg:min-h-[calc(100vh-5rem)]">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:px-4"
            initial={false}
            style={{ filter: 'url(#glass-effect)' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <Sparkles aria-hidden="true" className="relative z-10 size-4 text-cyan-100" />
            <span className="relative z-10 min-w-0 text-sm font-semibold leading-5 text-white/95">
              {copy.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            aria-label={copy.headingAria}
            className="mb-5 w-full max-w-[20rem] text-balance text-4xl font-bold leading-none tracking-normal text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.45)] sm:max-w-4xl sm:text-6xl md:text-7xl lg:text-8xl"
            id={headingId}
            initial={false}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <span className="mx-auto mb-2 block max-w-[18rem] pb-1 text-3xl font-normal leading-[1.16] tracking-normal text-white sm:max-w-none sm:text-6xl lg:text-7xl">
              {copy.headingFirst}
            </span>
            <span className="block font-black text-white drop-shadow-2xl">
              {copy.headingEmphasis}
            </span>
            <span className="block font-light italic text-white/90">
              {copy.headingLast}
            </span>
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-7 max-w-2xl text-pretty text-base font-medium leading-7 text-white/86 sm:text-lg sm:leading-8"
            initial={false}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            {copy.description}
          </motion.p>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            initial={false}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <motion.button
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 px-7 py-3 text-base font-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition-all duration-300 [font-weight:900] hover:from-cyan-400 hover:to-orange-400 hover:shadow-[0_20px_54px_rgba(0,0,0,0.34)] sm:px-9 sm:py-4"
              onClick={onPrimaryCtaClick}
              type="button"
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              {copy.start}
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </main>

        <aside
          aria-describedby="local-save-notice-body"
          aria-labelledby="local-save-notice-title"
          aria-expanded={isNoticeExpanded}
          className="absolute inset-x-3 bottom-3 z-30 mx-auto w-auto max-w-sm text-left outline-none sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0 sm:w-[min(18rem,calc(100vw-2rem))]"
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
          <motion.div
            animate={{
              opacity: isNoticeExpanded ? 1 : 0,
              scale: isNoticeExpanded ? 1 : 0.98,
              y: isNoticeExpanded ? 0 : 6,
            }}
            className="pointer-events-none absolute bottom-full right-0 mb-2 w-full rounded-lg border border-white/15 bg-black/70 px-4 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:w-[min(22rem,calc(100vw-2rem))]"
            initial={false}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
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
          </motion.div>

          <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black/35 px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
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
                className="text-xs font-semibold uppercase leading-4 text-white/95"
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
