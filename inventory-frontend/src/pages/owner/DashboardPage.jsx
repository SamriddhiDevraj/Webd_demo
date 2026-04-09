import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShop } from '../../context/ShopContext.jsx';
import { fadeInUp, stagger } from '../../utils/animations.js';

function QuickActionCard({ title, description, icon: Icon, href }) {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={fadeInUp}
      onClick={() => navigate(href)}
      className="group bg-white rounded-2xl border border-[#E2E8F0] p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center mb-4">
        <Icon size={18} className="text-white" />
      </div>
      <p className="font-semibold text-[#0F172A] mb-1">{title}</p>
      <p className="text-[#64748B] text-sm">{description}</p>
    </motion.button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeShop } = useShop();

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Badge */}
      <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5">
        <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Overview</span>
      </motion.div>

      {/* Welcome */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-4xl text-[#0F172A]">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
            {user?.name}
          </span>
        </h1>
        <p className="text-[#64748B] mt-2">
          You&apos;re managing <strong>{activeShop?.shopName}</strong>. Full dashboard coming in Phase 3.
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
        <QuickActionCard
          title="Add Product"
          description="Add a new product to your inventory"
          icon={Package}
          href="/products"
        />
        <QuickActionCard
          title="Record Sale"
          description="Record a new sale transaction"
          icon={ShoppingCart}
          href="/record-sale"
        />
        <QuickActionCard
          title="View Sales"
          description="See your sales history and summaries"
          icon={TrendingUp}
          href="/sales"
        />
      </motion.div>
    </motion.div>
  );
}
