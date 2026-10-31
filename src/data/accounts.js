// DEMO DATA. Accounts, PINs and passwords live in the browser (localStorage),
// so none of this is secure. In production, authenticate on a server
// (hashed credentials, server-side sessions, rate limiting) and read stays
// from your property-management system.

export const ROLES = ['kitchen', 'frontdesk', 'admin'];

// Service points other than guest rooms. Each has its own QR: /menu?desk=<id>
const TABLE_COUNT = 20;
const TABLES = Array.from({ length: TABLE_COUNT }, (_, k) => ({
  id: `table-${k + 1}`,
  name: { en: `Restaurant · Table ${k + 1}`, am: `ምግብ ቤት · ጠረጴዛ ${k + 1}` },
}));

export const DESKS = [
  { id: 'lobby', name: { en: 'Lobby Lounge', am: 'የሎቢ ላውንጅ' } },
  { id: 'pool', name: { en: 'Pool Bar', am: 'የመዋኛ ገንዳ ባር' } },
  // One QR per restaurant table so staff know exactly where to serve.
  ...TABLES,
  { id: 'spa', name: { en: 'Spa Reception', am: 'የስፓ መቀበያ' } },
  { id: 'terrace', name: { en: 'Terrace Café', am: 'የሰገነት ካፌ' } },
];

// The only rooms that have a QR code. Scanning one needs no sign-in: the room is the customer.
export const ROOM_NUMBERS = ['101', '102', '103', '104', '105'];

export const DESKS_BY_ID = Object.fromEntries(DESKS.map((d) => [d.id, d]));
// Restaurant tables get the Dine-in / Takeaway choice.
export const isTable = (id) => /^table-/.test(id ?? '');

export function seedStaff() {
  return [
    { id: 'staff-kitchen', name: 'Kitchen Team', username: 'kitchen', password: 'kitchen123', role: 'kitchen' },
    { id: 'staff-desk', name: 'Front Desk', username: 'frontdesk', password: 'frontdesk123', role: 'frontdesk' },
    { id: 'staff-admin', name: 'Hotel Admin', username: 'admin', password: 'admin123', role: 'admin' },
  ];
}

const DAY = 24 * 3600 * 1000;

// A "stay" is one guest's booking. The guest signs in with room + last name + PIN
// while status is 'in-house'; checking out disables sign-in immediately.
export function seedStays() {
  const stay = (room, firstName, lastName, pin, daysAgo, nights) => ({
    id: `stay-${room}`, room, firstName, lastName, pin,
    status: 'in-house', checkedInAt: Date.now() - daysAgo * DAY, nights,
  });
  return [
    stay('101', 'Abebe', 'Bekele', '4821', 1, 3),
    stay('102', 'Hana', 'Tesfaye', '5210', 2, 4),
    stay('103', 'Daniel', 'Mekonnen', '3384', 1, 2),
    stay('104', 'Yonas', 'Alemu', '2095', 0, 5),
  ];

}

/** Total of this stay's food orders charged to the room folio (ETB). */
export function folioBalance(orders, stay) {
  return orders
    .filter((o) => o.type === 'food' && o.payment === 'folio' && o.stayId === stay.id)
    .reduce((sum, o) => sum + o.total, 0);
}
