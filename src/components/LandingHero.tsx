import { BackgroundPaths } from '@/components/ui/background-paths';

function scrollToMatrix() {
  document.getElementById('decision-matrix')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function LandingHero() {
  return (
    <BackgroundPaths
      ctaLabel="Start scoring"
      headingId="landing-title"
      onCtaClick={scrollToMatrix}
      subtitle="Compare choices with weighted priorities, live scoring, and a recommendation that stays grounded in what matters most."
      title="Weighted Matrix"
    />
  );
}
