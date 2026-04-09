import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import AppLayout from '../components/common/AppLayout.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ShopSelectorPage from '../pages/ShopSelectorPage.jsx';
import DashboardPage from '../pages/owner/DashboardPage.jsx';
import ProductsPage from '../pages/owner/ProductsPage.jsx';
import SalesPage from '../pages/owner/SalesPage.jsx';
import AlertsPage from '../pages/owner/AlertsPage.jsx';
import RecordSalePage from '../pages/RecordSalePage.jsx';
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/select-shop" element={<ShopSelectorRoute />} />

        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <AppLayout><DashboardPage /></AppLayout>
            </AuthGuard>
          }
        />
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
          path="/alerts"
          element={
            <AuthGuard>
              <AppLayout><AlertsPage /></AppLayout>
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
