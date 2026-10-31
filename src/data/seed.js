import { MENU_BY_ID } from './mock';
import { calcTotals } from './pricing';
import { ROOM_NUMBERS, seedStays } from './accounts';

const MIN = 60 * 1000;
const STAYS = seedStays(); // ids are stable (stay-<room>), so orders link to the same stays

// Orders carry: room + stayId (who is billed), delivery (where it goes), guestName.
function base(no, room, minsAgo, extra) {
  const stay = STAYS.find((s) => s.room === room);
  return {
    id: String(no), no, room,
    stayId: stay.id,
    guestName: `${stay.firstName} ${stay.lastName}`,
    delivery: { type: 'room', id: room },
    createdAt: Date.now() - minsAgo * MIN,
    ...extra,
  };
}

function foodOrder(no, room, items, status, payment, minsAgo, extra = {}) {
  const subtotal = items.reduce((s, i) => s + MENU_BY_ID[i.id].price * i.qty, 0);
  const tipPct = extra.tipPct ?? 0;
  return base(no, room, minsAgo, {
    type: 'food',
    items: items.map((i) => ({ note: '', ...i })),
    status, payment, method: payment === 'paid' ? 'card' : 'folio',
    tipPct, dietary: [], note: '',
    ...calcTotals(subtotal, tipPct, 'ETB'),
    ...extra,
  });
}

function serviceOrder(no, room, serviceKey, minsAgo, extra = {}) {
  return base(no, room, minsAgo, {
    type: 'service', serviceKey, extra: '', status: 'new', payment: null, total: 0, ...extra,
  });
}

// Walk-in visitors have no room: they scanned a table / venue QR, paid online, and are served there.
function visitorBase(no, deskId, name, minsAgo, extra) {
  return {
    id: String(no), no, room: null, stayId: null,
    guestName: name, guestType: 'visitor',
    delivery: { type: 'desk', id: deskId },
    createdAt: Date.now() - minsAgo * MIN,
    ...extra,
  };
}

function visitorFood(no, deskId, name, items, status, minsAgo) {
  const subtotal = items.reduce((s, i) => s + MENU_BY_ID[i.id].price * i.qty, 0);
  return visitorBase(no, deskId, name, minsAgo, {
    type: 'food',
    items: items.map((i) => ({ note: '', ...i })),
    status, payment: 'paid', method: 'telebirr', tipPct: 0, dietary: [], note: '',
    ...calcTotals(subtotal, 0, 'ETB'),
  });
}

function visitorService(no, deskId, name, serviceKey, minsAgo) {
  return visitorBase(no, deskId, name, minsAgo, {
    type: 'service', serviceKey, extra: '', status: 'new', payment: null, total: 0,
  });
}

export function seedOrders() {
  return [
    foodOrder(1037, '102', [{ id: 'kitfo', qty: 1 }, { id: 'tibs', qty: 1 }], 'completed', 'paid', 55, {
      completedAt: Date.now() - 38 * MIN,
    }),
    foodOrder(1039, '104', [{ id: 'doro-wat', qty: 1 }, { id: 'buna', qty: 2 }], 'preparing', 'folio', 22),
    foodOrder(1040, '103', [{ id: 'firfir', qty: 2 }, { id: 'avocado', qty: 1 }], 'ready', 'paid', 14, { tipPct: 10 }),
    foodOrder(1041, '101', [{ id: 'club', qty: 1 }, { id: 'water', qty: 2 }], 'new', 'paid', 4),
    foodOrder(1042, '102', [{ id: 'beyaynetu', qty: 2 }, { id: 'shai', qty: 2 }], 'new', 'folio', 2, {
      dietary: ['vegan'],
      note: 'No onions please.',
    }),
    // Scanned the pool-bar QR: delivered to the pool, billed to Room 101.
    foodOrder(1045, '101', [{ id: 'avocado', qty: 2 }, { id: 'fruit', qty: 1 }], 'new', 'folio', 3, {
      delivery: { type: 'desk', id: 'pool' },
    }),
    serviceOrder(1043, '104', 'housekeeping', 6),
    serviceOrder(1044, '102', 'wakeup', 1, { extra: '05:30' }),
    visitorFood(1046, 'table-4', 'Mulu Alemayehu', [{ id: 'firfir', qty: 1 }, { id: 'buna', qty: 2 }], 'preparing', 9),
    visitorFood(1048, 'table-1', 'Dawit Kassa', [{ id: 'tibs', qty: 2 }, { id: 'avocado', qty: 2 }], 'new', 1),
    visitorService(1047, 'table-2', 'Sara Tekle', 'waiter', 2),
  ].sort((a, b) => a.no - b.no);
}

const OCCUPIED = STAYS.map((s) => s.room);
export function seedRooms() {
  return Object.fromEntries(ROOM_NUMBERS.map((num) => [num, OCCUPIED.includes(num) ? 'occupied' : 'available']));
}
