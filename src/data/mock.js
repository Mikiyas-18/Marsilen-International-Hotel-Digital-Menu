// Bilingual mock data. Every user-facing string is { en, am }.
// Prices are stored in ETB (hotel base currency) and converted at display time.

export const HOTEL = {
  name: { en: 'Marsilen International Hotel', am: 'ማርሲለን ሆቴል' },
};

export const TAX_RATE = 0.15; // Ethiopian VAT (demo)

// Demo exchange rate — wire to a real FX source in production.
export const CURRENCIES = {
  ETB: { code: 'ETB', rate: 1, label: 'ETB' },
  USD: { code: 'USD', rate: 1 / 150, label: 'USD' },
};

export const TIP_OPTIONS = [0, 5, 10, 15];

export const CATEGORIES = [
  { id: 'all', key: 'cat.all' },
  { id: 'breakfast', key: 'cat.breakfast' },
  { id: 'main', key: 'cat.main' },
  { id: 'drinks', key: 'cat.drinks' },
  { id: 'desserts', key: 'cat.desserts' },
  { id: 'amenities', key: 'cat.amenities' },
];

export const DIETARY_TAGS = ['halal', 'vegan', 'gf'];
export const DIETARY_REQUIREMENTS = ['halal', 'vegan', 'gf', 'nut'];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`;

export const MENU_ITEMS = [
  {
    id: 'firfir', cat: 'breakfast', price: 280, emoji: '🍳', prep: 15, tags: ['halal'],
    img: img('photo-1482049016688-2d3e1b311543'),
    name: { en: 'Firfir', am: 'ፍርፍር' },
    desc: {
      en: 'Shredded injera tossed in spicy berbere sauce with niter kibbeh, served with yogurt.',
      am: 'በበርበሬ ሾርባና በንጥር ቅቤ የተዘጋጀ የተቀነጠሰ እንጀራ፣ ከእርጎ ጋር ይቀርባል።',
    },
  },
  {
    id: 'chechebsa', cat: 'breakfast', price: 260, emoji: '🥞', prep: 15, tags: ['halal'],
    img: img('photo-1567620905732-2d1ec7ab7445'),
    name: { en: 'Chechebsa', am: 'ጨጨብሳ' },
    desc: {
      en: 'Flaky flatbread pieces pan-fried in spiced butter and berbere, drizzled with honey.',
      am: 'በቅመም ቅቤና በርበሬ የተጠበሰ ቂጣ፣ ከማር ጋር።',
    },
  },
  {
    id: 'ful', cat: 'breakfast', price: 240, emoji: '🫘', prep: 12, tags: ['vegan'],
    img: img('photo-1512621776951-a57141f2eefd'),
    name: { en: 'Ful Medames', am: 'ፉል' },
    desc: {
      en: 'Slow-cooked fava beans with tomato, onion and olive oil, with fresh bread.',
      am: 'ከቲማቲም፣ ከሽንኩርትና ከወይራ ዘይት ጋር የተቀቀለ ባቄላ፣ ከትኩስ ዳቦ ጋር።',
    },
  },
  {
    id: 'omelette', cat: 'breakfast', price: 300, emoji: '🍳', prep: 10, tags: ['halal'],
    img: img('photo-1525351484163-7529414344d8'),
    name: { en: 'Garden Omelette', am: 'ኦምሌት' },
    desc: {
      en: 'Three-egg omelette with tomato, onion and green chili, served with toast.',
      am: 'ባለ ሦስት እንቁላል ኦምሌት ከቲማቲም፣ ሽንኩርትና ቃሪያ ጋር፣ ከቶስት ጋር።',
    },
  },
  {
    id: 'doro-wat', cat: 'main', price: 520, emoji: '🍗', prep: 25, tags: ['halal'],
    img: img('photo-1504674900247-0877df9cc836'),
    name: { en: 'Doro Wat', am: 'ዶሮ ወጥ' },
    desc: {
      en: 'Slow-simmered chicken in rich berbere sauce with a boiled egg and injera.',
      am: 'በበርበሬ ወጥ ቀስ ብሎ የበሰለ ዶሮ ከእንቁላልና ከእንጀራ ጋር።',
    },
  },
  {
    id: 'kitfo', cat: 'main', price: 580, emoji: '🥩', prep: 20, tags: ['halal', 'gf'],
    img: img('photo-1555939594-58d7cb561ad1'),
    name: { en: 'Kitfo', am: 'ክትፎ' },
    desc: {
      en: 'Minced prime beef seasoned with mitmita and spiced butter, with ayib and kocho.',
      am: 'በሚጥሚጣና በንጥር ቅቤ የተቀመመ የተከተፈ ሥጋ፣ ከአይብና ከቆጮ ጋር።',
    },
  },
  {
    id: 'shiro', cat: 'main', price: 330, emoji: '🍲', prep: 18, tags: ['vegan'],
    img: img('photo-1540189549336-e6e99c3679fe'),
    name: { en: 'Shiro Wat', am: 'ሽሮ ወጥ' },
    desc: {
      en: 'Silky chickpea stew simmered with garlic, onion and berbere. Fasting-friendly.',
      am: 'በነጭ ሽንኩርት፣ ሽንኩርትና በርበሬ የተቀቀለ ለስላሳ የሽምብራ ወጥ። ለጾም ተስማሚ።',
    },
  },
  {
    id: 'tibs', cat: 'main', price: 560, emoji: '🥘', prep: 20, tags: ['halal', 'gf'],
    img: img('photo-1546069901-ba9599a7e63c'),
    name: { en: 'Beef Tibs', am: 'ጥብስ' },
    desc: {
      en: 'Sizzling beef cubes sautéed with onion, rosemary and green chili.',
      am: 'ከሽንኩርት፣ ከሮዝመሪና ከቃሪያ ጋር የተጠበሰ የበሬ ሥጋ።',
    },
  },
  {
    id: 'beyaynetu', cat: 'main', price: 420, emoji: '🍛', prep: 22, tags: ['vegan'],
    img: img('photo-1490474418585-ba9bad8fd0ea'),
    name: { en: 'Beyaynetu', am: 'በያይነቱ' },
    desc: {
      en: 'Fasting platter: shiro, misir, gomen and seasonal vegetables on fresh injera.',
      am: 'የጾም ምግብ ሰሃን፦ ሽሮ፣ ምስር፣ ጎመንና ወቅታዊ አትክልቶች በትኩስ እንጀራ ላይ።',
    },
  },
  {
    id: 'club', cat: 'main', price: 450, emoji: '🥪', prep: 15, tags: ['halal'],
    img: img('photo-1528735602780-2552fd46c7af'),
    name: { en: 'Club Sandwich', am: 'ክለብ ሳንድዊች' },
    desc: {
      en: 'Triple-decker with grilled chicken, egg, lettuce and tomato, served with fries.',
      am: 'ባለ ሦስት ደረጃ ሳንድዊች ከተጠበሰ ዶሮ፣ እንቁላል፣ ሰላጣና ቲማቲም ጋር፣ ከድንች ጥብስ ጋር።',
    },
  },
  {
    id: 'buna', cat: 'drinks', price: 120, emoji: '☕', prep: 8, tags: ['vegan', 'gf'],
    img: img('photo-1495474472287-4d71bcdd2085'),
    name: { en: 'Ethiopian Buna', am: 'ቡና' },
    desc: {
      en: 'Freshly roasted traditional coffee served in a jebena.',
      am: 'አዲስ የተቆላ ባህላዊ የኢትዮጵያ ቡና በጀበና የሚቀርብ።',
    },
  },
  {
    id: 'tej', cat: 'drinks', price: 220, emoji: '🍯', prep: 5, tags: ['gf'],
    img: img('photo-1514362545857-3bc16c4c7d1b'),
    name: { en: 'Tej Honey Wine', am: 'ጠጅ' },
    desc: {
      en: 'Honey wine brewed in the Ethiopian tradition. Guests must be 21+.',
      am: 'በባህላዊ መንገድ የተጠመቀ የማር ጠጅ። ከ21 ዓመት በላይ ብቻ።',
    },
  },
  {
    id: 'avocado', cat: 'drinks', price: 160, emoji: '🥑', prep: 6, tags: ['vegan', 'gf'],
    img: img('photo-1553530666-ba11a7da3888'),
    name: { en: 'Avocado Juice', am: 'አቮካዶ ጭማቂ' },
    desc: {
      en: 'Layered avocado and papaya juice with a squeeze of lime.',
      am: 'ከፓፓያ ጋር የተነባበረ የአቮካዶ ጭማቂ፣ በሎሚ ንክኪ።',
    },
  },
  {
    id: 'shai', cat: 'drinks', price: 90, emoji: '🍵', prep: 5, tags: ['vegan', 'gf'],
    img: img('photo-1564890369478-c89ca6d9cde9'),
    name: { en: 'Spiced Tea', am: 'ሻይ በቅመም' },
    desc: {
      en: 'Black tea brewed with cardamom, cinnamon and clove.',
      am: 'በኩርዳድ፣ ቀረፋና ቅርንፉድ የተፈላ ሻይ።',
    },
  },
  {
    id: 'water', cat: 'drinks', price: 60, emoji: '💧', prep: 2, tags: ['vegan', 'gf'],
    img: img('photo-1548839140-29a749e1cf4d'),
    name: { en: 'Mineral Water', am: 'ማዕድን ውሃ' },
    desc: { en: 'Still mineral water, 500 ml.', am: 'የማዕድን ውሃ፣ 500 ሚ.ሊ።' },
  },
  {
    id: 'fruit', cat: 'desserts', price: 220, emoji: '🍉', prep: 8, tags: ['vegan', 'gf'],
    img: img('photo-1490474418585-ba9bad8fd0ea'),
    name: { en: 'Tropical Fruit Platter', am: 'የፍራፍሬ ሰሃን' },
    desc: { en: 'Seasonal tropical fruit, hand-cut.', am: 'ወቅታዊ ትኩስ የትሮፒካል ፍራፍሬዎች።' },
  },
  {
    id: 'choc-cake', cat: 'desserts', price: 250, emoji: '🍰', prep: 5, tags: [],
    img: img('photo-1578985545062-69928b1d9587'),
    name: { en: 'Chocolate Cake', am: 'ቸኮሌት ኬክ' },
    desc: {
      en: 'Dark chocolate layer cake with silky ganache.',
      am: 'በቸኮሌት ጋናሽ የተለበጠ ጥቁር ቸኮሌት ኬክ።',
    },
  },
  {
    id: 'honey-cake', cat: 'desserts', price: 200, emoji: '🍯', prep: 5, tags: [],
    img: img('photo-1565958011703-44f9829ba187'),
    name: { en: 'Honey Cake', am: 'የማር ኬክ' },
    desc: {
      en: 'Moist cake soaked in Ethiopian honey with toasted nuts.',
      am: 'በኢትዮጵያ ማር የራሰ ለስላሳ ኬክ ከተጠበሱ ለውዝ ጋር።',
    },
  },
];

export const MENU_BY_ID = Object.fromEntries(MENU_ITEMS.map((i) => [i.id, i]));

// Non-food amenities / service requests.
export const SERVICES = [
  {
    key: 'towels', icon: 'Bath',
    name: { en: 'Extra Towels', am: 'ተጨማሪ ፎጣ' },
    desc: { en: 'Fresh bath and hand towels', am: 'ትኩስ የመታጠቢያና የእጅ ፎጣዎች' },
  },
  {
    key: 'housekeeping', icon: 'BedDouble',
    name: { en: 'Housekeeping', am: 'የጽዳት አገልግሎት' },
    desc: { en: 'Room cleaning and turn-down', am: 'የክፍል ጽዳትና አልጋ ማዘጋጀት' },
  },
  {
    key: 'maintenance', icon: 'Wrench',
    name: { en: 'Maintenance', am: 'ጥገና' },
    desc: { en: 'Report an issue in your room', am: 'በክፍልዎ ያለ ችግር ያሳውቁ' },
  },
  {
    key: 'wakeup', icon: 'AlarmClock',
    name: { en: 'Wake-up Call', am: 'የማስነሻ ጥሪ' },
    desc: { en: 'Schedule a call to your room', am: 'ወደ ክፍልዎ ጥሪ ያስይዙ' },
  },
  // Desk / table requests (scope: 'desk'): shown at desk QRs, sent to the front desk
  // with the desk as the location. Services without a scope are room services.
  {
    key: 'waiter', icon: 'BellRing', scope: 'desk',
    name: { en: 'Call a waiter', am: 'አስተናጋጅ ጥራ' },
    desc: { en: 'A team member will come to you', am: 'አንድ የቡድን አባል ወደ እርስዎ ይመጣል' },
  },
  {
    key: 'bill', icon: 'Receipt', scope: 'desk',
    name: { en: 'Request the bill', am: 'ሂሳብ ጠይቅ' },
    desc: { en: 'We will bring your bill', am: 'ሂሳብዎን እናመጣለን' },
  },
  {
    key: 'clear', icon: 'UtensilsCrossed', scope: 'desk',
    name: { en: 'Clear the table', am: 'ጠረጴዛውን አጽዳ' },
    desc: { en: 'Remove used plates and glasses', am: 'ያገለገሉ ሳህኖችንና ብርጭቆዎችን ያንሱ' },
  },
  {
    key: 'assist', icon: 'HandHelping', scope: 'desk',
    name: { en: 'Ask for assistance', am: 'እርዳታ ጠይቅ' },
    desc: { en: 'Any other help you need', am: 'ሌላ የሚያስፈልግዎ እርዳታ' },
  },
];

export const SERVICES_BY_KEY = Object.fromEntries(SERVICES.map((s) => [s.key, s]));