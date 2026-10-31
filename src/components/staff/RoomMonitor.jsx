import { useMemo } from 'react';
import { BedDouble } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STATUS_CLASS = {
  occupied: 'border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-200',
  available: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200',
  cleaning: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200',
};
const DOT = { occupied: 'bg-indigo-500', available: 'bg-emerald-500', cleaning: 'bg-amber-500' };
const STATUSES = ['occupied', 'available', 'cleaning'];

export default function RoomMonitor() {
  const { t, rooms, cycleRoom, orders } = useApp();

  const floors = useMemo(() => {
    const byFloor = {};
    Object.keys(rooms)
      .sort()
      .forEach((num) => {
        const f = num.charAt(0);
        (byFloor[f] ||= []).push(num);
      });
    return Object.entries(byFloor);
  }, [rooms]);

  const roomsWithOrders = useMemo(
    () => new Set(orders.filter((o) => o.status !== 'completed').map((o) => o.room).filter(Boolean)),
    [orders],
  );

  const counts = useMemo(
    () => STATUSES.reduce((acc, s) => ({ ...acc, [s]: Object.values(rooms).filter((v) => v === s).length }), {}),
    [rooms],
  );

  return (
    <section aria-labelledby="rooms-title" className="card p-5">
      <div className="flex items-center gap-2">
        <BedDouble className="h-5 w-5 text-gold" aria-hidden />
        <h2 id="rooms-title" className="text-lg font-bold">{t('staff.rooms')}</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('staff.roomsHint')}</p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
        {STATUSES.map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT[s]}`} aria-hidden />
            {t(`room.${s}`)} <span className="tabular-nums text-slate-500">({counts[s]})</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-4">
        {floors.map(([floor, nums]) => (
          <div key={floor}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('staff.floor', { n: floor })}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {nums.map((num) => {
                const status = rooms[num];
                const busy = roomsWithOrders.has(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => cycleRoom(num)}
                    aria-label={`${t('room.changeStatus', { room: num, status: t(`room.${status}`) })}${busy ? ` ${t('staff.openOrders')}.` : ''}`}
                    className={`relative min-h-[48px] rounded-xl border text-sm font-bold tabular-nums transition active:scale-95 ${STATUS_CLASS[status]}`}
                  >
                    {num}
                    {busy && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-gold-light" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
