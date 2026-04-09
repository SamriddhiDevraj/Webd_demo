import { Package, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useShop } from '../../context/ShopContext.jsx';

function StockBadge({ quantity, threshold }) {
  if (quantity === 0) {
    return <span className="font-semibold text-[#EF4444]">0 — Out of stock</span>;
  }
  if (quantity <= threshold) {
    return <span className="font-semibold text-[#F97316]">{quantity} — Low</span>;
  }
  return <span className="font-semibold text-[#22C55E]">{quantity}</span>;
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function ProductTable({ products, loading, onEdit, onDelete, page, totalPages, total, onPageChange }) {
  const { isOwner } = useShop();

  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={48} className="text-[#E2E8F0] mb-4" />
        <p className="font-display text-xl text-[#0F172A] mb-1">No products yet</p>
        <p className="text-[#64748B] text-sm">Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Name / SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Cost</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Reorder At</th>
              {isOwner && <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : products.map((product) => (
                  <tr key={product._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E2E8F0]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                          <Package size={16} className="text-[#94A3B8]" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0F172A]">{product.name}</p>
                      <p className="font-mono text-xs text-[#94A3B8] mt-0.5">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3">
                      {product.category ? (
                        <span className="px-2 py-1 rounded-md bg-[#F1F5F9] text-[#64748B] text-xs font-medium">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#0F172A] font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{formatCurrency(product.costPrice)}</td>
                    <td className="px-4 py-3">
                      <StockBadge quantity={product.quantity} threshold={product.reorderThreshold} />
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] font-mono text-xs">{product.reorderThreshold}</td>
                    {isOwner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0052FF] transition"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => onDelete(product)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-[#64748B]">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 px-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 px-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
