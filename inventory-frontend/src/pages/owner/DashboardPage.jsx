import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDashboardStats, getDashboardCharts, getDashboardActivity, getLowStock } from '../../api/dashboard.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShop } from '../../context/ShopContext.jsx';
import { fadeInUp, stagger } from '../../utils/animations.js';
import RevenueCard, { RevenueCardSkeleton } from '../../components/dashboard/RevenueCard.jsx';
import SalesTrendChart from '../../components/dashboard/SalesTrendChart.jsx';
import TopSellersChart from '../../components/dashboard/TopSellersChart.jsx';
import CategoryPieChart from '../../components/dashboard/CategoryPieChart.jsx';
import LowStockPanel from '../../components/dashboard/LowStockPanel.jsx';
import ActivityFeed from '../../components/dashboard/ActivityFeed.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeShop } = useShop();

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  useEffect(() => {
    const shopId = activeShop.shopId;

    getDashboardStats(shopId)
      .then((r) => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setStatsLoading(false));

    getDashboardCharts(shopId)
      .then((r) => setCharts(r.data.charts))
      .catch(() => toast.error('Failed to load charts'))
      .finally(() => setChartsLoading(false));

    getDashboardActivity(shopId)
      .then((r) => setActivity(r.data.activity))
      .catch(() => {})
      .finally(() => setActivityLoading(false));

    getLowStock(shopId)
      .then((r) => setLowStock(r.data.lowStock))
      .catch(() => {})
      .finally(() => setLowStockLoading(false));
  }, [activeShop.shopId]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Overview</span>
        </div>
        <h1 className="font-display text-4xl text-[#0F172A]">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent">
            {user?.name}
          </span>
        </h1>
        <p className="text-[#64748B] mt-1">
          {activeShop?.shopName} · Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* Revenue cards */}
      <motion.div variants={fadeInUp}>
        {statsLoading || !stats ? (
          <RevenueCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RevenueCard
              title="Today's Revenue"
              revenue={stats.today.revenue}
              change={stats.today.change}
              isPositive={stats.today.isPositive}
              count={stats.today.count}
            />
            <RevenueCard
              title="This Week"
              revenue={stats.thisWeek.revenue}
              change={stats.thisWeek.change}
              isPositive={stats.thisWeek.isPositive}
              count={stats.thisWeek.count}
            />
            <RevenueCard
              title="This Month"
              revenue={stats.thisMonth.revenue}
              change={stats.thisMonth.change}
              isPositive={stats.thisMonth.isPositive}
              count={stats.thisMonth.count}
            />
          </div>
        )}
      </motion.div>

      {/* Sales trend — full width */}
      <motion.div variants={fadeInUp}>
        <SalesTrendChart data={charts?.trend} loading={chartsLoading} />
      </motion.div>

      {/* Top sellers + Category pie — side by side */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopSellersChart data={charts?.topSellers} loading={chartsLoading} />
        <CategoryPieChart data={charts?.categoryBreakdown} loading={chartsLoading} />
      </motion.div>

      {/* Low stock + Activity — side by side */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LowStockPanel data={lowStock} loading={lowStockLoading} />
        <ActivityFeed data={activity} loading={activityLoading} />
      </motion.div>
    </motion.div>
  );
}
