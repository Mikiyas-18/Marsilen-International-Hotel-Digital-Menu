import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Lock, ShoppingBag, Trash2, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DESKS_BY_ID, isTable } from '../data/accounts';
import { useDesk } from '../hooks/useDesk';
import { CURRENCIES, DIETARY_REQUIREMENTS, TAX_RATE, TIP_OPTIONS } from '../data/mock';
import { calcTotals } from '../data/pricing';
import QuantityStepper from './QuantityStepper';
import ServiceModeToggle from './ServiceModeToggle';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function CartDrawer({ open, onClose }) {
  const {
    t, loc, cartLines, subtotalEtb, setQty, setNote, currency, setCurrency,
    money, fmt, placeOrder, serviceMode,
  } = useApp();

  const { guest, visitor } = useAuth();
  const { search } = useLocation();
  const navigate = useNavigate();

  const room = guest?.room;
  const desk = useDesk();
  const isVisitor = !guest && Boolean(visitor);
  const customer = guest || visitor;

  const [delivery, setDelivery] = useState('room');

  const deliveryTarget =
    isVisitor || (delivery === 'here' && desk)
      ? { type: 'desk', id: desk?.id }
      : { type: 'room', id: room };

  const [customerName, setCustomerName] = useState('');
  const [tip, setTip] = useState(10);
  const [dietary, setDietary] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [phase, setPhase] = useState('cart');
  const [placed, setPlaced] = useState(null);

  const panelRef = useRef(null);

  const totals = calcTotals(subtotalEtb, tip, currency);
  const empty = cartLines.length === 0;

  const canSubmit =
    Boolean(customerName.trim()) &&
    Boolean(isVisitor ? desk?.id : room) &&
    !empty &&
    phase === 'cart';

  const close = useCallback(() => {
    if (phase === 'sending') return;

    onClose();

    if (phase === 'done') {
      setTimeout(() => {
        setPhase('cart');
        setPlaced(null);
        setCustomerName('');
      }, 350);
    }
  }, [onClose, phase]);

  // Scroll lock, Escape to close, focus trap, and restore focus.
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

      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)]
        .filter((n) => n.offsetParent !== null);

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

  const toggleDiet = (d) => {
    setDietary((cur) =>
      cur.includes(d)
        ? cur.filter((x) => x !== d)
        : [...cur, d]
    );
  };

  const submit = () => {
    if (!canSubmit) return;

    const fullName = customerName.trim();

    const locationName =
      deliveryTarget.type === 'desk'
        ? loc(DESKS_BY_ID[deliveryTarget.id]?.name) || deliveryTarget.id
        : `Room ${room}`;

    const service =
      deliveryTarget.type === 'desk' && isTable(deliveryTarget.id)
        ? serviceMode
        : deliveryTarget.type;

    // Prepare the complete order message.
    const itemsText = cartLines
      .map(({ item, qty, note }) => {
        const itemName = loc(item.name);
        const itemTotal = money(item.price * qty, currency);

        return [
          `${qty} x ${itemName}`,
          `Price: ${itemTotal}`,
          note?.trim() ? `Item note: ${note.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');

    const message = [
      'NEW FOOD ORDER',
      'Marsilen International Hotel',
      '',
      `Customer: ${fullName}`,
      `Order location: ${locationName}`,
      `Service: ${service}`,
      '',
      'ORDER ITEMS',
      itemsText,
      '',
      dietary.length
        ? `Dietary requirements: ${dietary.map((d) => t(`diet.${d}`)).join(', ')}`
        : '',
      orderNote.trim()
        ? `Order note: ${orderNote.trim()}`
        : '',
      '',
      'ORDER SUMMARY',
      `Subtotal: ${fmt(totals.subtotal)}`,
      `Tax (${TAX_RATE * 100}%): ${fmt(totals.tax)}`,
      `Tip for the Team (${tip}%): ${fmt(totals.tip)}`,
      `TOTAL: ${fmt(totals.total)}`,
      '',
      `Currency: ${currency}`,
    ]
      .filter(Boolean)
      .join('\n');

    const telegramUrl =
      `https://t.me/Marsilen_hotel?text=${encodeURIComponent(message)}`;

    // Open Telegram directly from the button click.
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');

    setPhase('sending');

    const order = placeOrder({
      payment: 'pending',
      method: 'telegram',
      tipPct: tip,
      dietary,
      note: orderNote.trim(),
      guest,
      visitor,
      delivery: deliveryTarget,
      customerName: fullName,
    });

    if (!order) {
      setPhase('cart');
      return;
    }

    setPlaced(order);
    setPhase('done');
    setDietary([]);
    setOrderNote('');
  };

  const submitLabel =
    phase === 'sending'
      ? 'Preparing order...'
      : 'Order via Telegram';

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        onClick={close}
        aria-hidden
        className={`absolute inset-0 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
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
        {/* Header */}
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

        {/* Success screen */}
        {phase === 'done' && placed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid h-20 w-20 animate-pop place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-11 w-11" aria-hidden />
            </span>

            <h3 className="text-2xl font-bold">
              Order prepared!
            </h3>

            <p className="text-slate-600 dark:text-slate-300">
              Your order details are ready in Telegram. Please press Send in
              Telegram to submit your order to the hotel.
            </p>

            <p className="text-sm font-semibold">
              Order #{placed.id}
            </p>

            <p className="text-sm font-bold text-gold">
              {money(placed.total, 'ETB')}
            </p>

            <button
              type="button"
              className="btn-gold mt-2 w-full"
              onClick={close}
            >
              {t('cart.backToMenu')}
            </button>
          </div>
        ) : empty ? (
          /* Empty cart */
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5">
              <ShoppingBag className="h-8 w-8" aria-hidden />
            </span>

            <p className="text-lg font-semibold">{t('cart.empty')}</p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('cart.emptyDesc')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

              {/* Delivery target and guest information */}
              {customer && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-navy-900 px-4 py-3 text-white dark:bg-white/10">
                    <Lock className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />

                    <div>
                      <p className="font-semibold">
                        {deliveryTarget.type === 'desk'
                          ? t(
                              serviceMode === 'takeaway' && isTable(desk?.id)
                                ? 'cart.takeawayAt'
                                : 'cart.serveAt',
                              { place: loc(desk?.name) }
                            )
                          : t('cart.deliveringTo', { room })}
                      </p>

                      <p className="text-xs text-slate-300">
                        {isVisitor
                          ? t('cart.visitorBilling', {
                              name: visitor.auto
                                ? loc(desk?.name)
                                : visitor.name,
                            })
                          : t('cart.chargedTo', {
                              room,
                              name: `${guest.firstName} ${guest.lastName}`,
                            })}
                      </p>
                    </div>
                  </div>

                  {deliveryTarget.type === 'desk' && isTable(desk?.id) && (
                    <ServiceModeToggle />
                  )}

                  {desk && !isVisitor && (
                    <div
                      role="radiogroup"
                      aria-label={t('cart.deliverTo')}
                      className="grid grid-cols-2 gap-2"
                    >
                      {[
                        {
                          id: 'room',
                          label: t('cart.deliverRoom', { room }),
                        },
                        {
                          id: 'here',
                          label: t('cart.deliverHere', {
                            place: loc(desk.name),
                          }),
                        },
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
                </div>
              )}

              {/* Full Name */}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Full Name
                </span>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={100}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm placeholder:text-slate-400 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              {/* Cart items */}
              <ul className="space-y-3">
                {cartLines.map(({ item, qty, note }) => {
                  const name = loc(item.name);

                  return (
                    <li key={item.id} className="card space-y-3 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {money(item.price)}
                          </p>
                        </div>

                        <p className="font-bold">
                          {money(item.price * qty)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <QuantityStepper
                          compact
                          qty={qty}
                          name={name}
                          onChange={(n) => setQty(item.id, n)}
                        />

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
                <legend className="mb-2 text-sm font-semibold">
                  {t('cart.dietary')}
                </legend>

                <div className="flex flex-wrap gap-2">
                  {DIETARY_REQUIREMENTS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dietary.includes(d)}
                      onClick={() => toggleDiet(d)}
                      className={`chip ${
                        dietary.includes(d) ? 'chip-on' : 'chip-off'
                      }`}
                    >
                      {t(`diet.${d}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Order note */}
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  {t('cart.orderNote')}
                </span>

                <textarea
                  rows={2}
                  maxLength={240}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={t('cart.orderNotePlaceholder')}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-white/10 dark:bg-navy-900"
                />
              </label>

              {/* Currency and Tip */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p id="cur-label" className="mb-2 text-sm font-semibold">
                    {t('cart.currency')}
                  </p>

                  <div
                    role="group"
                    aria-labelledby="cur-label"
                    className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-white/10 dark:bg-white/5"
                  >
                    {['ETB', 'USD'].map((code) => {
                      const c = CURRENCIES[code];

                      if (!c) return null;

                      return (
                        <button
                          key={c.code}
                          type="button"
                          aria-pressed={currency === c.code}
                          onClick={() => setCurrency(c.code)}
                          className={`min-h-[36px] rounded-[10px] px-3 text-sm font-semibold transition ${
                            currency === c.code
                              ? 'bg-navy-900 text-white shadow dark:bg-gold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p id="tip-label" className="mb-2 text-sm font-semibold">
                    Tip for the Team
                  </p>

                  <div
                    role="group"
                    aria-labelledby="tip-label"
                    className="flex flex-wrap gap-1.5"
                  >
                    {TIP_OPTIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={tip === p}
                        onClick={() => setTip(p)}
                        className={`chip min-h-[36px] px-3 ${
                          tip === p ? 'chip-on' : 'chip-off'
                        }`}
                      >
                        {p === 0 ? '0%' : `${p}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order totals */}
              <dl className="card space-y-2 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('cart.subtotal')}
                  </dt>
                  <dd className="tabular-nums">
                    {fmt(totals.subtotal)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('cart.tax', { rate: TAX_RATE * 100 })}
                  </dt>
                  <dd className="tabular-nums">
                    {fmt(totals.tax)}
                  </dd>
                </div>

                {tip > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Tip for the Team ({tip}%)
                    </dt>
                    <dd className="tabular-nums">
                      {fmt(totals.tip)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-white/10">
                  <dt>{t('cart.total')}</dt>
                  <dd className="tabular-nums text-gold">
                    {fmt(totals.total)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Telegram order button */}
            <div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-navy-900/80">
              {customer ? (
                <button
                  type="button"
                  className="btn-gold w-full text-base"
                  disabled={!canSubmit}
                  onClick={submit}
                >
                  {submitLabel}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-gold min-h-[44px] w-full text-base"
                  aria-label={t('cart.signInToOrder')}
                  onClick={() =>
                    navigate(
                      { pathname: '/login', search },
                      { state: { openCart: true } }
                    )
                  }
                >
                  {t('cart.signInToOrder')}
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}