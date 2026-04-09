import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSalesReport, getInventoryReport, exportCSV } from '../../api/report.api.js';
import { getCategories } from '../../api/category.api.js';
import { getProducts } from '../../api/product.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { fadeInUp, stagger } from '../../utils/animations.js';

const STATUS_STYLE = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-orange-100 text-orange-700',
  'Out of Stock': 'bg-red-100 text-red-700',
};

function SkeletonRow({ cols }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function ReportsPage() {
  const { activeShop } = useShop();
  const [activeTab, setActiveTab] = useState('sales');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // Data
  const [salesData, setSalesData] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryTotalValue, setInventoryTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter options
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getCategories(activeShop.shopId).then((r) => setCategories(r.data.categories)).catch(() => {});
    getProducts(activeShop.shopId, { limit: 200 }).then((r) => setProducts(r.data.products)).catch(() => {});
  }, [activeShop.shopId]);

  const fetchSales = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getSalesReport(activeShop.shopId, params);
      setSalesData(res.data.data);
      setSalesTotal(res.data.total);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }, [activeShop.shopId]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryReport(activeShop.shopId);
      // Sort: Out of Stock → Low Stock → In Stock
      const order = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
      const sorted = [...res.data.data].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
      setInventoryData(sorted);
      setInventoryTotalValue(res.data.totalValue);
    } catch {
      toast.error('Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  }, [activeShop.shopId]);

  useEffect(() => {
    if (activeTab === 'sales') fetchSales();
    else fetchInventory();
  }, [activeTab]);

  function handleApply() {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (productFilter) params.productId = productFilter;
    fetchSales(params);
  }

  function handleClear() {
    setStartDate(''); setEndDate(''); setCategoryFilter(''); setProductFilter('');
    fetchSales();
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = { type: activeTab === 'sales' ? 'sales' : 'inventory' };
      if (activeTab === 'sales') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (categoryFilter) params.categoryId = categoryFilter;
        if (productFilter) params.productId = productFilter;
      }
      const response = await exportCSV(activeShop.shopId, params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${params.type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully!');
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  const hasFilters = startDate || endDate || categoryFilter || productFilter;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Reports</span>
          </div>
          <h1 className="font-display text-3xl text-[#0F172A]">Reports</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:border-[#0052FF]/30 hover:text-[#0052FF] transition disabled:opacity-50 mt-8"
        >
          <Download size={15} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex gap-1 p-1 bg-[#F1F5F9] rounded-xl w-fit">
        {[
          { key: 'sales', label: 'Sales Report' },
          { key: 'inventory', label: 'Inventory Snapshot' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Filters (sales only) */}
      {activeTab === 'sales' && (
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#64748B] mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="">All Products</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleApply}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white text-sm font-semibold hover:-translate-y-0.5 transition"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 h-10 px-3 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm hover:bg-[#F1F5F9] transition"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </motion.div>
      )}

      {/* Tables */}
      <motion.div variants={fadeInUp}>
        {activeTab === 'sales' ? (
          <div>
            <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
                    {['Date', 'Product', 'SKU', 'Category', 'Qty', 'Unit Price', 'Revenue', 'Sold By'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={8} />)
                    : salesData.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-[#64748B]">
                          No sales found for the selected filters.
                        </td>
                      </tr>
                    )
                    : salesData.map((row, i) => (
                      <tr key={i} className="hover:bg-[#FAFAFA]">
                        <td className="px-4 py-3 text-[#64748B] whitespace-nowrap text-xs">{formatDateTime(row.date)}</td>
                        <td className="px-4 py-3 font-medium text-[#0F172A]">{row.product}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">{row.sku}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.category}</td>
                        <td className="px-4 py-3 text-[#0F172A]">{row.quantity}</td>
                        <td className="px-4 py-3 text-[#64748B]">{formatCurrency(row.unitPrice)}</td>
                        <td className="px-4 py-3 font-bold text-[#0F172A]">{formatCurrency(row.revenue)}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.soldBy}</td>
                      </tr>
                    ))}
                </tbody>
                {!loading && salesData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[#E2E8F0] bg-[#FAFAFA]">
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Totals</td>
                      <td className="px-4 py-3 font-bold text-[#0F172A]">
                        {salesData.reduce((s, r) => s + r.quantity, 0)}
                      </td>
                      <td />
                      <td className="px-4 py-3 font-bold text-[#0052FF]">{formatCurrency(salesTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
                    {['Product', 'SKU', 'Category', 'Stock', 'Reorder At', 'Cost', 'Price', 'Stock Value', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={9} />)
                    : inventoryData.length === 0
                    ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-[#64748B]">
                          No products found.
                        </td>
                      </tr>
                    )
                    : inventoryData.map((row, i) => (
                      <tr key={i} className="hover:bg-[#FAFAFA]">
                        <td className="px-4 py-3 font-medium text-[#0F172A]">{row.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">{row.sku}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.category}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F172A]">{row.quantity}</td>
                        <td className="px-4 py-3 text-[#94A3B8] font-mono text-xs">{row.reorderThreshold}</td>
                        <td className="px-4 py-3 text-[#64748B]">{formatCurrency(row.costPrice)}</td>
                        <td className="px-4 py-3 text-[#0F172A]">{formatCurrency(row.sellingPrice)}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F172A]">{formatCurrency(row.stockValue)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
                {!loading && inventoryData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[#E2E8F0] bg-[#FAFAFA]">
                      <td colSpan={7} className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Stock Value</td>
                      <td className="px-4 py-3 font-bold text-[#0052FF]">{formatCurrency(inventoryTotalValue)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
