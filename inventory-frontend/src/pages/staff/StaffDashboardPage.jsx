import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShop } from '../../context/ShopContext.jsx';
import { getSales } from '../../api/sale.api.js';
import { getLowStock } from '../../api/dashboard.api.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { fadeInUp, stagger } from '../../utils/animations.js';
import LowStockPanel from '../../components/dashboard/LowStockPanel.jsx';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { activeShop } = useShop();
  const navigate = useNavigate();

  const [mySales, setMySales] = useState([]);
  const [myTotal, setMyTotal] = useState(0);
  const [salesLoading, setSalesLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  useEffect(() => {
    const shopId = activeShop.shopId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    getSales(shopId, {
      soldBy: user._id,
      startDate: today.toISOString(),
      limit: 50,
    })
      .then((r) => {
        setMySales(r.data.sales);
        const total = r.data.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
        setMyTotal(total);
      })
      .catch(() => {})
      .finally(() => setSalesLoading(false));

    getLowStock(shopId)
      .then((r) => setLowStock(r.data.lowStock))
      .catch(() => {})
      .finally(() => setLowStockLoading(false));
  }, [activeShop.shopId, user._id]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome card */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl text-[#0F172A]">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
              {user?.name}
            </span>
          </h1>
          <p className="text-[#64748B] mt-1">{activeShop?.shopName} · Staff Member</p>
        </div>
        <button
          onClick={() => navigate('/record-sale')}
          className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition whitespace-nowrap"
        >
          <ShoppingCart size={16} />
          Record a Sale
        </button>
      </motion.div>

      {/* Today's sales */}
      <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">My Sales Today</span>
            </div>
          </div>
          {!salesLoading && mySales.length > 0 && (
            <p className="text-sm font-semibold text-[#0F172A]">
              Total: <span className="text-[#0052FF]">{formatCurrency(myTotal)}</span>
            </p>
          )}
        </div>

        {salesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-32 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-4 w-24 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-4 w-16 bg-[#F1F5F9] rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : mySales.length === 0 ? (
          <p className="text-[#64748B] text-sm">You haven&apos;t recorded any sales today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  <th className="pb-2 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Product</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Qty</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Revenue</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {mySales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="py-2.5 font-medium text-[#0F172A]">{sale.productId?.name ?? '—'}</td>
                    <td className="py-2.5 text-[#64748B]">{sale.quantity}</td>
                    <td className="py-2.5 font-semibold text-[#0F172A]">{formatCurrency(sale.totalRevenue)}</td>
                    <td className="py-2.5 text-[#94A3B8] text-xs">{formatDateTime(sale.soldAt)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E2E8F0]">
                  <td colSpan={2} className="pt-3 text-sm font-semibold text-[#64748B]">Your total today</td>
                  <td colSpan={2} className="pt-3 font-display text-lg text-[#0052FF]">{formatCurrency(myTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </motion.div>

      {/* Low stock */}
      <motion.div variants={fadeInUp}>
        <LowStockPanel data={lowStock} loading={lowStockLoading} />
      </motion.div>
    </motion.div>
  );
}
