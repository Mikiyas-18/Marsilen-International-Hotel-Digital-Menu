import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DESKS_BY_ID } from '../data/accounts';

/** The desk / table the customer is at: the scanned desk QR, or the one a visitor signed in at. */
export function useDesk() {
  const { qr } = useApp();
  const { visitor } = useAuth();
  const id = qr?.type === 'desk' ? qr.id : visitor?.deskId;
  return (id && DESKS_BY_ID[id]) || null;
}
