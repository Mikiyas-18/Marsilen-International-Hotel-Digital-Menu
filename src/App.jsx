import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { RequireStaff } from './components/guards';
import MenuPage from './pages/MenuPage';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import AdminPage from './pages/AdminPage';
import Toaster from './components/Toaster';

// Keeps ?room=304 / ?desk=pool intact when redirecting "/" or unknown paths.
function ToMenu() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/menu', search }} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Routes>
          {/* Customer side */}
          <Route path="/login" element={<ToMenu />} /> {/* no customer sign-in any more */}
          <Route path="/menu" element={<MenuPage />} />

          {/* Staff side (separate login, separate pages) */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route
            path="/staff/dashboard"
            element={<RequireStaff roles={['kitchen', 'frontdesk', 'admin']}><StaffDashboard /></RequireStaff>}
          />
          <Route path="/admin" element={<RequireStaff roles={['admin']}><AdminPage /></RequireStaff>} />

          <Route path="*" element={<ToMenu />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </AppProvider>
  );
}
