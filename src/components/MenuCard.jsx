import { memo, useEffect, useState } from 'react';
import { Clock, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DietBadge from './DietBadge';
import QuantityStepper from './QuantityStepper';

function MenuCard({ item }) {
  const { t, loc, money, cart, addItem, setQty } = useApp();
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => setImgOk(true), [item.img]);
  const qty = cart[item.id]?.qty || 0;
  const name = loc(item.name);

  return (
    <article
      className={`card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
        item.available === false ? 'opacity-60 grayscale' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 dark:from-navy-800 dark:to-navy-900">
        {imgOk ? (
          <img
            src={item.img}
            alt={name}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-6xl" aria-hidden>
            {item.emoji}
          </div>
        )}
        {item.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <DietBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-navy-900/75 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <Clock className="h-3 w-3" aria-hidden />
          {t('menu.minutes', { min: item.prep })}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-serif text-base font-bold leading-snug">{name}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{loc(item.desc)}</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-sm font-bold text-royal dark:text-brass">{money(item.price)}</p>
          {item.available === false ? (
            <button type="button" className="btn-ghost" disabled>
              {t('menu.soldOut')}
              <span className="sr-only"> {name}</span>
            </button>
          ) : qty === 0 ? (
            <button
              type="button"
              className="btn min-h-[40px] rounded-full bg-royal px-4 text-xs text-white shadow-md hover:bg-royal-800 dark:bg-brass dark:text-royal"
              onClick={() => addItem(item.id)}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {t('menu.add')}
              <span className="sr-only"> {name}</span>
            </button>
          ) : (
            <QuantityStepper qty={qty} name={name} onChange={(n) => setQty(item.id, n)} />
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(MenuCard);
