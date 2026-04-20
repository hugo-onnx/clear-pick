import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'framer-motion';
import { Button } from '@/components/ui/button';

function scrollToMatrix() {
  document.getElementById('decision-matrix')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export const Component = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY],
  );

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.45) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.45) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <section
      aria-labelledby="landing-title"
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,247,238,0.92),transparent_34%),radial-gradient(circle_at_top_right,rgba(212,145,93,0.18),transparent_28%),linear-gradient(180deg,rgba(249,241,232,0.98)_0%,rgba(244,232,221,0.96)_55%,rgba(239,226,215,1)_100%)]" />

      <div
        className="absolute inset-0 z-0 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 opacity-[0.08]">
          <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
        </div>
        <motion.div
          className="absolute inset-0 opacity-[0.45]"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        >
          <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-8%] top-[14%] h-[28rem] w-[28rem] rounded-full bg-[rgba(201,114,62,0.24)] blur-[140px]" />
        <div className="absolute right-[-8%] top-[-4%] h-[22rem] w-[22rem] rounded-full bg-[rgba(211,153,107,0.20)] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[18%] h-[20rem] w-[20rem] rounded-full bg-[rgba(82,113,158,0.12)] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl text-center lg:text-left">
          <div className="mx-auto flex max-w-max items-center gap-3 rounded-full border border-white/[0.6] bg-white/[0.55] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary shadow-[0_12px_30px_rgba(91,50,32,0.08)] backdrop-blur-md lg:mx-0">
            Weighted Matrix
          </div>
          <div className="mt-8 space-y-5">
            <h1
              className="font-display text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl"
              id="landing-title"
            >
              Make Smarter Decisions
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0">
              Step into a calmer decision flow. Start with a focused hero, then
              move into a weighted matrix that turns instinct, tradeoffs, and
              competing priorities into a visible recommendation.
            </p>
          </div>

          <div className="mt-10 flex justify-center lg:justify-start">
            <Button
              className="min-w-40 bg-primary px-8 text-base font-semibold shadow-[0_18px_40px_rgba(155,87,46,0.24)]"
              onClick={scrollToMatrix}
              size="lg"
            >
              Start
            </Button>
          </div>
        </div>

        <div className="grid max-w-xl gap-4 sm:grid-cols-2 lg:max-w-lg">
          <article className="rounded-[28px] border border-white/[0.65] bg-white/[0.68] p-6 shadow-[0_20px_70px_rgba(91,50,32,0.11)] backdrop-blur-xl sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Decision focus
            </p>
            <div className="mt-5 flex items-end justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Clarity score</p>
                <p className="mt-2 font-display text-5xl tracking-[-0.05em] text-foreground">
                  84
                </p>
              </div>
              <div className="flex gap-2">
                <span className="h-20 w-4 rounded-full bg-primary/[0.3]" />
                <span className="h-28 w-4 rounded-full bg-primary/[0.55]" />
                <span className="h-36 w-4 rounded-full bg-primary" />
              </div>
            </div>
          </article>

          <article className="rounded-[24px] border border-white/[0.6] bg-white/[0.62] p-5 shadow-[0_16px_50px_rgba(91,50,32,0.08)] backdrop-blur-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What matters
            </p>
            <div className="mt-4 space-y-3">
              {[
                ['Growth', '40%'],
                ['Stability', '35%'],
                ['Flexibility', '25%'],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between text-sm" key={label}>
                  <span className="text-foreground/80">{label}</span>
                  <strong className="text-foreground">{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-white/[0.6] bg-[rgba(250,244,237,0.72)] p-5 shadow-[0_16px_50px_rgba(91,50,32,0.08)] backdrop-blur-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Best fit
            </p>
            <div className="mt-5 flex items-end gap-3">
              <span className="h-12 w-5 rounded-t-full bg-primary/[0.35]" />
              <span className="h-24 w-5 rounded-t-full bg-primary/[0.55]" />
              <span className="h-32 w-5 rounded-t-full bg-primary" />
              <div className="ml-2">
                <p className="text-sm font-medium text-foreground">Option B</p>
                <p className="text-sm text-muted-foreground">Highest weighted fit</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

function GridPattern({
  offsetX,
  offsetY,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
}) {
  return (
    <svg className={cn('h-full w-full text-[rgba(121,81,58,0.65)]')}>
      <defs>
        <motion.pattern
          height="40"
          id="grid-pattern"
          patternUnits="userSpaceOnUse"
          width="40"
          x={offsetX}
          y={offsetY}
        >
          <path
            className="stroke-current"
            d="M 40 0 L 0 0 0 40"
            fill="none"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect fill="url(#grid-pattern)" height="100%" width="100%" />
    </svg>
  );
}
