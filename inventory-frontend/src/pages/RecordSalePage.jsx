import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts } from '../api/product.api.js';
import { recordSale } from '../api/sale.api.js';
import { useShop } from '../context/ShopContext.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { fadeInUp, stagger } from '../utils/animations.js';
import ConfirmModal from '../components/common/ConfirmModal.jsx';

export default function RecordSalePage() {
  const { activeShop } = useShop();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [stockError, setStockError] = useState('');
  const searchTimer = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!dropdownRef.current?.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await getProducts(activeShop.shopId, { search: searchQuery, limit: 10 });
        setSearchResults(res.data.products);
        setShowDropdown(true);
      } catch { /* ignore */ }
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, activeShop.shopId]);

  function handleSelectProduct(product) {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
    setQuantity(1);
    setStockError('');
  }

  function handleQuantityChange(val) {
    const n = Math.max(1, Number(val));
    setQuantity(n);
    if (selectedProduct && n > selectedProduct.quantity) {
      setStockError(`Only ${selectedProduct.quantity} units available`);
    } else {
      setStockError('');
    }
  }

  async function handleConfirmSale() {
    setLoading(true);
    try {
      const res = await recordSale(activeShop.shopId, {
        productId: selectedProduct._id,
        quantity,
      });
      setSuccess({
        sale: res.data.sale,
        productName: selectedProduct.name,
        quantity,
        total: quantity * selectedProduct.price,
        remainingStock: selectedProduct.quantity - quantity,
      });
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to record sale');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSelectedProduct(null);
    setSearchQuery('');
    setQuantity(1);
    setStockError('');
    setSuccess(null);
  }

  const totalRevenue = selectedProduct ? quantity * selectedProduct.price : 0;
  const canSubmit = selectedProduct && quantity >= 1 && !stockError;

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md text-center space-y-5"
        >
          <motion.div variants={fadeInUp} className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle size={36} className="text-[#22C55E]" />
            </div>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <h2 className="font-display text-2xl text-[#0F172A]">Sale Recorded!</h2>
            <p className="text-[#64748B] mt-1">
              {success.productName} — {success.quantity} unit{success.quantity !== 1 ? 's' : ''} — {formatCurrency(success.total)}
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-[#F1F5F9] rounded-2xl p-4 text-sm text-[#64748B]">
            Remaining stock: <span className="font-semibold text-[#0F172A]">{success.remainingStock} units</span>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 h-12 rounded-xl border border-[#E2E8F0] text-[#64748B] font-medium hover:bg-[#F1F5F9] transition"
            >
              Record Another Sale
            </button>
            <button
              onClick={() => navigate('/sales')}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition"
            >
              View Sales History
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center pt-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">POS Terminal</span>
          </div>
          <h1 className="font-display text-3xl text-[#0F172A]">Record a Sale</h1>
        </motion.div>

        {/* Step 1: Product search */}
        <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-[#0F172A]">Step 1 — Select Product</p>
          <div className="relative" ref={dropdownRef}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (selectedProduct) setSelectedProduct(null); }}
              onFocus={() => searchResults.length && setShowDropdown(true)}
              placeholder="Search by name or SKU…"
              className="w-full h-12 pl-9 pr-4 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-10 overflow-hidden">
                {searchResults.map((p) => {
                  const outOfStock = p.quantity === 0;
                  return (
                    <button
                      key={p._id}
                      disabled={outOfStock}
                      onClick={() => handleSelectProduct(p)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                        outOfStock
                          ? 'opacity-40 cursor-not-allowed bg-[#FAFAFA]'
                          : 'hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-[#94A3B8]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">{p.name}</p>
                        <p className="font-mono text-xs text-[#94A3B8]">{p.sku}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-[#0F172A]">{formatCurrency(p.price)}</p>
                        <p className={`text-xs ${p.quantity === 0 ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>
                          {outOfStock ? 'Out of stock' : `${p.quantity} in stock`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected product card */}
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0052FF]/5 border border-[#0052FF]/20">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-[#E2E8F0]">
                  <Package size={18} className="text-[#94A3B8]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F172A] truncate">{selectedProduct.name}</p>
                <p className="font-mono text-xs text-[#64748B]">{selectedProduct.sku}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0052FF]">{formatCurrency(selectedProduct.price)}</p>
                <p className="text-xs text-[#64748B]">{selectedProduct.quantity} in stock</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Step 2: Quantity */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4"
          >
            <p className="text-sm font-semibold text-[#0F172A]">Step 2 — Quantity</p>
            <input
              type="number"
              min="1"
              max={selectedProduct.quantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition text-lg font-semibold ${
                stockError ? 'border-red-400' : 'border-[#E2E8F0]'
              }`}
            />
            {stockError && <p className="text-red-500 text-sm">{stockError}</p>}

            {/* Live calculation */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
              <span className="text-[#64748B] text-sm">
                {quantity} unit{quantity !== 1 ? 's' : ''} × {formatCurrency(selectedProduct.price)}
              </span>
              <span className="font-display text-xl text-[#0F172A]">{formatCurrency(totalRevenue)}</span>
            </div>
          </motion.div>
        )}

        {/* Step 3: Submit */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              disabled={!canSubmit}
              onClick={() => setShowConfirm(true)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Record Sale
            </button>
          </motion.div>
        )}
      </motion.div>

      {showConfirm && (
        <ConfirmModal
          title="Confirm Sale"
          message={`Sell ${quantity} unit${quantity !== 1 ? 's' : ''} of "${selectedProduct?.name}" for ${formatCurrency(totalRevenue)}?`}
          confirmLabel="Confirm Sale"
          onConfirm={handleConfirmSale}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
