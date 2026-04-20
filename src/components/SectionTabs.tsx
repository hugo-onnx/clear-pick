const TAB_ITEMS = ['Overview', 'Matrix', 'Insights', 'History'];

export function SectionTabs() {
  return (
    <section aria-labelledby="section-tabs-title" className="relative">
      <div className="overflow-hidden rounded-lg border border-border bg-card px-5 py-5 shadow-[0_20px_70px_rgba(6,182,212,0.1)] backdrop-blur-2xl sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Workspace
            </p>
            <h2
              className="font-display text-2xl font-semibold tracking-normal text-foreground"
              id="section-tabs-title"
            >
              From priorities to ranking.
            </h2>
          </div>

          <ul
            aria-label="Placeholder workspace tabs"
            className="flex flex-wrap gap-2"
          >
            {TAB_ITEMS.map((label, index) => {
              const isActive = index === 0;

              return (
                <li key={label}>
                  <span
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex min-w-28 items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-orange-500 text-white shadow-[0_12px_32px_rgba(6,182,212,0.22)]'
                        : 'border border-border bg-white/5 text-foreground/75 hover:border-cyan-300/35 hover:text-cyan-100'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
