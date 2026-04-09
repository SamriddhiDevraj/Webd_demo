import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '../../api/product.api.js';
import { getCategories } from '../../api/category.api.js';
import { useShop } from '../../context/ShopContext.jsx';
import { fadeInUp, stagger } from '../../utils/animations.js';
import ProductTable from '../../components/products/ProductTable.jsx';
import ProductForm from '../../components/products/ProductForm.jsx';
import CSVImportModal from '../../components/products/CSVImportModal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

export default function ProductsPage() {
  const { activeShop } = useShop();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef(null);

  const fetchProducts = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const res = await getProducts(activeShop.shopId, {
        search: opts.search ?? search,
        category: opts.category ?? categoryFilter,
        lowStock: opts.lowStock ?? lowStock,
        page: opts.page ?? page,
      });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [activeShop.shopId, search, categoryFilter, lowStock, page]);

  useEffect(() => { fetchProducts(); }, [page, categoryFilter, lowStock]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchProducts({ search, page: 1 });
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    getCategories(activeShop.shopId)
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, [activeShop.shopId]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(activeShop.shopId, deleteTarget._id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(product) {
    setEditProduct(product);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditProduct(null);
    fetchProducts();
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Inventory</span>
          </div>
          <h1 className="font-display text-3xl text-[#0F172A]">Products</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:border-[#0052FF]/30 hover:text-[#0052FF] transition"
          >
            <Upload size={15} />
            Import CSV
          </button>
          <button
            onClick={() => { setEditProduct(null); setShowForm(true); }}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => { setLowStock(!lowStock); setPage(1); }}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition ${
            lowStock
              ? 'bg-[#F97316]/10 border-[#F97316]/40 text-[#F97316]'
              : 'border-[#E2E8F0] text-[#64748B] hover:border-[#F97316]/30'
          }`}
        >
          <Filter size={14} />
          Low Stock
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={(p) => setPage(p)}
        />
      </motion.div>

      {/* Modals / panels */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
      {showImport && (
        <CSVImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); fetchProducts(); }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </motion.div>
  );
}
