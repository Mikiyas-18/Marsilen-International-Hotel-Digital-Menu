import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { translate } from '../i18n/dictionary';
import { usePersistentState } from '../hooks/usePersistentState';
import { MENU_ITEMS } from '../data/mock';
import { DESKS_BY_ID, isTable, ROOM_NUMBERS } from '../data/accounts';
import { calcTotals, convert, formatAmount } from '../data/pricing';
import { seedOrders, seedRooms } from '../data/seed';

// NOTE: AppProvider wraps AuthProvider (see App.jsx), so this file must not import AuthContext.

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

const ROOM_RE = /^[0-9]{1,4}[A-Za-z]?$/;
const NEXT_STATUS = { new: 'preparing', preparing: 'ready', ready: 'completed' };
const ROOM_CYCLE = { occupied: 'cleaning', cleaning: 'available', available: 'occupied' };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const initialMenu = () => MENU_ITEMS.map((i) => ({ ...i, available: true }));

// Who an order belongs to. A hotel guest is billed via their stay. A visitor
// (walk-in at a desk QR) has no room or folio, so room and stayId are null.
function whoIs(c) {
  // Room QR scan: the room itself is the customer (no sign-in), so there is no guest name.
  if (c.room && !c.firstName) return { room: c.room, stayId: null, guestName: null, guestType: 'room' };
  return c.room
    ? { room: c.room, stayId: c.id, guestName: `${c.firstName} ${c.lastName}`, guestType: 'guest' }
    : { room: null, stayId: null, guestName: c.name, guestType: 'visitor' };
}

function buildFoodOrder({ no, guest, delivery, items, subtotalEtb, payment, method, tipPct, dietary, note, serviceMode }) {
  return {
    id: String(no), no, type: 'food',
    ...whoIs(guest),
    delivery, items, status: 'new', payment, method, tipPct, dietary, note, serviceMode,
    ...calcTotals(subtotalEtb, tipPct, 'ETB'),
    createdAt: Date.now(),
  };
}

