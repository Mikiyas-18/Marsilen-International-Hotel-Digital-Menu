import { useEffect, useRef, useState } from 'react';
import {
  AlarmClock, BedDouble, Bath, BellRing, Check, HandHelping, Receipt, UtensilsCrossed, Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useDesk } from '../hooks/useDesk';
import { SERVICES } from '../data/mock';

const ICONS = { Bath, BedDouble, Wrench, AlarmClock, BellRing, Receipt, UtensilsCrossed, HandHelping };

/**
 * At a desk / table QR the guest gets desk requests (call a waiter, bill, ...), which go to staff
 * with that desk as the location. Otherwise a hotel guest gets room services (towels, ...).
 */
export default function ServiceRequests() {
  const { t, loc, requestService, notify } = useApp();
  const { guest, visitor } = useAuth();
  const desk = useDesk();
  const customer = guest ?? visitor;
  const scope = desk ? 'desk' : 'room';
  const list = SERVICES.filter((s) => (s.scope ?? 'room') === scope);

  const [sent, setSent] = useState({});
  const [wakeTime, setWakeTime] = useState('06:30');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (list.length === 0) return null;

  const send = (key) => {
    if (!customer) {
      notify(t('cart.scanToOrder'));
      return;
    }
    requestService(
      key,
      key === 'wakeup' ? wakeTime : '',
      customer,
      desk ? { type: 'desk', id: desk.id } : { type: 'room', id: customer.room },
    );
    setSent((s) => ({ ...s, [key]: true }));
    timers.current.push(setTimeout(() => setSent((s) => ({ ...s, [key]: false })), 2500));
  };

  return (
    <section aria-labelledby="svc-title" className="mt-10">
      <h2 id="svc-title" className="text-xl font-bold tracking-tight">
        {desk ? t('svc.deskTitle', { place: loc(desk.name) }) : t('svc.title')}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {desk ? t('svc.deskSubtitle') : t('svc.subtitle')}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => {
          const Icon = ICONS[s.icon];
          const done = sent[s.key];
          return (
            <li key={s.key} className="card flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-amber-400 dark:bg-white/10">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug">{loc(s.name)}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{loc(s.desc)}</p>
                </div>
              </div>

              {s.key === 'wakeup' && (
                <label className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{t('svc.wakeupTime')}</span>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-navy-900"
                  />
                </label>
              )}

              <button
                type="button"
                disabled={done}
                onClick={() => send(s.key)}
                aria-label={customer ? (done ? t('svc.sent') : t('svc.request')) : t('svc.scanToRequest')}
                className={`mt-auto min-h-[44px] ${done ? 'btn bg-emerald-600 text-white' : 'btn-ghost'}`}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : null}
                {done ? t('svc.sent') : customer ? t('svc.request') : t('svc.scanToRequest')}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
