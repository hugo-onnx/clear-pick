"use client";

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PATH_COUNT = 36;
const FLOW_START_OFFSET = -0.24;
const FLOW_END_OFFSET = 1.16;

function FloatingPaths({ position }: { position: number }) {
  const maskId = `background-paths-title-mask-${position > 0 ? 'forward' : 'reverse'}`;
  const blurId = `background-paths-title-blur-${position > 0 ? 'forward' : 'reverse'}`;
  const flowOffsets =
    position > 0
      ? [FLOW_START_OFFSET, FLOW_END_OFFSET]
      : [FLOW_END_OFFSET, FLOW_START_OFFSET];
  const paths = Array.from({ length: PATH_COUNT }, (_, i) => {
    const laneY = -82 + i * 13;
    const drift = position * (28 + (i % 6) * 4);
    const bend = (i % 2 === 0 ? 1 : -1) * (12 + (i % 4) * 3);
    const startX = -220;
    const endX = 916;
    const startY = laneY;
    const endY = laneY + drift;
    const controlOneY = startY + drift * 0.25 + bend;
    const controlTwoY = endY - drift * 0.25 - bend;

    return {
      id: i,
      d: `M${startX} ${startY}C64 ${controlOneY} 632 ${controlTwoY} ${endX} ${endY}`,
      opacity: Math.min(0.58, 0.16 + i * 0.012),
      phase: (i * 0.72) % 18,
      segmentLength: 0.14 + (i % 5) * 0.018,
      travelDuration: 24 + (i % 7) * 1.8,
      width: 0.5 + i * 0.03,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        aria-hidden="true"
        className="h-full w-full text-slate-950 dark:text-white"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 696 316"
      >
        <defs>
          <filter
            height="200%"
            id={blurId}
            width="200%"
            x="-50%"
            y="-50%"
          >
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <mask height="316" id={maskId} maskUnits="userSpaceOnUse" width="696" x="0" y="0">
            <rect fill="white" height="316" width="696" />
            <rect
              fill="black"
              filter={`url(#${blurId})`}
              height="164"
              opacity="0.94"
              rx="72"
              width="632"
              x="32"
              y="56"
            />
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          {paths.map((path) => (
            <motion.path
              animate={{
                pathOffset: flowOffsets,
              }}
              d={path.d}
              initial={{
                pathLength: path.segmentLength,
                pathOffset: flowOffsets[0],
              }}
              key={path.id}
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity={path.opacity}
              strokeWidth={path.width}
              transition={{
                delay: -path.phase,
                duration: path.travelDuration,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  ctaLabel = 'Discover Excellence',
  headingId,
  onCtaClick,
  subtitle,
  title = 'Background Paths',
}: {
  ctaLabel?: string;
  headingId?: string;
  onCtaClick?: () => void;
  subtitle?: string;
  title?: string;
}) {
  const words = title.split(' ');

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-white text-slate-950 dark:bg-neutral-950 dark:text-white"
    >
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
        <motion.div
          animate={{ opacity: 1 }}
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          <h1
            aria-label={title}
            className="hero-title mb-6 pb-2 text-5xl font-bold leading-[1.12] tracking-normal drop-shadow-[0_3px_30px_rgba(255,255,255,1)] sm:text-7xl md:text-8xl dark:drop-shadow-[0_2px_18px_rgba(0,0,0,0.9)]"
            id={headingId}
          >
            {words.map((word, wordIndex) => (
              <span
                aria-hidden="true"
                className="mr-4 inline-block last:mr-0"
                key={`${wordIndex}-${word}`}
              >
                {word.split('').map((letter, letterIndex) => (
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block pb-[0.08em] bg-gradient-to-r from-black to-slate-950 bg-clip-text text-transparent dark:from-white dark:to-white/80"
                    initial={{ opacity: 0, y: 100 }}
                    key={`${wordIndex}-${letterIndex}-${letter}`}
                    transition={{
                      damping: 25,
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      stiffness: 150,
                      type: 'spring',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {subtitle ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-9 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-white/65"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.55, duration: 0.7 }}
            >
              {subtitle}
            </motion.p>
          ) : null}

          <div className="group relative inline-block overflow-visible rounded-2xl bg-gradient-to-b from-black/10 to-white/10 p-0.5 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:from-white/10 dark:to-black/10">
            <Button
              className="h-auto rounded-[1.15rem] border border-black/10 bg-white/95 px-8 py-4 text-lg font-semibold leading-none text-black backdrop-blur-md transition-all duration-300 hover:bg-white/95 hover:text-slate-950 hover:shadow-md dark:border-white/10 dark:bg-black/95 dark:text-white dark:hover:bg-black/95 dark:hover:text-white dark:hover:shadow-neutral-800/50"
              onClick={onCtaClick}
              variant="ghost"
            >
              <span className="opacity-90 transition-opacity group-hover:opacity-100">
                {ctaLabel}
              </span>
              <ArrowRight
                aria-hidden="true"
                className="ml-3 size-5 opacity-70 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100"
              />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
