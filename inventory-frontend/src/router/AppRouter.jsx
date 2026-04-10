import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import AppLayout from '../components/common/AppLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ShopSelectorPage from '../pages/ShopSelectorPage.jsx';
import DashboardPage from '../pages/owner/DashboardPage.jsx';
import StaffDashboardPage from '../pages/staff/StaffDashboardPage.jsx';
import ProductsPage from '../pages/owner/ProductsPage.jsx';
import SalesPage from '../pages/owner/SalesPage.jsx';
import AlertsPage from '../pages/owner/AlertsPage.jsx';
import ReportsPage from '../pages/owner/ReportsPage.jsx';
import RecordSalePage from '../pages/RecordSalePage.jsx';
import StaffPage from '../pages/owner/StaffPage.jsx';
import ForecastPage from '../pages/owner/ForecastPage.jsx';
import ChatPage from '../pages/owner/ChatPage.jsx';
import AcceptInvitePage from '../pages/auth/AcceptInvitePage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

function AuthGuard({ children, ownerOnly = false }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeShop, isOwner } = useShop();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeShop) return <Navigate to="/select-shop" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) return <Navigate to="/select-shop" replace />;
  return children;
}

function ShopSelectorRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <ShopSelectorPage />;
}

function DashboardRoute() {
  const { isOwner } = useShop();
  return (
    <AuthGuard>
      <AppLayout>
        {isOwner ? <DashboardPage /> : <StaffDashboardPage />}
      </AppLayout>
    </AuthGuard>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/select-shop" element={<ShopSelectorRoute />} />

        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route
          path="/products"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><ProductsPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/record-sale"
          element={
            <AuthGuard>
              <AppLayout><RecordSalePage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/sales"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><SalesPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><ReportsPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/alerts"
          element={
            <AuthGuard>
              <AppLayout><AlertsPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/staff"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><StaffPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/forecast"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><ForecastPage /></AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/chat"
          element={
            <AuthGuard ownerOnly>
              <AppLayout><ChatPage /></AppLayout>
            </AuthGuard>
          }
        />

        {/* Fully public — no auth guard, no AppLayout */}
        <Route path="/invite/:token" element={<AcceptInvitePage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
