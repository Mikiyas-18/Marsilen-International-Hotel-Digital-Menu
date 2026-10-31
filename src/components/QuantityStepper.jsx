import { Minus, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QuantityStepper({ qty, onChange, name, compact = false }) {
  const { t } = useApp();
  const size = compact ? 'h-9 w-9' : 'h-11 w-11';
  const btn = `${size} grid place-items-center rounded-xl text-navy-900 transition active:scale-90 hover:bg-amber-100 dark:text-slate-100 dark:hover:bg-white/10`;
  return (
    <div
      role="group"
      aria-label={`${t('common.quantity')}: ${name}`}
      className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-white/5"
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(qty - 1)}
        aria-label={t('common.decrease', { name })}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span aria-live="polite" className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(qty + 1)}
        aria-label={t('common.increase', { name })}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
