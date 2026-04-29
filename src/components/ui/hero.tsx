"use client";

import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';
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
      className="relative flex min-h-[100svh] overflow-hidden bg-black text-white"
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

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={['#000000', '#06b6d4', '#0891b2', '#164e63', '#f97316']}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={isActive ? 0.42 : 0.28}
        style={{ backgroundColor: '#000000' }}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen"
        colors={['#000000', '#ffffff', '#06b6d4', '#f97316']}
        distortion={0.8}
        grainMixer={0}
        grainOverlay={0}
        maxPixelCount={SHADER_MAX_PIXEL_COUNT}
        minPixelRatio={SHADER_MIN_PIXEL_RATIO}
        speed={isActive ? 0.32 : 0.2}
        style={{ backgroundColor: 'transparent' }}
        swirl={0.1}
        webGlContextAttributes={SHADER_CONTEXT}
      />
      <motion.div
        animate={{ opacity: isActive ? 0.24 : 0.16 }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.28))]"
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-20 flex min-h-[100svh] w-full flex-col">
        <header className="absolute left-0 top-0 z-30 hidden items-center px-8 py-6 sm:flex">
          <nav className="flex items-center space-x-2" aria-label={copy.navAria}>
            <a
              className="rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
              href="#decision-matrix"
            >
              {copy.navWorkflow}
            </a>
            <a
              className="rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
              href="#decision-matrix"
            >
              {copy.navScoring}
            </a>
            <a
              className="rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
              href="#local-save-notice"
            >
              {copy.navLocalSave}
            </a>
          </nav>
        </header>

        <main className="relative z-20 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            style={{ filter: 'url(#glass-effect)' }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles aria-hidden="true" className="relative z-10 size-4 text-cyan-100" />
            <span className="relative z-10 text-sm font-medium tracking-wide text-white/90">
              {copy.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            aria-label={copy.headingAria}
            className="mb-5 text-5xl font-bold leading-none tracking-normal text-white sm:text-6xl md:text-7xl lg:text-8xl"
            id={headingId}
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="mb-2 block pb-1 text-5xl font-normal leading-[1.16] tracking-normal text-white sm:text-6xl lg:text-7xl">
              {copy.headingFirst}
            </span>
            <span className="block font-black text-white drop-shadow-2xl">
              {copy.headingEmphasis}
            </span>
            <span className="block font-light italic text-white/80">
              {copy.headingLast}
            </span>
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-7 max-w-xl text-base font-light leading-7 text-white/72 sm:text-lg sm:leading-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {copy.description}
          </motion.p>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <motion.button
              className="min-h-12 cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 px-8 py-3 text-base font-black tracking-wide text-white shadow-lg transition-all duration-300 [font-weight:900] hover:from-cyan-400 hover:to-orange-400 hover:shadow-xl sm:px-10 sm:py-4"
              onClick={onPrimaryCtaClick}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copy.start}
            </motion.button>
          </motion.div>
        </main>

        <aside
          aria-describedby="local-save-notice-body"
          aria-labelledby="local-save-notice-title"
          className="absolute bottom-4 right-4 z-30 w-[min(17rem,calc(100vw-2rem))] text-left outline-none sm:bottom-8 sm:right-8"
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
            className="pointer-events-none absolute bottom-full right-0 mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl"
            initial={false}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_32%)]"
            />
            <p
              className="relative z-10 text-sm leading-6 text-white/72"
              id="local-save-notice-body"
            >
              {copy.localStorageNoticeBody}
            </p>
          </motion.div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_32%)] opacity-90"
            />
            <div className="relative z-10 flex items-center gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-cyan-200"
              />
              <h2
                className="text-xs font-semibold uppercase leading-4 tracking-[0.18em] text-white/90"
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
