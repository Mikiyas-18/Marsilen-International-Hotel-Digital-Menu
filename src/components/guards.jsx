import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Staff pages: must be signed in with one of the allowed roles. */
export function RequireStaff({ roles, children }) {
  const { staff } = useAuth();
  if (!staff) return <Navigate to="/staff/login" replace />;
  if (!roles.includes(staff.role)) {
    return <Navigate to={staff.role === 'admin' ? '/admin' : '/staff/dashboard'} replace />;
  }
  return children;
}
