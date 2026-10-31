import { useApp } from '../context/AppContext';

const OPTIONS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'am', label: 'አማርኛ', short: 'አማ' },
];

export default function LanguageToggle({ onDark = false }) {
  const { lang, setLang, t } = useApp();
  return (
    <div
      role="group"
      aria-label={t('header.language')}
      className={`inline-flex rounded-xl border p-0.5 ${
        onDark
          ? 'border-white/15 bg-white/10'
          : 'border-slate-200 bg-slate-100/80 dark:border-white/10 dark:bg-white/5'
      }`}
    >
      {OPTIONS.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            lang={o.code}
            aria-pressed={active}
            onClick={() => setLang(o.code)}
            className={`min-h-[36px] rounded-[10px] px-2.5 text-xs font-semibold transition duration-200 sm:px-3 sm:text-sm ${
              onDark
                ? (active ? 'bg-brass text-royal shadow' : 'text-white/70 hover:text-white')
                : active
                  ? 'bg-navy-900 text-white shadow dark:bg-gold'
                  : 'text-slate-600 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {onDark ? (
              <>
                <span className="lg:hidden">{o.short}</span>
                <span className="hidden lg:inline">{o.label}</span>
              </>
            ) : (
              o.label
            )}
          </button>
        );
      })}
    </div>
  );
}
