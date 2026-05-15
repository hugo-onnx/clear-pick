import { CircleHelp } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { TranslationCopy } from '@/i18n';

interface BlindScoringControlsProps {
  areResultsHidden: boolean;
  copy: Pick<
    TranslationCopy['matrix'],
    'scoringControls' | 'blindScoring' | 'blindScoringHelpLabel' | 'blindScoringHelp'
  >;
  onResultsHiddenChange: (value: boolean) => void;
}

const blindScoringHelpId = 'blind-scoring-help';
const blindScoringToggleId = 'blind-scoring-toggle';

export function BlindScoringControls({
  areResultsHidden,
  copy,
  onResultsHiddenChange,
}: BlindScoringControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpStyle, setHelpStyle] = useState<CSSProperties>({});
  const helpRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    const helpButton = buttonRef.current;
    if (!helpButton) return;

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const width = Math.min(288, Math.max(0, viewportWidth - 32));
    const buttonRect = helpButton.getBoundingClientRect();
    const rightSideLeft = buttonRect.right + 8;
    const hasRightSideRoom = rightSideLeft + width <= viewportWidth - 16;

    if (hasRightSideRoom) {
      setHelpStyle({
        '--blind-scoring-help-left': `${rightSideLeft}px`,
        '--blind-scoring-help-top': `${buttonRect.top}px`,
        '--blind-scoring-help-width': `${width}px`,
      } as CSSProperties);
      return;
    }

    const centeredLeft = buttonRect.left + buttonRect.width / 2 - width / 2;
    const left = Math.min(Math.max(centeredLeft, 16), viewportWidth - width - 16);

    setHelpStyle({
      '--blind-scoring-help-left': `${left}px`,
      '--blind-scoring-help-top': `${buttonRect.bottom + 8}px`,
      '--blind-scoring-help-width': `${width}px`,
    } as CSSProperties);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handlePointerDown = (event: PointerEvent) => {
      const helpContainer = helpRef.current;
      const target = event.target;
      if (helpContainer && target instanceof Node && !helpContainer.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      aria-label={copy.scoringControls}
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-full border border-cyan-900/20 bg-white/85 px-3 py-2 shadow-sm transition hover:border-cyan-900/35 hover:bg-white">
        <input
          aria-describedby={blindScoringHelpId}
          aria-label={copy.blindScoring}
          checked={areResultsHidden}
          className="peer sr-only"
          id={blindScoringToggleId}
          onChange={(event) => onResultsHiddenChange(event.currentTarget.checked)}
          role="switch"
          type="checkbox"
        />
        <span
          aria-hidden="true"
          className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-cyan-600 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              areResultsHidden ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </span>
        <span className="whitespace-nowrap text-sm font-semibold text-foreground">
          {copy.blindScoring}
        </span>
      </label>

      <div
        className="group relative shrink-0"
        onFocusCapture={updatePosition}
        onMouseEnter={updatePosition}
        ref={helpRef}
      >
        <button
          aria-controls={blindScoringHelpId}
          aria-describedby={blindScoringHelpId}
          aria-expanded={isOpen}
          aria-label={copy.blindScoringHelpLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-900/20 bg-white/85 text-muted-foreground shadow-sm transition hover:border-cyan-900/35 hover:bg-white hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => {
            if (!isOpen) updatePosition();
            setIsOpen((current) => !current);
          }}
          ref={buttonRef}
          type="button"
        >
          <CircleHelp aria-hidden="true" className="h-4 w-4" />
        </button>
        <p
          className={cn(
            'pointer-events-none fixed left-[var(--blind-scoring-help-left,1rem)] top-[var(--blind-scoring-help-top,4rem)] z-20 w-[var(--blind-scoring-help-width,18rem)] rounded-md border border-border bg-white px-3 py-2 text-sm leading-5 text-muted-foreground opacity-0 shadow-lg transition group-hover:opacity-100',
            isOpen && 'opacity-100',
          )}
          id={blindScoringHelpId}
          role="tooltip"
          style={helpStyle}
        >
          {copy.blindScoringHelp}
        </p>
      </div>
    </div>
  );
}
