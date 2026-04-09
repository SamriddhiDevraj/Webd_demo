import { Package, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { timeAgo } from '../../utils/formatDate.js';

export default function ActivityFeed({ data = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 flex flex-col">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Recent Activity</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-[#F1F5F9] rounded animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-[#F1F5F9] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-6 text-center">
          <div>
            <ShoppingCart size={28} className="text-[#E2E8F0] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">No sales yet</p>
            <p className="text-xs text-[#64748B] mt-1">Record your first sale!</p>
          </div>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto -mr-2 pr-2 space-y-0.5">
          {data.map((item, i) => (
            <div
              key={item._id}
              className={`flex items-center gap-3 py-2.5 px-1 rounded-lg ${i % 2 === 1 ? 'bg-[#F1F5F9]/50' : ''}`}
            >
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-[#94A3B8]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A] truncate">{item.product.name}</p>
                <p className="text-xs text-[#94A3B8]">
                  {item.soldBy} · {item.quantity} unit{item.quantity !== 1 ? 's' : ''} · {timeAgo(item.soldAt)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#0F172A] flex-shrink-0">
                {formatCurrency(item.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
