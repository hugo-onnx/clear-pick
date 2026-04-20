import ShaderShowcase from '@/components/ui/hero';

function scrollToMatrix() {
  document.getElementById('decision-matrix')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function LandingHero() {
  return <ShaderShowcase headingId="landing-title" onPrimaryCtaClick={scrollToMatrix} />;
}
