import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DESKS_BY_ID } from '../../data/accounts';

const DAY = 24 * 3600 * 1000;
const PERIODS = ['day', 'all'];

export default function OverviewTab() {
  const { t, loc, orders, menuItems, money } = useApp();
  const [period, setPeriod] = useState('day');

  const byId = useMemo(() => Object.fromEntries(menuItems.map((i) => [i.id, i])), [menuItems]);
  const itemName = (line) => loc(byId[line.id]?.name ?? line.name) || line.id;

  const inPeriod = useMemo(() => {
    const since = period === 'day' ? Date.now() - DAY : 0;
    return orders.filter((o) => o.type === 'food' && o.createdAt >= since);
  }, [orders, period]);

  // One row per dish: how many were ordered, in how many orders.
  const dishes = useMemo(() => {
    const rows = new Map();
    inPeriod.forEach((o) =>
      (o.items ?? []).forEach((l) => {
        const row = rows.get(l.id) ?? { id: l.id, name: l.name, qty: 0, orders: 0 };
        row.qty += l.qty;
        row.orders += 1;
        rows.set(l.id, row);
      }),
    );
    return [...rows.values()].sort((a, b) => b.qty - a.qty);
  }, [inPeriod]);

  const totalDishes = dishes.reduce((s, d) => s + d.qty, 0);
  const topQty = dishes[0]?.qty ?? 1;

  const tiles = [
    { label: t('admin.stat.openOrders'), value: orders.filter((o) => o.status !== 'completed').length },
    { label: t('admin.stat.sales'), value: money(inPeriod.reduce((s, o) => s + o.total, 0), 'ETB') },
    { label: t('admin.stat.dishes'), value: totalDishes },
    { label: t('admin.stat.soldOut'), value: menuItems.filter((i) => !i.available).length },
  ];

  const recent = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6), [orders]);

  return (
    <div className="space-y-6">
      <div role="group" aria-label={t('admin.items.title')} className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => setPeriod(p)}
            className={`chip ${period === p ? 'chip-on' : 'chip-off'}`}
          >
            {t(`admin.period.${p}`)}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((s) => (
          <div key={s.label} className="card p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</dt>
            <dd className="mt-1 text-2xl font-extrabold tabular-nums text-gold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="dishes-title" className="card p-5">
        <h2 id="dishes-title" className="text-lg font-bold">{t('admin.items.title')}</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('admin.items.sub')}</p>

        {dishes.length === 0 ? (
          <p className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
            {t('admin.items.empty')}
          </p>
        ) : (
          <ol className="mt-4 space-y-3.5">
            {dishes.map((d, i) => (
              <li key={d.id} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="text-xs font-semibold tabular-nums text-slate-400">{i + 1}</span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold">{itemName(d)}</span>
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{t('admin.items.orders', { n: d.orders })}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" aria-hidden>
                    <div className="h-full rounded-full bg-brass" style={{ width: `${Math.max(6, (d.qty / topQty) * 100)}%` }} />
                  </div>
                </div>
                <span className="min-w-[3rem] text-right text-base font-bold tabular-nums">×{d.qty}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="recent-title" className="card p-5">
        <h2 id="recent-title" className="text-lg font-bold">{t('admin.recent')}</h2>
        <ul className="mt-3 divide-y divide-slate-200 dark:divide-white/10">
          {recent.map((o) => {
            const desk = o.delivery?.type === 'desk' ? DESKS_BY_ID[o.delivery.id] : null;
            return (
              <li key={o.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">
                    #{o.id} · {desk ? loc(desk.name) : t('header.room', { room: o.delivery?.id ?? o.room })}
                    {o.guestName && <span className="font-normal text-slate-500 dark:text-slate-400"> · {o.guestName}</span>}
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    {o.type === 'food'
                      ? (o.items ?? []).map((l) => `${l.qty}× ${itemName(l)}`).join(', ')
                      : t('staff.service')}
                  </p>
                </div>
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold dark:bg-white/10">
                    {t(`status.${o.status}`)}
                  </span>
                  <span className="min-w-[5rem] text-right font-bold tabular-nums">
                    {o.type === 'food' ? money(o.total, 'ETB') : '–'}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
