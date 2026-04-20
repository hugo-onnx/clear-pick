const FOOTER_LINKS = [
  { label: 'About', href: '#landing-title' },
  { label: 'Templates', href: '#decision-matrix' },
  { label: 'Support', href: '#site-footer-note' },
];

export function AppFooter() {
  return (
    <footer
      aria-labelledby="site-footer-title"
      className="rounded-lg border border-border bg-white/80 px-5 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:px-6"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Weighted Matrix
          </p>
          <h2
            className="font-display text-3xl font-semibold tracking-normal text-foreground"
            id="site-footer-title"
          >
            A calmer way to compare the choices in front of you.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Use the landing space for reflection, then move into the matrix when
            you want a clearer weighted view.
          </p>
        </div>

        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center gap-3 lg:justify-end"
        >
          {FOOTER_LINKS.map((link) => (
            <a
              className="inline-flex items-center justify-center rounded-md border border-border bg-white/70 px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-primary/25 hover:text-primary"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mt-8 text-sm leading-7 text-muted-foreground" id="site-footer-note">
        Decisions stay stored locally in this browser, so you can return to the
        same matrix without creating an account.
      </p>
    </footer>
  );
}