export function AppProvider({ children }) {
  const [searchParams] = useSearchParams();

  /* ---------- i18n + theme ---------- */
  const [lang, setLang] = usePersistentState('hms.lang', 'en');
  const [theme, setTheme] = usePersistentState('hms.theme', () =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const [currency, setCurrency] = usePersistentState('hms.currency', 'ETB');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const loc = useCallback((obj) => obj?.[lang] ?? obj?.en ?? '', [lang]);

  /* ---------- which QR code was scanned: ?room=304 or ?desk=pool ---------- */
  const roomParam = searchParams.get('room');
  const deskParam = searchParams.get('desk');
  const qr = useMemo(() => {
    const d = deskParam?.trim().toLowerCase();
    if (d && DESKS_BY_ID[d]) return { type: 'desk', id: d };
    const r = roomParam?.trim().toUpperCase();
    if (r && ROOM_RE.test(r) && ROOM_NUMBERS.includes(r)) return { type: 'room', id: r };
    return null;
  }, [roomParam, deskParam]);

  /* ---------- money ---------- */
  const fmt = useCallback((amount, cur = currency) => formatAmount(amount, cur, lang), [currency, lang]);
  const money = useCallback(
    (etb, cur = currency) => formatAmount(convert(etb, cur), cur, lang),
    [currency, lang],
  );

  /* ---------- toast ---------- */
  const [toast, setToast] = useState(null);
  const notify = useCallback((message) => setToast({ id: Date.now(), message }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  /* ---------- menu (admin can change price / availability) ---------- */
  const [menuItems, setMenuItems] = usePersistentState('hms.menu.v3', initialMenu);
  const updateMenuItem = useCallback(
    (id, patch) => setMenuItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [setMenuItems],
  );

  const addMenuItem = useCallback(
    (item) => setMenuItems((cur) => [...cur, { available: true, tags: [], prep: 15, emoji: '🍽️', ...item }]),
    [setMenuItems],
  );
  const removeMenuItem = useCallback(
    (id) => setMenuItems((cur) => cur.filter((i) => i.id !== id)),
    [setMenuItems],
  );

  /* ---------- cart (persistent; AuthProvider clears it when the guest changes) ---------- */
  const [cart, setCart] = usePersistentState('hms.cart', {});

  // Table QR only: 'dine-in' | 'takeaway'. Stored on the order so the kitchen knows how to serve it.
  const [serviceMode, setServiceMode] = usePersistentState('hms.serviceMode', 'dine-in');

  const addItem = useCallback(
    (id) =>
      setCart((c) => ({ ...c, [id]: { qty: (c[id]?.qty || 0) + 1, note: c[id]?.note || '' } })),
    [setCart],
  );
  const setQty = useCallback(
    (id, qty) =>
      setCart((c) => {
        if (qty <= 0) {
          const { [id]: _removed, ...rest } = c;
          return rest;
        }
        return { ...c, [id]: { qty: Math.min(qty, 20), note: c[id]?.note || '' } };
      }),
    [setCart],
  );
  const setNote = useCallback(
    (id, note) => setCart((c) => (c[id] ? { ...c, [id]: { ...c[id], note } } : c)),
    [setCart],
  );
  const clearCart = useCallback(() => setCart({}), [setCart]);

  // Items an admin marked sold out drop out of the cart so totals stay correct.
  const cartLines = useMemo(() => {
    const byId = Object.fromEntries(menuItems.map((i) => [i.id, i]));
    return Object.entries(cart)
      .map(([id, v]) => ({ item: byId[id], qty: v.qty, note: v.note }))
      .filter((l) => l.item && l.item.available !== false);
  }, [cart, menuItems]);
  const cartCount = useMemo(() => cartLines.reduce((s, l) => s + l.qty, 0), [cartLines]);
  const subtotalEtb = useMemo(
    () => cartLines.reduce((s, l) => s + l.item.price * l.qty, 0),
    [cartLines],
  );

  /* ---------- orders + rooms (shared by guest, staff and admin screens) ---------- */
  const [orders, setOrders] = usePersistentState('hms.orders.v4', seedOrders);
  const [rooms, setRooms] = usePersistentState('hms.rooms.v4', seedRooms);

  const nextNo = useMemo(() => Math.max(1000, ...orders.map((o) => o.no)) + 1, [orders]);

  /**
   * guest    = the signed-in stay (who is billed)
   * delivery = { type: 'room' | 'desk', id } (where it is brought)
   */
  const placeOrder = useCallback(
    ({ payment, method, tipPct, dietary, note, guest, visitor, delivery }) => {
      const customer = guest ?? visitor;
      if (!customer) return null;
      const isVisitor = !guest;
      // Visitors have no room folio: always paid online and always served at their desk.
      const deskId =
        delivery?.type === 'desk' && DESKS_BY_ID[delivery.id] ? delivery.id : visitor?.deskId;
      const target =
        isVisitor && customer.room
          ? { type: 'room', id: customer.room } // room QR: served to that room, paid online
          : isVisitor || (delivery?.type === 'desk' && DESKS_BY_ID[delivery.id])
            ? { type: 'desk', id: deskId }
            : { type: 'room', id: customer.room };
      const order = buildFoodOrder({
        no: nextNo, guest: customer, delivery: target,
        items: cartLines.map((l) => ({ id: l.item.id, qty: l.qty, note: l.note, name: l.item.name })),
        subtotalEtb,
        payment: isVisitor ? 'paid' : payment,
        method: isVisitor && method === 'folio' ? 'card' : method,
        tipPct, dietary, note,
        serviceMode: target.type === 'desk' && isTable(target.id) ? serviceMode : null,
      });
      setOrders((prev) => [...prev, order]);
      setCart({});
      return order;
    },
    [nextNo, cartLines, subtotalEtb, serviceMode, setOrders, setCart],
  );

  const requestService = useCallback(
    // customer = a stay (hotel guest) or a visitor; delivery = the desk or room the request is for.
    (serviceKey, extra = '', customer, delivery) => {
      if (!customer) return;
      const desk = delivery?.type === 'desk' ? DESKS_BY_ID[delivery.id] : null;
      const target = desk
        ? { type: 'desk', id: desk.id }
        : customer.room
          ? { type: 'room', id: customer.room }
          : null;
      if (!target) return;
      setOrders((prev) => {
        const no = Math.max(1000, ...prev.map((o) => o.no)) + 1;
        return [
          ...prev,
          {
            id: String(no), no, type: 'service', serviceKey, extra,
            ...whoIs(customer),
            delivery: target,
            status: 'new', payment: null, total: 0, createdAt: Date.now(),
          },
        ];
      });
      notify(
        desk
          ? translate(lang, 'svc.toastDesk', { place: desk.name[lang] ?? desk.name.en })
          : translate(lang, 'svc.toast', { room: customer.room }),
      );
    },
    [lang, notify, setOrders],
  );

  const advanceOrder = useCallback(
    (id) =>
      setOrders((prev) =>
        prev.map((o) => {
          const next = NEXT_STATUS[o.status];
          if (o.id !== id || !next) return o;
          return { ...o, status: next, ...(next === 'completed' ? { completedAt: Date.now() } : {}) };
        }),
      ),
    [setOrders],
  );

  /** Demo helper: a random in-house guest places a random order. */
  const simulateOrder = useCallback(
    (inHouseStays) => {
      if (!Array.isArray(inHouseStays) || inHouseStays.length === 0) return;
      const guest = pick(inHouseStays);
      const merged = new Map();
      for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
        const it = pick(MENU_ITEMS);
        merged.set(it.id, (merged.get(it.id) || 0) + 1 + Math.floor(Math.random() * 2));
      }
      const items = [...merged].map(([id, qty]) => ({ id, qty, note: '' }));
      const subtotalEtb2 = items.reduce(
        (s, i) => s + (MENU_ITEMS.find((m) => m.id === i.id)?.price ?? 0) * i.qty,
        0,
      );
      const atDesk = Math.random() < 0.3;
      const delivery = atDesk
        ? { type: 'desk', id: pick(Object.keys(DESKS_BY_ID)) }
        : { type: 'room', id: guest.room };
      const payment = Math.random() > 0.5 ? 'paid' : 'folio';
      setOrders((prev) => {
        const no = Math.max(1000, ...prev.map((o) => o.no)) + 1;
        return [
          ...prev,
          buildFoodOrder({
            no, guest, delivery, items, subtotalEtb: subtotalEtb2, payment,
            method: payment === 'paid' ? 'card' : 'folio', tipPct: 0, dietary: [], note: '',
          }),
        ];
      });
    },
    [setOrders],
  );

  const cycleRoom = useCallback(
    (num) => setRooms((r) => ({ ...r, [num]: ROOM_CYCLE[r[num]] || 'available' })),
    [setRooms],
  );
  const setRoomStatus = useCallback(
    (num, status) => setRooms((r) => ({ ...r, [num]: status })),
    [setRooms],
  );

  /* ---------- guest feedback (admin reads it in the Feedback tab) ---------- */
  const [feedback, setFeedback] = usePersistentState('hms.feedback.v1', []);
  const addFeedback = useCallback(
    (entry) => setFeedback((cur) => [{ id: `fb-${Date.now()}`, createdAt: Date.now(), ...entry }, ...cur]),
    [setFeedback],
  );
  const removeFeedback = useCallback(
    (id) => setFeedback((cur) => cur.filter((f) => f.id !== id)),
    [setFeedback],
  );

  // Resets orders and menu only. Room status follows real check-ins, so it is left alone.
  const resetDemo = useCallback(() => {
    setOrders(seedOrders());
    setMenuItems(initialMenu());
  }, [setOrders, setMenuItems]);

  const value = {
    lang, setLang, t, loc,
    theme, setTheme,
    currency, setCurrency, fmt, money,
    qr,
    menuItems, updateMenuItem, addMenuItem, removeMenuItem,
    cart, cartLines, cartCount, subtotalEtb, addItem, setQty, setNote, clearCart,
    serviceMode, setServiceMode,
    orders, placeOrder, requestService, advanceOrder, simulateOrder, resetDemo,
    rooms, cycleRoom, setRoomStatus,
    feedback, addFeedback, removeFeedback,
    toast, notify,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
