import type { TranslationCopy } from '../i18n';

interface AppFooterProps {
  copy: TranslationCopy['footer'];
}

export function AppFooter({ copy }: AppFooterProps) {
  return (
    <footer
      aria-labelledby="site-footer-title"
      className="border-t border-border pt-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {copy.productLabel}
          </p>
          <h2
            className="font-display text-3xl font-semibold tracking-normal text-foreground"
            id="site-footer-title"
          >
            {copy.title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {copy.description}
          </p>
        </div>

        <nav
          aria-label={copy.linksAria}
          className="flex flex-wrap items-center gap-3 lg:justify-end"
        >
          {copy.links.map((link) => (
            <a
              className="inline-flex items-center justify-center rounded-full border border-border bg-white/70 px-4 py-2.5 text-sm font-medium text-foreground/80 shadow-sm transition hover:border-primary/35 hover:bg-white hover:text-cyan-800"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mt-8 text-sm leading-7 text-muted-foreground" id="site-footer-note">
        {copy.note}
      </p>
    </footer>
  );
}
