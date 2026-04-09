import { formatCurrency } from '../../utils/formatCurrency.js';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">
      <div className="h-[3px] bg-[#F1F5F9]" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-28 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-9 w-36 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-3 w-24 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-3 w-16 bg-[#F1F5F9] rounded animate-pulse" />
      </div>
    </div>
  );
}

export function RevenueCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export default function RevenueCard({ title, revenue, change, isPositive, count }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-[3px] bg-gradient-to-r from-[#0052FF] to-[#4D7CFF]" />
      <div className="p-6">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#64748B] mb-3">{title}</p>
        <p className="font-display text-3xl text-[#0F172A]">{formatCurrency(revenue)}</p>
        {change && (
          <p className={`text-sm font-medium mt-2 ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isPositive ? '↑' : '↓'} {change} vs prev. period
          </p>
        )}
        {count !== undefined && (
          <p className="text-sm text-[#64748B] mt-1">{count} sale{count !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}
