import { memo } from 'react';
import {
  AlarmClock, BedDouble, Bath, BellRing, CheckCheck, ChefHat, Clock, CreditCard, HandHelping, Receipt,
  UtensilsCrossed, Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MENU_BY_ID, SERVICES_BY_KEY } from '../../data/mock';
import { DESKS_BY_ID } from '../../data/accounts';
import DietBadge from '../DietBadge';

const SERVICE_ICONS = { Bath, BedDouble, Wrench, AlarmClock, BellRing, Receipt, UtensilsCrossed, HandHelping };

const STATUS_STYLE = {
  new: { bar: 'bg-indigo-500', pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' },
  preparing: { bar: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  ready: { bar: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  completed: { bar: 'bg-slate-300 dark:bg-slate-600', pill: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' },
};

const ACTIONS = {
  new: { key: 'action.preparing', Icon: ChefHat, cls: 'btn-gold' },
  preparing: { key: 'action.ready', Icon: BellRing, cls: 'btn bg-emerald-600 text-white hover:bg-emerald-700' },
  ready: { key: 'action.complete', Icon: CheckCheck, cls: 'btn bg-navy-900 text-white hover:bg-navy-800 dark:bg-white/10 dark:hover:bg-white/20' },
};

function elapsedTone(min) {
  if (min >= 25) return 'text-red-600 dark:text-red-400';
  if (min >= 12) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function OrderCard({ order, now, onAdvance }) {
  const { t, loc, money, menuItems } = useApp();
  const done = order.status === 'completed';
  const minutes = Math.max(0, Math.floor(((order.completedAt ?? now) - order.createdAt) / 60000));
  const style = STATUS_STYLE[order.status];
  const action = ACTIONS[order.status];
  const desk = order.delivery?.type === 'desk' ? DESKS_BY_ID[order.delivery.id] : null;
  const service = order.type === 'service' ? SERVICES_BY_KEY[order.serviceKey] : null;
  const ServiceIcon = service ? SERVICE_ICONS[service.icon] : null;

  return (
    <article
      className={`card relative flex flex-col gap-3 overflow-hidden p-4 pl-5 transition ${done ? 'opacity-70' : 'hover:shadow-lift'}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${style.bar}`} aria-hidden />

      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold leading-none tracking-tight">
            {desk ? loc(desk.name) : t('header.room', { room: order.room })}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            #{order.id}
            {order.guestName ? ` · ${order.guestName}` : ''}
          </p>
          {desk && order.type === 'food' && order.room && (
            <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {t('staff.chargedTo', { room: order.room })}
            </p>
          )}
          {order.serviceMode && (
            <p className="mt-1.5 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              {t(order.serviceMode === 'takeaway' ? 'mode.takeaway' : 'mode.dineIn')}
            </p>
          )}
          {order.guestType === 'visitor' && (
            <p className="mt-1 text-xs font-semibold text-sky-700 dark:text-sky-300">{t('staff.visitor')}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pill}`}>
            {t(`status.${order.status}`)}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${done ? 'text-slate-500' : elapsedTone(minutes)}`}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {done ? t('staff.doneIn', { min: minutes }) : t('staff.elapsed', { min: minutes })}
          </span>
        </div>
      </header>

      {service ? (
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-amber-400 dark:bg-white/10">
            <ServiceIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{loc(service.name)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {order.extra ? t('staff.wakeAt', { time: order.extra }) : t('staff.service')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul className="space-y-1.5 text-sm">
            {order.items.map((line) => {
              const item = MENU_BY_ID[line.id] ?? menuItems.find((m) => m.id === line.id) ?? { name: line.name };
              if (!item.name) return null;
              return (
                <li key={line.id}>
                  <div className="flex gap-2">
                    <span className="min-w-[2rem] font-bold tabular-nums text-gold">{line.qty}×</span>
                    <span className="font-medium">{loc(item.name)}</span>
                  </div>
                  {line.note && (
                    <p className="ml-8 text-xs italic text-slate-500 dark:text-slate-400">“{line.note}”</p>
                  )}
                </li>
              );
            })}
          </ul>

          {(order.dietary?.length > 0 || order.note) && (
            <div className="space-y-1.5 rounded-xl bg-amber-50 p-2.5 dark:bg-amber-500/10">
              {order.dietary?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {order.dietary.map((d) =>
                    d === 'nut' ? (
                      <span key={d} className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                        {t('diet.nut')}
                      </span>
                    ) : (
                      <DietBadge key={d} tag={d} />
                    ),
                  )}
                </div>
              )}
              {order.note && (
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  <strong>{t('staff.note')}:</strong> {order.note}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-white/10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                order.payment === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
              }`}
            >
              {order.payment === 'paid' ? <CreditCard className="h-3.5 w-3.5" aria-hidden /> : <Receipt className="h-3.5 w-3.5" aria-hidden />}
              {order.payment === 'paid' ? t('pay.paid') : t('pay.folio')}
            </span>
            <span className="font-bold tabular-nums">{money(order.total, 'ETB')}</span>
          </div>
        </>
      )}

      {action && (
        <button type="button" className={`${action.cls} w-full`} onClick={() => onAdvance(order.id)}>
          <action.Icon className="h-4 w-4" aria-hidden />
          {t(action.key)}
          <span className="sr-only"> — {desk ? loc(desk.name) : t('header.room', { room: order.room })}, #{order.id}</span>
        </button>
      )}
    </article>
  );
}

export default memo(OrderCard);
