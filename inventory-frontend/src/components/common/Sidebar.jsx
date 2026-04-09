import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Users,
  Bell,
  BarChart2,
  MessageSquare,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShop } from '../../context/ShopContext.jsx';
import { logout as logoutApi } from '../../api/auth.api.js';

const ownerNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Record Sale', path: '/record-sale', icon: ShoppingCart },
  { label: 'Sales', path: '/sales', icon: TrendingUp },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'Forecast', path: '/forecast', icon: BarChart2, soon: true },
  { label: 'Chat', path: '/chat', icon: MessageSquare, soon: true },
];

const staffNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Record Sale', path: '/record-sale', icon: ShoppingCart },
  { label: 'Alerts', path: '/alerts', icon: Bell },
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;

  if (item.soon) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed pointer-events-none">
        <Icon size={18} className="text-white/60 flex-shrink-0" />
        <span className="text-sm text-white/60 flex-1">{item.label}</span>
        <span className="text-[10px] font-mono bg-white/10 text-white/40 px-1.5 py-0.5 rounded">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          isActive
            ? 'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-[0_4px_14px_rgba(0,82,255,0.25)]'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="text-sm">{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isOwner: authIsOwner } = useAuth();
  const { activeShop, isOwner, clearActiveShop } = useShop();
  const navigate = useNavigate();

  const navItems = isOwner ? ownerNav : staffNav;

  async function handleLogout() {
    try { await logoutApi(); } catch { /* stateless */ }
    clearActiveShop();
    logout();
    navigate('/login');
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <span className="font-display text-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
          InventoryAI
        </span>
        {activeShop && (
          <p className="text-white/40 text-xs mt-1 truncate">{activeShop.shopName}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white/60 text-sm truncate mb-3">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition w-full"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#0F172A] border-b border-white/10">
        <span className="font-display text-lg bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
          InventoryAI
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/60 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0F172A] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
              <span className="font-display text-lg bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
                InventoryAI
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-3 py-4 space-y-0.5">
                {navItems.map((item) => (
                  <NavItem key={item.path} item={item} onClick={() => setMobileOpen(false)} />
                ))}
              </nav>
            </div>
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-white/60 text-sm truncate mb-3">{user?.name}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
