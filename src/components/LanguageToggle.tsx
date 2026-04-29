import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language, TranslationCopy } from '../i18n';

interface LanguageToggleProps {
  copy: TranslationCopy['languageToggle'];
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const toggleButtonClass =
  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200';

export function LanguageToggle({
  copy,
  language,
  onLanguageChange,
}: LanguageToggleProps) {
  return (
    <div
      aria-label={copy.label}
      className="fixed right-2 top-[max(0.5rem,env(safe-area-inset-top))] z-50 inline-flex items-center gap-0.5 rounded-full border border-white/20 bg-black/70 p-0.5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-md sm:right-4 sm:top-4"
      role="group"
    >
      <Languages aria-hidden="true" className="ml-1.5 size-3.5 text-white/70" />
      <button
        aria-label={copy.switchToEnglish}
        aria-pressed={language === 'en'}
        className={cn(
          toggleButtonClass,
          language === 'en'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-white/72 hover:bg-white/10 hover:text-white',
        )}
        onClick={() => onLanguageChange('en')}
        type="button"
      >
        {copy.english}
      </button>
      <button
        aria-label={copy.switchToSpanish}
        aria-pressed={language === 'es'}
        className={cn(
          toggleButtonClass,
          language === 'es'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-white/72 hover:bg-white/10 hover:text-white',
        )}
        onClick={() => onLanguageChange('es')}
        type="button"
      >
        {copy.spanish}
      </button>
    </div>
  );
}
