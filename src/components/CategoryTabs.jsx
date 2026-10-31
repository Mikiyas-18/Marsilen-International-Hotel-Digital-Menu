import {
  Bell, Coffee, CakeSlice, ConciergeBell, Sunrise, UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mock';

const ICONS = {
  all: ConciergeBell,
  breakfast: Sunrise,
  main: UtensilsCrossed,
  drinks: Coffee,
  desserts: CakeSlice,
  amenities: Bell,
};

export default function CategoryTabs({ active, onChange }) {
  const { t } = useApp();
  return (
    <div
      role="tablist"
      aria-label={t('menu.popular')}
      className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:justify-center sm:gap-8 sm:px-0 dark:border-white/10"
    >
      {CATEGORIES.map((c) => {
        const Icon = ICONS[c.id];
        const on = active === c.id;
        return (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={`group flex min-w-[84px] snap-start flex-col items-center gap-2 border-b-2 px-2 pb-3 pt-4 text-sm font-medium transition ${
              on ? 'border-brass text-royal dark:text-white' : 'border-transparent text-slate-600 hover:text-royal dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl transition ${
                on
                  ? 'bg-brass text-royal shadow-md'
                  : 'bg-white text-royal shadow-soft group-hover:shadow-lift dark:bg-navy-800 dark:text-slate-100'
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="whitespace-nowrap">{t(c.key)}</span>
          </button>
        );
      })}
    </div>
  );
}
