import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import OverviewTab from '../components/admin/OverviewTab';
import MenuTab from '../components/admin/MenuTab';
import QrTab from '../components/admin/QrTab';
import StaffTab from '../components/admin/StaffTab';
import FeedbackTab from '../components/admin/FeedbackTab';

const TABS = [
  { id: 'overview', key: 'admin.tab.overview', Panel: OverviewTab },
  { id: 'menu', key: 'admin.tab.menu', Panel: MenuTab },
  { id: 'qr', key: 'admin.tab.qr', Panel: QrTab },
  { id: 'staff', key: 'admin.tab.staff', Panel: StaffTab },
  { id: 'feedback', key: 'admin.tab.feedback', Panel: FeedbackTab },
];

export default function AdminPage() {
  const { t } = useApp();
  const [tab, setTab] = useState('overview');
  const active = TABS.find((x) => x.id === tab);

  return (
    <div className="min-h-screen">
      <Header mode="staff" />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl print:hidden">
          <ShieldCheck className="h-7 w-7 text-gold" aria-hidden />
          {t('admin.title')}
        </h1>

        <div
          role="tablist"
          aria-label={t('admin.title')}
          className="scrollbar-none mt-5 flex gap-2 overflow-x-auto print:hidden"
        >
          {TABS.map((x) => (
            <button
              key={x.id}
              id={`tab-${x.id}`}
              role="tab"
              type="button"
              aria-selected={tab === x.id}
              aria-controls={`panel-${x.id}`}
              onClick={() => setTab(x.id)}
              className={`chip ${tab === x.id ? 'chip-on' : 'chip-off'}`}
            >
              {t(x.key)}
            </button>
          ))}
        </div>

        <div id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} className="mt-6">
          <active.Panel />
        </div>
      </main>
    </div>
  );
}
