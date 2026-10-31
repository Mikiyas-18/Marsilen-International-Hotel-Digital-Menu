import { useMemo, useState } from 'react';
import { ClipboardList, Receipt, RotateCcw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNow } from '../hooks/useNow';
import Header from '../components/Header';
import OrderCard from '../components/staff/OrderCard';
import RoomMonitor from '../components/staff/RoomMonitor';

const FILTERS = ['active', 'new', 'preparing', 'ready', 'completed'];

/**
 * Operations screen for staff. What you see depends on the role:
 *  - kitchen:   food orders only (no room board, no folio totals)
 *  - frontdesk: food orders + service requests + room board
 *  - admin:     everything, plus demo controls
 */
export default function StaffDashboard() {
  const { t, lang, orders: allOrders, advanceOrder, simulateOrder, resetDemo, money } = useApp();
  const { staff, stays } = useAuth();
  const now = useNow(15000);
  const [filter, setFilter] = useState('active');

  const isKitchen = staff.role === 'kitchen';
  const isAdmin = staff.role === 'admin';

  const orders = useMemo(
    () => (isKitchen ? allOrders.filter((o) => o.type === 'food') : allOrders),
    [allOrders, isKitchen],
  );

  const counts = useMemo(() => {
    const c = { new: 0, preparing: 0, ready: 0, completed: 0 };
    orders.forEach((o) => {
      c[o.status] += 1;
    });
    c.active = c.new + c.preparing + c.ready;
    return c;
  }, [orders]);

  const folioTotal = useMemo(
    () => orders.filter((o) => o.type === 'food' && o.payment === 'folio').reduce((s, o) => s + o.total, 0),
    [orders],
  );

  const visible = useMemo(() => {
    const list = orders.filter((o) => (filter === 'active' ? o.status !== 'completed' : o.status === filter));
    // Oldest open orders first; most recently created completed first.
    return [...list].sort((a, b) => (filter === 'completed' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [orders, filter]);

  const clock = new Intl.DateTimeFormat(lang === 'am' ? 'am-ET' : 'en-GB', {
    hour: '2-digit', minute: '2-digit',
  }).format(now);

  const stats = [
    { key: 'new', label: t('status.new'), value: counts.new, tone: 'text-indigo-600 dark:text-indigo-300' },
    { key: 'preparing', label: t('status.preparing'), value: counts.preparing, tone: 'text-amber-600 dark:text-amber-300' },
    { key: 'ready', label: t('status.ready'), value: counts.ready, tone: 'text-emerald-600 dark:text-emerald-300' },
    ...(isKitchen
      ? []
      : [{ key: 'folio', label: t('staff.statFolio'), value: money(folioTotal, 'ETB'), tone: 'text-gold' }]),
  ];

  return (
    <div className="min-h-screen">
      <Header mode="staff" />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {isKitchen ? t('role.kitchen') : t('staff.title')}
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('staff.live')} · <span className="tabular-nums">{clock}</span>
              </span>
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{t('staff.subtitle')}</p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-gold"
                onClick={() => simulateOrder(stays.filter((s) => s.status === 'in-house'))}
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {t('staff.simulate')}
              </button>
              <button type="button" className="btn-ghost" onClick={resetDemo}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                {t('staff.reset')}
              </button>
            </div>
          )}
        </div>

        <dl className={`mt-6 grid grid-cols-2 gap-3 ${isKitchen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {stats.map((s) => (
            <div key={s.key} className="card p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {s.key === 'folio' && <Receipt className="h-3.5 w-3.5" aria-hidden />}
                {s.label}
              </dt>
              <dd className={`mt-1 text-2xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className={`mt-6 grid gap-6 ${isKitchen ? '' : 'lg:grid-cols-[minmax(0,1fr)_340px]'}`}>
          <section aria-labelledby="queue-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="queue-title" className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList className="h-5 w-5 text-gold" aria-hidden />
                {t('staff.queue')}
              </h2>
              <div role="tablist" aria-label={t('staff.queue')} className="scrollbar-none flex gap-1.5 overflow-x-auto">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    type="button"
                    aria-selected={filter === f}
                    onClick={() => setFilter(f)}
                    className={`chip min-h-[34px] px-3 text-xs ${filter === f ? 'chip-on' : 'chip-off'}`}
                  >
                    {f === 'active' ? t('staff.filterActive') : t(`status.${f}`)}
                    <span className="tabular-nums opacity-70">{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>

            {visible.length ? (
              <div className={`grid gap-4 md:grid-cols-2 ${isKitchen ? 'xl:grid-cols-3' : '2xl:grid-cols-3'}`}>
                {visible.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} onAdvance={advanceOrder} />
                ))}
              </div>
            ) : (
              <p className="card p-10 text-center text-slate-500 dark:text-slate-400">{t('staff.noOrders')}</p>
            )}
          </section>

          {!isKitchen && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <RoomMonitor />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
