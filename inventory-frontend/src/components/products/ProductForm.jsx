import { useState, useEffect, useRef } from 'react';
import { X, Upload, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProduct, updateProduct } from '../../api/product.api.js';
import { getCategories, createCategory } from '../../api/category.api.js';
import { useShop } from '../../context/ShopContext.jsx';

const EMPTY_FORM = {
  name: '', sku: '', category: '', price: '', costPrice: '',
  quantity: '', reorderThreshold: '',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProductForm({ product, onClose, onSuccess }) {
  const { activeShop } = useShop();
  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const isEdit = !!product;

  useEffect(() => {
    getCategories(activeShop.shopId)
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});

    if (product) {
      setForm({
        name: product.name ?? '',
        sku: product.sku ?? '',
        category: product.category?._id ?? '',
        price: product.price ?? '',
        costPrice: product.costPrice ?? '',
        quantity: product.quantity ?? '',
        reorderThreshold: product.reorderThreshold ?? '',
      });
      if (product.imageUrl) setImagePreview(product.imageUrl);
    }
  }, [activeShop.shopId, product]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !isEdit && !prev.sku) {
        next.sku = slugify(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      const res = await createCategory(activeShop.shopId, { name: newCatName.trim() });
      const cat = res.data.category;
      setCategories((prev) => [...prev, cat]);
      setForm((prev) => ({ ...prev, category: cat._id }));
      setNewCatName('');
      setShowNewCat(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create category');
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (form.price === '' || isNaN(form.price)) errs.price = 'Valid price is required';
    if (form.costPrice === '' || isNaN(form.costPrice)) errs.costPrice = 'Valid cost price is required';
    if (form.quantity === '' || isNaN(form.quantity)) errs.quantity = 'Valid quantity is required';
    if (form.reorderThreshold === '' || isNaN(form.reorderThreshold)) errs.reorderThreshold = 'Valid threshold is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (imageFile) fd.append('image', imageFile);

    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct(activeShop.shopId, product._id, fd);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(activeShop.shopId, fd);
        toast.success('Product created successfully!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-display text-xl text-[#0F172A]">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">Product Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-[#0052FF]/40 transition"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload size={24} className="text-[#94A3B8] mb-2" />
                  <p className="text-sm text-[#64748B]">Click to upload or drag & drop</p>
                  <p className="text-xs text-[#94A3B8]">JPG, PNG, WEBP</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Product Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.name ? 'border-red-400' : 'border-[#E2E8F0]'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">SKU *</label>
            <input
              name="sku" value={form.sku} onChange={handleChange}
              placeholder="e.g. WH-1000"
              className={`w-full h-12 px-4 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.sku ? 'border-red-400' : 'border-[#E2E8F0]'}`}
            />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition bg-white"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCat(!showNewCat)}
              className="text-xs text-[#0052FF] mt-1.5 hover:underline"
            >
              + Create new category
            </button>
            {showNewCat && (
              <div className="flex gap-2 mt-2">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="h-9 px-3 rounded-lg bg-[#0052FF] text-white text-sm font-medium"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Price + Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Selling Price *</label>
              <input
                name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
                placeholder="0.00"
                className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.price ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Cost Price *</label>
              <input
                name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={handleChange}
                placeholder="0.00"
                className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.costPrice ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              />
              {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
            </div>
          </div>

          {/* Quantity + Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Quantity *</label>
              <input
                name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange}
                placeholder="0"
                className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.quantity ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Reorder At *</label>
              <input
                name="reorderThreshold" type="number" min="0" value={form.reorderThreshold} onChange={handleChange}
                placeholder="5"
                className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition ${errors.reorderThreshold ? 'border-red-400' : 'border-[#E2E8F0]'}`}
              />
              {errors.reorderThreshold && <p className="text-red-500 text-xs mt-1">{errors.reorderThreshold}</p>}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-[#E2E8F0] text-[#64748B] font-medium hover:bg-[#F1F5F9] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </>
  );
}
