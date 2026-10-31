import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNow } from '../hooks/useNow';
import { seedStaff } from '../data/accounts';
import Header from '../components/Header';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;
const DEMO = seedStaff();

export default function StaffLogin() {
  const { t } = useApp();
  const { staff, staffLogin } = useAuth();
  const navigate = useNavigate();
  const now = useNow(1000);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);

  const home = (role) => (role === 'admin' ? '/admin' : '/staff/dashboard');
  if (staff) return <Navigate to={home(staff.role)} replace />;

  const lockSec = Math.max(0, Math.ceil((lockUntil - now) / 1000));
  const locked = lockSec > 0;

  const onSubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    const res = staffLogin(username, password);
    if (res.ok) {
      navigate(home(res.role), { replace: true });
      return;
    }
    setError(true);
    setPassword('');
    const next = fails + 1;
    if (next >= MAX_ATTEMPTS) {
      setLockUntil(Date.now() + LOCK_MS);
      setFails(0);
    } else {
      setFails(next);
    }
  };

  const field =
    'mt-1.5 min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base dark:border-white/10 dark:bg-navy-900';

  return (
    <div className="min-h-screen">
      <Header mode="public" />
      <main className="mx-auto flex max-w-md flex-col px-4 py-10">
        <form onSubmit={onSubmit} className="card space-y-5 p-6 shadow-lift" noValidate>
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-900 text-amber-400 dark:bg-white/10">
              <ShieldCheck className="h-7 w-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('staffLogin.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('staffLogin.subtitle')}</p>
          </div>

          <label className="block text-sm font-semibold">
            {t('staffLogin.username')}
            <input className={field} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            {t('staffLogin.password')}
            <input className={field} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {locked ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{t('login.locked', { sec: lockSec })}</p>
          ) : (
            error && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{t('staffLogin.error')}</p>
          )}

          <button type="submit" className="btn-gold w-full" disabled={locked || !username || !password}>
            <Lock className="h-4 w-4" aria-hidden />
            {t('login.submit')}
          </button>
        </form>

        <details className="card mt-6 p-4 text-sm">
          <summary className="cursor-pointer font-semibold">{t('staffLogin.demo')}</summary>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('login.demoNote')}</p>
          <ul className="mt-3 space-y-2">
            {DEMO.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span>
                  <strong>{t(`role.${a.role}`)}</strong> · {a.username} / {a.password}
                </span>
                <button
                  type="button"
                  className="btn-ghost min-h-[36px] px-3 text-xs"
                  onClick={() => {
                    setUsername(a.username);
                    setPassword(a.password);
                    setError(false);
                  }}
                >
                  {t('login.demoUse')}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </main>
    </div>
  );
}
