import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSales, getSalesSummary } from '../../api/sale.api.js';
import { getProducts } from '../../api/product.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { fadeInUp, stagger } from '../../utils/animations.js';
import SaleSummaryCards from '../../components/sales/SaleSummaryCards.jsx';
import SaleHistoryTable from '../../components/sales/SaleHistoryTable.jsx';

export default function SalesPage() {
  const { activeShop } = useShop();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [products, setProducts] = useState([]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getSalesSummary(activeShop.shopId);
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [activeShop.shopId]);

  const fetchSales = useCallback(async (pg = page) => {
    setSalesLoading(true);
    try {
      const params = { page: pg };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (productFilter) params.productId = productFilter;
      const res = await getSales(activeShop.shopId, params);
      setSales(res.data.sales);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load sales');
    } finally {
      setSalesLoading(false);
    }
  }, [activeShop.shopId, startDate, endDate, productFilter, page]);

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchSales(page); }, [page]);
  useEffect(() => {
    getProducts(activeShop.shopId, { limit: 200 })
      .then((res) => setProducts(res.data.products))
      .catch(() => {});
  }, [activeShop.shopId]);

  function handleFilterApply() {
    setPage(1);
    fetchSales(1);
  }

  function handleClearFilters() {
    setStartDate('');
    setEndDate('');
    setProductFilter('');
    setPage(1);
    // Refetch without filters
    setSalesLoading(true);
    getSales(activeShop.shopId, { page: 1 })
      .then((res) => {
        setSales(res.data.sales);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => toast.error('Failed to load sales'))
      .finally(() => setSalesLoading(false));
  }

  const hasFilters = startDate || endDate || productFilter;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Analytics</span>
        </div>
        <h1 className="font-display text-3xl text-[#0F172A]">Sales</h1>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeInUp}>
        <SaleSummaryCards summary={summary} loading={summaryLoading} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-[#64748B] mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
          />
        </div>
        <div>
          <label className="block text-xs text-[#64748B] mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
          />
        </div>
        <div>
          <label className="block text-xs text-[#64748B] mb-1">Product</label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFilterApply}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white text-sm font-semibold hover:-translate-y-0.5 transition"
        >
          Apply
        </button>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 h-10 px-3 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm hover:bg-[#F1F5F9] transition"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <SaleHistoryTable
          sales={sales}
          loading={salesLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </motion.div>
    </motion.div>
  );
}
