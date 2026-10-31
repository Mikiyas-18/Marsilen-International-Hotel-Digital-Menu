import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ConciergeBell, LayoutDashboard, LogOut, MapPin, Moon, ShieldCheck, ShoppingBag, Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { HOTEL } from '../data/mock';
import { useDesk } from '../hooks/useDesk';
import LanguageToggle from './LanguageToggle';

const iconBtn =
  'relative inline-flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-2.5 text-sm font-medium text-navy-900 transition hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10';

const iconBtnDark =
  'relative inline-flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 text-sm font-medium text-white transition hover:bg-white/20 active:scale-95';

/**
 * mode = 'public' (login pages) | 'guest' (customer pages) | 'staff' (kitchen, front desk, admin)
 * Customer and staff headers are different on purpose: guests never see staff links.
 */
export default function Header({ mode = 'public', onCartClick }) {
  const { t, loc, cartCount, theme, setTheme, qr } = useApp();
  const { guest, visitor, guestLogout, staff, staffLogout } = useAuth();
  const desk = useDesk();
  const navigate = useNavigate();
  const { search } = useLocation();
  const dark = theme === 'dark';
  const onNavy = mode === 'guest';
  const btn = onNavy ? iconBtnDark : iconBtn;

  const onGuestLogout = () => {
    guestLogout();
    navigate({ pathname: '/menu', search });
  };
  const onStaffLogout = () => {
    staffLogout();
    navigate('/staff/login');
  };

  return (
    <header
      className={`sticky top-0 z-40 print:hidden ${
        onNavy ? 'border-b border-white/10 bg-royal text-white' : 'glass border-x-0 border-t-0'
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`h-10 w-10 shrink-0 place-items-center rounded-xl ${
              onNavy
                ? 'hidden border border-brass/60 text-brass sm:grid'
                : 'grid bg-gradient-to-br from-gold-light to-gold text-white shadow-md shadow-amber-700/30'
            }`}
          >
            <ConciergeBell className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 leading-tight">
            {!onNavy && (
              <p className="hidden truncate text-sm font-bold tracking-tight min-[420px]:block">{loc(HOTEL.name)}</p>
            )}
            {mode === 'guest' && (guest || visitor || qr) && (
              <span className="mt-0.5 hidden max-w-[220px] items-center gap-1 truncate rounded-full bg-brass/15 px-2 py-0.5 text-xs font-semibold text-brass md:inline-flex">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">
                  {guest
                    ? `${t('header.room', { room: guest.room })} · ${guest.firstName}`
                    : visitor
                      ? (visitor.room ? t('header.room', { room: visitor.room }) : visitor.auto ? loc(desk?.name) : `${loc(desk?.name)} · ${visitor.name}`)
                      : qr?.type === 'room'
                        ? t('header.room', { room: qr.id })
                        : loc(desk?.name)}
                </span>
              </span>
            )}
            {mode === 'staff' && staff && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {staff.name} · {t(`role.${staff.role}`)}
              </p>
            )}
            {mode === 'public' && (
              <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 min-[420px]:block">{t('app.tagline')}</p>
            )}
          </div>
        </div>

        {onNavy && (
          <p className="min-w-0 flex-1 text-center md:pointer-events-none md:absolute md:left-1/2 md:flex-none md:-translate-x-1/2">
            <span className="block font-serif text-sm font-bold uppercase leading-none tracking-[0.12em] text-brass min-[420px]:text-base sm:text-lg sm:tracking-[0.14em]">
              {loc(HOTEL.name).split(' ')[0]}
            </span>
            <span className="mt-1 block truncate text-[9px] uppercase leading-none tracking-[0.1em] text-white/70 sm:text-[10px] sm:tracking-[0.12em]">
              {loc(HOTEL.name).split(' ').slice(1).join(' ')}
            </span>
          </p>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {mode === 'staff' && staff && (
            <>
              <Link to="/staff/dashboard" className={btn} aria-label={t('nav.dashboard')}>
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{t('nav.dashboard')}</span>
              </Link>
              {staff.role === 'admin' && (
                <Link to="/admin" className={btn} aria-label={t('nav.admin')}>
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{t('nav.admin')}</span>
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            className={btn}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={dark ? t('header.themeToLight') : t('header.themeToDark')}
          >
            {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
          </button>

          <LanguageToggle onDark={onNavy} />

          {mode === 'guest' && (
            <>
              <button type="button" className={btn} onClick={onCartClick} aria-label={`${t('header.cart')} (${cartCount})`}>
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] animate-pop place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-white shadow"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              {visitor?.auto ? null : guest || visitor ? (
                <button type="button" className={`${btn} min-h-[44px] min-w-[44px]`} onClick={onGuestLogout} aria-label={t('logout')}>
                  <LogOut className="h-[18px] w-[18px]" aria-hidden />
                  <span className="hidden lg:inline">{t('logout')}</span>
                </button>
              ) : null}
            </>
          )}

          {mode === 'staff' && (
            <button type="button" className={btn} onClick={onStaffLogout} aria-label={t('logout')}>
              <LogOut className="h-[18px] w-[18px]" aria-hidden />
              <span className="hidden md:inline">{t('logout')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
