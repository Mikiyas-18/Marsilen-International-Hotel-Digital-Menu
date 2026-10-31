import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../data/accounts';

const field =
  'mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-navy-900';
const EMPTY = { name: '', username: '', password: '', role: 'kitchen' };

export default function StaffTab() {
  const { t, notify } = useApp();
  const { staff, staffAccounts, addStaff, removeStaff } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.name.trim() && form.username.trim() && form.password;

  const submit = (e) => {
    e.preventDefault();
    const res = addStaff(form);
    if (res.ok) {
      setForm(EMPTY);
      setError('');
    } else {
      setError(t(res.error === 'exists' ? 'staffAdmin.exists' : 'staffAdmin.weak'));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section aria-labelledby="add-staff" className="card self-start p-5">
        <h2 id="add-staff" className="flex items-center gap-2 text-lg font-bold">
          <UserPlus className="h-5 w-5 text-gold" aria-hidden />
          {t('staffAdmin.add')}
        </h2>
        <form onSubmit={submit} className="mt-3 space-y-3" noValidate>
          <label className="block text-sm font-semibold">
            {t('staffAdmin.name')}
            <input className={field} value={form.name} onChange={set('name')} autoComplete="off" />
          </label>
          <label className="block text-sm font-semibold">
            {t('staffLogin.username')}
            <input className={field} value={form.username} onChange={set('username')} autoComplete="off" />
          </label>
          <label className="block text-sm font-semibold">
            {t('staffLogin.password')}
            <input className={field} type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
          </label>
          <label className="block text-sm font-semibold">
            {t('staffAdmin.role')}
            <select className={field} value={form.role} onChange={set('role')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{t(`role.${r}`)}</option>
              ))}
            </select>
          </label>
          {error && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" className="btn-gold w-full" disabled={!canSubmit}>
            {t('staffAdmin.create')}
          </button>
        </form>
      </section>

      <section aria-labelledby="staff-list" className="card p-5">
        <h2 id="staff-list" className="text-lg font-bold">{t('admin.tab.staff')}</h2>
        <ul className="mt-3 divide-y divide-slate-200 dark:divide-white/10">
          {staffAccounts.map((a) => {
            const self = staff?.id === a.id;
            return (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {a.name}{' '}
                    {self && (
                      <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        {t('staffAdmin.you')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.username} · {t(`role.${a.role}`)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={self}
                  onClick={() => {
                    if (!removeStaff(a.id)) notify(t('staffAdmin.lastAdmin'));
                  }}
                  aria-label={t('staffAdmin.remove', { name: a.name })}
                  className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
