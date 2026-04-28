import type { TranslationCopy } from '../i18n';

interface AppFooterProps {
  copy: TranslationCopy['footer'];
}

export function AppFooter({ copy }: AppFooterProps) {
  return (
    <footer className="border-t border-border py-5">
      <div className="flex items-center gap-3">
        <img
          alt=""
          aria-hidden="true"
          className="size-8 shrink-0 rounded-md"
          src="/favicon.svg"
        />
        <p className="text-sm font-semibold text-foreground">{copy.productLabel}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground" id="site-footer-note">
        {copy.note}
      </p>
    </footer>
  );
}
