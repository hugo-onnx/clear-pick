import ShaderShowcase from '@/components/ui/hero';
import type { TranslationCopy } from '../i18n';

function scrollToMatrix() {
  document.getElementById('decision-matrix')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

interface LandingHeroProps {
  copy: TranslationCopy['hero'];
}

export function LandingHero({ copy }: LandingHeroProps) {
  return (
    <ShaderShowcase
      copy={copy}
      headingId="landing-title"
      onPrimaryCtaClick={scrollToMatrix}
    />
  );
}
