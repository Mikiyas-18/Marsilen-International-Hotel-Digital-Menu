import { BadgeCheck, Leaf, WheatOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CONFIG = {
  halal: { Icon: BadgeCheck, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  vegan: { Icon: Leaf, cls: 'bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300' },
  gf: { Icon: WheatOff, cls: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
};

export default function DietBadge({ tag }) {
  const { t } = useApp();
  const c = CONFIG[tag];
  if (!c) return null;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${c.cls}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {t(`diet.${tag}`)}
    </span>
  );
}
