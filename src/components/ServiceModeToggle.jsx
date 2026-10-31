import { ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MODES = [
  { id: 'dine-in', key: 'mode.dineIn', Icon: UtensilsCrossed },
  { id: 'takeaway', key: 'mode.takeaway', Icon: ShoppingBag },
];

/** Dine-in / Takeaway choice shown to customers who scanned a restaurant table QR. */
export default function ServiceModeToggle({ variant = 'light' }) {
  const { t, serviceMode, setServiceMode } = useApp();
  const hero = variant === 'hero';
  return (
    <div
      role="radiogroup"
      aria-label={t('mode.label')}
      className={hero ? 'flex flex-wrap gap-3' : 'grid grid-cols-2 gap-2'}
    >
      {MODES.map(({ id, key, Icon }) => {
        const on = serviceMode === id;
        const cls = hero
          ? `btn rounded-full border px-5 ${
              on ? 'border-brass bg-brass/20 text-brass ring-1 ring-brass' : 'border-white/30 text-white/80 hover:border-brass/70 hover:text-white'
            }`
          : `flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              on ? 'border-brass bg-amber-50 dark:bg-brass/10' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-800'
            }`;
        return (
          <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setServiceMode(id)} className={cls}>
            <Icon className="h-4 w-4" aria-hidden />
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
