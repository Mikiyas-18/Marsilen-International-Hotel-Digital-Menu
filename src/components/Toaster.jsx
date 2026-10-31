import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toaster() {
  const { toast } = useApp();
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 lg:bottom-8"
    >
      {toast && (
        <div
          key={toast.id}
          className="glass flex max-w-md animate-rise items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lift"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
