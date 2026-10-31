import { ChefHat, ConciergeBell, Heart, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HOTEL } from '../data/mock';

const FEATURES = [
  { icon: Heart, title: 'feat.fresh', sub: 'feat.freshSub' },
  { icon: ChefHat, title: 'feat.taste', sub: 'feat.tasteSub' },
  { icon: ConciergeBell, title: 'feat.service', sub: 'feat.serviceSub' },
  { icon: Smile, title: 'feat.satisfaction', sub: 'feat.satisfactionSub' },
];

export default function MenuFooter() {
  const { t, loc } = useApp();
  const [first, ...rest] = loc(HOTEL.name).split(' ');
  return (
    <footer className="bg-royal pb-24 text-white lg:pb-0 print:hidden">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-4 md:gap-y-0">
        {FEATURES.map(({ icon: Icon, title, sub }) => (
          <li key={title} className="flex flex-col items-center gap-1.5 text-center md:border-l md:border-white/10 md:first:border-l-0">
            <Icon className="h-6 w-6 text-brass" aria-hidden />
            <p className="text-sm font-semibold">{t(title)}</p>
            <p className="text-xs text-white/60">{t(sub)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <ConciergeBell className="h-5 w-5 text-brass" aria-hidden />
            <span className="font-serif text-base font-bold uppercase tracking-[0.14em] text-brass">{first}</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/70">{rest.join(' ')}</span>
          </p>
          <a href="#feedback" className="text-xs font-semibold text-white/80 underline-offset-4 hover:text-brass hover:underline">
            {t('footer.feedback')}
          </a>
          <p className="text-xs text-white/50">
            {t('footer.rights', { year: new Date().getFullYear(), hotel: loc(HOTEL.name) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
