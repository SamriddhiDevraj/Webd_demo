import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { ShoppingCart } from 'lucide-react';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function SaleHistoryTable({ sales, loading, page, totalPages, total, onPageChange }) {
  if (!loading && sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart size={40} className="text-[#E2E8F0] mb-3" />
        <p className="font-display text-lg text-[#0F172A]">No sales recorded yet</p>
        <p className="text-[#64748B] text-sm mt-1">Sales will appear here after you record them.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Unit Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Sold By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                      {formatDateTime(sale.soldAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#0F172A] font-medium">{sale.productId?.name ?? '—'}</p>
                      <p className="font-mono text-xs text-[#94A3B8]">{sale.productId?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-[#0F172A]">{sale.quantity}</td>
                    <td className="px-4 py-3 text-[#64748B]">{formatCurrency(sale.unitPrice)}</td>
                    <td className="px-4 py-3 font-bold text-[#0F172A]">{formatCurrency(sale.totalRevenue)}</td>
                    <td className="px-4 py-3 text-[#64748B]">{sale.soldBy?.name ?? '—'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-[#64748B]">
          <span>Page {page} of {totalPages} ({total} total)</span>
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
