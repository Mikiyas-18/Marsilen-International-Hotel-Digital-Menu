import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, CreditCard, Lock, Receipt, ShoppingBag, Trash2, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DESKS_BY_ID, isTable } from '../data/accounts';
import { useDesk } from '../hooks/useDesk';
import { CURRENCIES, DIETARY_REQUIREMENTS, TAX_RATE, TIP_OPTIONS } from '../data/mock';
import { calcTotals } from '../data/pricing';
import QuantityStepper from './QuantityStepper';
import ServiceModeToggle from './ServiceModeToggle';

const METHODS = [
  { id: 'card', key: 'cart.methodCard' },
  { id: 'telebirr', key: 'cart.methodTelebirr' },
  { id: 'cbe', key: 'cart.methodCbe' },
];

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function CartDrawer({ open, onClose }) {
  const {
    t, loc, qr, cartLines, subtotalEtb, setQty, setNote, currency, setCurrency,
    money, fmt, placeOrder, serviceMode,
  } = useApp();
  const { guest, visitor } = useAuth();
  const room = guest?.room;
  const desk = useDesk();
  const isVisitor = !guest && Boolean(visitor);
  const customer = guest || visitor;
  // Hotel guest at a desk QR: picks desk or room. In-room QR (or none): always their room.
  // Visitor (walk-in): always served at their desk and pays online.
  const [delivery, setDelivery] = useState('room'); // 'room' | 'here'
  const deliveryTarget =
    isVisitor && visitor.room
      ? { type: 'room', id: visitor.room } // scanned a room QR
      : isVisitor || (delivery === 'here' && desk)
        ? { type: 'desk', id: desk?.id }
        : { type: 'room', id: room };

  const [tip, setTip] = useState(10);
  const [payment, setPayment] = useState('online'); // 'online' | 'folio'
  const [method, setMethod] = useState('card');
  const [dietary, setDietary] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [phase, setPhase] = useState('cart'); // 'cart' | 'sending' | 'done'
  const [placed, setPlaced] = useState(null);
  const panelRef = useRef(null);
  const sendTimer = useRef(null);

  const totals = calcTotals(subtotalEtb, tip, currency);
  const empty = cartLines.length === 0;
  const canSubmit = Boolean(isVisitor ? desk || visitor.room : room) && !empty && phase === 'cart';

  const close = useCallback(() => {
    if (phase === 'sending') return;
    onClose();
    if (phase === 'done') {
      // Reset for the next order once the closing animation has played.
      setTimeout(() => {
        setPhase('cart');
        setPlaced(null);
      }, 350);
    }
  }, [onClose, phase]);

  // Scroll lock, Escape to close, simple focus trap, restore focus on close.
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => panelRef.current?.focus());

    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  useEffect(() => () => clearTimeout(sendTimer.current), []);

  const toggleDiet = (d) =>
    setDietary((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const submit = () => {
    if (!canSubmit) return;
    setPhase('sending');
    // Simulated network / payment-gateway latency.
    sendTimer.current = setTimeout(() => {
      const order = placeOrder({
        payment: payment === 'online' ? 'paid' : 'folio',
        method: payment === 'online' ? method : 'folio',
        tipPct: tip,
        dietary,
        note: orderNote.trim(),
        guest,
        visitor,
        delivery: deliveryTarget,
      });
      if (!order) {
        setPhase('cart');
        return;
      }
      setPlaced(order);
      setPhase('done');
      setDietary([]);
      setOrderNote('');
    }, 900);
  };

  const submitLabel =
    phase === 'sending'
      ? t('cart.sending')
      : payment === 'online'
        ? t('cart.payAndOrder', { amount: fmt(totals.total) })
        : t('cart.placeFolio');

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        onClick={close}
        aria-hidden
        className={`absolute inset-0 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        {...(!open ? { inert: '' } : {})}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl outline-none transition-[transform,visibility] duration-300 ease-out dark:bg-ink ${
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 id="cart-title" className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-5 w-5 text-gold" aria-hidden />
            {t('cart.title')}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('common.close')}
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {phase === 'done' && placed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid h-20 w-20 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-11 w-11" aria-hidden />
            </span>
            <h3 className="text-2xl font-bold">{t('cart.successTitle')}</h3>
            <p className="text-slate-600 dark:text-slate-300">
              {!placed.room
                ? t('cart.successVisitor', {
                    id: placed.id,
                    place: loc(DESKS_BY_ID[placed.delivery?.id]?.name),
                  })
                : placed.delivery?.type === 'desk'
                ? t('cart.successDesk', {
                    id: placed.id,
                    place: loc(DESKS_BY_ID[placed.delivery.id]?.name),
                    room: placed.room,
                  })
                : t('cart.successDesc', { id: placed.id, room: placed.room })}
            </p>
            <p className="text-sm font-semibold">
              {placed.payment === 'paid' ? t('pay.paid') : t('pay.folio')} · {money(placed.total, 'ETB')}
            </p>
            <button type="button" className="btn-gold mt-2 w-full" onClick={close}>
              {t('cart.backToMenu')}
            </button>
          </div>
        ) : empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5">
              <ShoppingBag className="h-8 w-8" aria-hidden />
            </span>
            <p className="text-lg font-semibold">{t('cart.empty')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('cart.emptyDesc')}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {/* Delivery target + billing identity (both come from the signed-in guest) */}
              {customer && <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-navy-900 px-4 py-3 text-white dark:bg-white/10">
                  <Lock className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                  <div>
                    <p className="font-semibold">
                      {deliveryTarget.type === 'desk'
                        ? t(serviceMode === 'takeaway' && isTable(desk.id) ? 'cart.takeawayAt' : 'cart.serveAt', { place: loc(desk.name) })
                        : t('cart.deliveringTo', { room: deliveryTarget.id })}
                    </p>
                    <p className="text-xs text-slate-300">
                      {isVisitor
                        ? t('cart.visitorBilling', { name: visitor.room ? t('header.room', { room: visitor.room }) : visitor.auto ? loc(desk?.name) : visitor.name })
                        : t('cart.chargedTo', { room, name: `${guest.firstName} ${guest.lastName}` })}
                    </p>
                  </div>
                </div>

                {deliveryTarget.type === 'desk' && isTable(desk?.id) && <ServiceModeToggle />}

                {desk && !isVisitor && (
                  <div role="radiogroup" aria-label={t('cart.deliverTo')} className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'room', label: t('cart.deliverRoom', { room }) },
                      { id: 'here', label: t('cart.deliverHere', { place: loc(desk.name) }) },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={delivery === o.id}
                        onClick={() => setDelivery(o.id)}
                        className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                          delivery === o.id
                            ? 'border-gold bg-amber-50 dark:bg-amber-500/10'
                            : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-800'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>}

              {/* Items */}
              <ul className="space-y-3">
                {cartLines.map(({ item, qty, note }) => {
                  const name = loc(item.name);
                  return (
                    <li key={item.id} className="card space-y-3 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{money(item.price)}</p>
                        </div>
                        <p className="font-bold">{money(item.price * qty)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantityStepper compact qty={qty} name={name} onChange={(n) => setQty(item.id, n)} />
                        <button
                          type="button"
                          onClick={() => setQty(item.id, 0)}
                          aria-label={t('cart.remove', { name })}
                          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={note}
                        maxLength={120}
                        onChange={(e) => setNote(item.id, e.target.value)}
                        placeholder={t('cart.itemNote')}
                        aria-label={`${t('cart.itemNote')}: ${name}`}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-white/10 dark:bg-navy-900"
                      />
                    </li>
                  );
                })}
              </ul>

              {/* Dietary requirements */}
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">{t('cart.dietary')}</legend>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_REQUIREMENTS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dietary.includes(d)}
                      onClick={() => toggleDiet(d)}
                      className={`chip ${dietary.includes(d) ? 'chip-on' : 'chip-off'}`}
                    >
                      {t(`diet.${d}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">{t('cart.orderNote')}</span>
                <textarea
                  rows={2}
                  maxLength={240}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={t('cart.orderNotePlaceholder')}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              {/* Currency + tip */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p id="cur-label" className="mb-2 text-sm font-semibold">{t('cart.currency')}</p>
                  <div role="group" aria-labelledby="cur-label" className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-white/10 dark:bg-white/5">
                    {Object.values(CURRENCIES).map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        aria-pressed={currency === c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`min-h-[36px] rounded-[10px] px-3 text-sm font-semibold transition ${
                          currency === c.code ? 'bg-navy-900 text-white shadow dark:bg-gold' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p id="tip-label" className="mb-2 text-sm font-semibold">{t('cart.tip')}</p>
                  <div role="group" aria-labelledby="tip-label" className="flex flex-wrap gap-1.5">
                    {TIP_OPTIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={tip === p}
                        onClick={() => setTip(p)}
                        className={`chip min-h-[36px] px-3 ${tip === p ? 'chip-on' : 'chip-off'}`}
                      >
                        {p === 0 ? t('cart.tipNone') : `${p}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <p id="pay-label" className="mb-2 text-sm font-semibold">{t('cart.payment')}</p>
                <div role="radiogroup" aria-labelledby="pay-label" className="grid gap-2">
                  {[
                    { id: 'online', Icon: CreditCard, title: t('cart.payNow'), desc: t('cart.payNowDesc') },
                    { id: 'folio', Icon: Receipt, title: t('cart.folio'), desc: t('cart.folioDesc') },
                  ]
                    .filter((o) => !(isVisitor && o.id === 'folio')) // visitors have no room folio
                    .map(({ id, Icon, title, desc }) => {
                    const on = payment === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setPayment(id)}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${
                          on
                            ? 'border-gold bg-amber-50 shadow-glow dark:bg-amber-500/10'
                            : 'border-slate-200 bg-white hover:border-amber-300 dark:border-white/10 dark:bg-navy-800'
                        }`}
                      >
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-gold text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-semibold">{title}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {isVisitor && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('login.visitorNote')}</p>
                )}

                {payment === 'online' && (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-3.5 dark:border-white/15">
                    <div role="radiogroup" aria-label={t('cart.payNow')} className="flex flex-wrap gap-2">
                      {METHODS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={method === m.id}
                          onClick={() => setMethod(m.id)}
                          className={`chip ${method === m.id ? 'chip-on' : 'chip-off'}`}
                        >
                          {t(m.key)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('cart.mockNote')}</p>
                  </div>
                )}
              </div>

              {/* Totals */}
              <dl className="card space-y-2 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">{t('cart.subtotal')}</dt>
                  <dd className="tabular-nums">{fmt(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">{t('cart.tax', { rate: TAX_RATE * 100 })}</dt>
                  <dd className="tabular-nums">{fmt(totals.tax)}</dd>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">{t('cart.tipLine', { pct: tip })}</dt>
                    <dd className="tabular-nums">{fmt(totals.tip)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-white/10">
                  <dt>{t('cart.total')}</dt>
                  <dd className="tabular-nums text-gold">{fmt(totals.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-navy-900/80">
              {customer ? (
                <button type="button" className="btn-gold w-full text-base" disabled={!canSubmit} onClick={submit}>
                  {submitLabel}
                </button>
              ) : (
                <p role="note" className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                  {t('cart.scanToOrder')}
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
