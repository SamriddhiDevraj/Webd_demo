import { Package, CheckCircle } from 'lucide-react';

const urgencyConfig = {
  critical: { label: 'CRITICAL', classes: 'bg-red-100 text-red-700' },
  high: { label: 'HIGH', classes: 'bg-orange-100 text-orange-700' },
  medium: { label: 'LOW', classes: 'bg-yellow-100 text-yellow-700' },
};

export default function LowStockPanel({ data = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 flex flex-col">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E2E8F0] bg-[#FAFAFA] mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#64748B]">Low Stock</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-[#F1F5F9] rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-[#F1F5F9] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-6 text-center">
          <div>
            <CheckCircle size={28} className="text-[#22C55E] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">All products well stocked</p>
          </div>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto -mr-2 pr-2 space-y-1">
          {data.map((item) => {
            const cfg = urgencyConfig[item.urgency] ?? urgencyConfig.medium;
            return (
              <div key={item._id} className="flex items-center gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-[#94A3B8]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{item.name}</p>
                  <p className="text-xs text-[#94A3B8] font-mono">
                    {item.sku} {item.category?.name ? `• ${item.category.name}` : ''}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {item.quantity} left / threshold {item.reorderThreshold}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.classes}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
