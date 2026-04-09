import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ShopProvider } from './context/ShopContext.jsx';
import AppRouter from './router/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#0F172A', color: '#fff', borderRadius: '12px' },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </ShopProvider>
    </AuthProvider>
  );
}
