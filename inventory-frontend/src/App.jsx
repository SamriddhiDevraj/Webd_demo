import { AuthProvider } from './context/AuthContext.jsx';
import { ShopProvider } from './context/ShopContext.jsx';
import AppRouter from './router/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppRouter />
      </ShopProvider>
    </AuthProvider>
  );
}
