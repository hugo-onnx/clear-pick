import { ArrowUp, BookOpen, CircleHelp, Mail } from 'lucide-react';
import type { TranslationCopy } from '../i18n';
import { Button } from './ui/button';

interface AppFooterProps {
  copy: TranslationCopy['footer'];
}

export function AppFooter({ copy }: AppFooterProps) {
  const handleBackToTop = () => {
    const decisionMatrix = document.getElementById('decision-matrix');

    if (decisionMatrix) {
      decisionMatrix.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  };

  return (
    <footer className="border-t border-border py-7 sm:py-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img
              alt=""
              aria-hidden="true"
              className="size-8 shrink-0 rounded-md"
              src="/favicon.svg"
            />
            <p className="text-sm font-semibold text-foreground">{copy.productLabel}</p>
          </div>
          <p
            className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"
            id="site-footer-note"
          >
            {copy.note}
          </p>
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2" size="sm" variant="outline">
                <a href="/how-it-works">
                  <BookOpen aria-hidden="true" className="size-4" />
                  {copy.howItWorks}
                </a>
              </Button>
              <Button asChild className="gap-2" size="sm" variant="outline">
                <a href="/how-it-works#faq-heading">
                  <CircleHelp aria-hidden="true" className="size-4" />
                  {copy.faq}
                </a>
              </Button>
              <Button asChild className="gap-2" size="sm" variant="outline">
                <a href={`mailto:${copy.contactEmail}`}>
                  <Mail aria-hidden="true" className="size-4" />
                  {copy.contactCta}
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-0 sm:shrink-0">
          <Button
            className="gap-2"
            onClick={handleBackToTop}
            size="sm"
            variant="outline"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            {copy.backToTop}
          </Button>
        </div>
      </div>
    </footer>
  );
}
