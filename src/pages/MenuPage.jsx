import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Info, ShoppingBag, TriangleAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DIETARY_TAGS, HOTEL } from '../data/mock';
import { useDesk } from '../hooks/useDesk';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import MenuCard from '../components/MenuCard';
import ServiceRequests from '../components/ServiceRequests';
import CartDrawer from '../components/CartDrawer';
import MenuFooter from '../components/MenuFooter';
import FeedbackSection from '../components/FeedbackSection';
import ServiceModeToggle from '../components/ServiceModeToggle';
import { isTable } from '../data/accounts';


export default function MenuPage() {
  const { t, loc, qr, menuItems, cartCount, subtotalEtb, money } = useApp();
  const { guest, visitor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [diet, setDiet] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!location.state?.openCart) return;
    setCartOpen(true);
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
  }, [location.pathname, location.search, location.state?.openCart, navigate]);

  const items = useMemo(
    () =>
      menuItems.filter(
        (i) => (category === 'all' || i.cat === category) && diet.every((d) => i.tags.includes(d)),
      ),
    [menuItems, category, diet],
  );

  const showFood = category !== 'amenities';
  const showServices = category === 'all' || category === 'amenities';
  const toggleDiet = (d) => setDiet((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const desk = useDesk();
  const roomMismatch = qr?.type === 'room' && guest && qr.id !== guest.room;

  return (
    <div className="min-h-screen">
      <Header mode="guest" onCartClick={() => setCartOpen(true)} />

      <section className="relative isolate overflow-hidden bg-royal text-white">
        <img
          src="/images/hero.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center] md:left-auto md:w-[66%]"
        />
        <div className="absolute inset-0 -z-10 bg-royal/70 md:bg-transparent md:bg-[linear-gradient(90deg,#0A1B33_34%,rgba(10,27,51,0)_66%)]" />
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brass">
            {guest || (visitor && !visitor.auto)
              ? t('guest.hello', { name: guest?.firstName ?? visitor?.name })
              : visitor?.room
                ? t('header.room', { room: visitor.room })
                : desk
                  ? loc(desk.name)
                  : loc(HOTEL.name)}
          </p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            {t('hero.title1')}
            <span className="block text-brass">{t('hero.title2')}</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">
            {t('hero.line1')}
            <br />
            {t('hero.line2')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="btn rounded-full bg-brass px-6 text-royal shadow-lg hover:brightness-105">
              {t('hero.explore')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            {desk && isTable(desk.id) ? (
              <ServiceModeToggle variant="hero" />
            ) : (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="btn rounded-full border border-brass/70 px-6 text-white hover:bg-white/10"
              >
                {t('menu.viewCart')}
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        {desk && (
          <p role="note" className="mb-5 flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {guest
              ? t('menu.atDesk', { place: loc(desk.name) })
              : visitor
                ? t('menu.atDeskVisitor', { place: loc(desk.name) })
                : t('menu.atPlace', { place: loc(desk.name) })}
          </p>
        )}
        {visitor?.room && (
          <p role="note" className="mb-5 flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t('menu.atRoomPay', { room: t('header.room', { room: visitor.room }) })}
          </p>
        )}
        {roomMismatch && (
          <p role="alert" className="mb-5 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t('guest.qrMismatch', { qr: qr.id, room: guest.room })}
          </p>
        )}

        <CategoryTabs active={category} onChange={setCategory} />

        <div id="menu" className="scroll-mt-20 pt-10 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('menu.popular')}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t('menu.popularSub')}</p>
        </div>

        {showFood && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={t('menu.filterBy')}>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('menu.filterBy')}:</span>
              {DIETARY_TAGS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={diet.includes(d)}
                  onClick={() => toggleDiet(d)}
                  className={`chip min-h-[32px] px-3 text-xs ${diet.includes(d) ? 'chip-on' : 'chip-off'}`}
                >
                  {t(`diet.${d}`)}
                </button>
              ))}
            </div>

            {items.length > 0 ? (
              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id} className="flex">
                    <div className="flex w-full flex-col [&>article]:flex-1">
                      <MenuCard item={item} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card mt-5 p-8 text-center text-slate-500 dark:text-slate-400">{t('menu.empty')}</p>
            )}
          </>
        )}

        {showServices && <ServiceRequests />}

        <FeedbackSection />
      </main>

      {/* Mobile sticky cart bar */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-3 lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="btn-gold w-full justify-between px-5 py-3 text-base shadow-lift"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {t('menu.viewCart')} · {t('menu.items', { count: cartCount })}
            </span>
            <span className="tabular-nums">{money(subtotalEtb)}</span>
          </button>
        </div>
      )}

      <MenuFooter />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
