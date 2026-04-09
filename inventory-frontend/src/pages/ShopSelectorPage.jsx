import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import { logout as logoutApi } from '../api/auth.api.js';
import { fadeInUp, stagger } from '../utils/animations.js';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ShopSelectorPage() {
  const navigate = useNavigate();
  const { memberships, logout } = useAuth();
  const { setActiveShop } = useShop();

  // Auto-select if only one membership
  useEffect(() => {
    if (memberships.length === 1) {
      const m = memberships[0];
      setActiveShop({
        shopId: m.shopId,
        shopName: m.shopName,
        shopLogo: m.shopLogo ?? null,
        role: m.role,
      });
      navigate('/dashboard', { replace: true });
    }
  }, [memberships, setActiveShop, navigate]);

  function handleSelect(m) {
    setActiveShop({
      shopId: m.shopId,
      shopName: m.shopName,
      shopLogo: m.shopLogo ?? null,
      role: m.role,
    });
    navigate('/dashboard');
  }

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // stateless — ignore error
    }
    logout();
    navigate('/login');
  }

  // While waiting for auto-redirect with single shop
  if (memberships.length === 1) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={handleLogout}
          className="h-10 px-4 rounded-xl text-sm font-medium text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition"
        >
          Log out
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E2E8F0] bg-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0052FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052FF]" />
              </span>
              <span className="font-mono text-xs text-[#0052FF] font-medium tracking-widest uppercase">
                Your Shops
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeInUp} className="text-center mb-3">
            <h1 className="font-display text-4xl text-[#0F172A]">Select a Shop</h1>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-center text-[#64748B] mb-10">
            Choose which shop you want to manage
          </motion.p>

          {/* Shop grid */}
          {memberships.length === 0 ? (
            <motion.p variants={fadeInUp} className="text-center text-[#64748B]">
              No shops found. Something may have gone wrong.
            </motion.p>
          ) : (
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {memberships.map((m) => (
                <motion.button
                  key={m.shopId}
                  variants={fadeInUp}
                  onClick={() => handleSelect(m)}
                  className="group relative bg-white rounded-2xl border border-[#E2E8F0] p-6 text-left transition hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                >
                  {/* Gradient hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0052FF]/[0.02] to-[#4D7CFF]/[0.06] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col gap-3">
                    {/* Logo or initials */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {m.shopLogo ? (
                        <img
                          src={m.shopLogo}
                          alt={m.shopName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(m.shopName)
                      )}
                    </div>

                    {/* Names */}
                    <div>
                      <p className="font-display text-lg text-[#0F172A] leading-tight">
                        {m.shopName}
                      </p>
                    </div>

                    {/* Role badge */}
                    {m.role === 'owner' ? (
                      <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white">
                        Owner
                      </span>
                    ) : (
                      <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">
                        Staff
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
