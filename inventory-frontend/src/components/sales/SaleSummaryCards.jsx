import { formatCurrency } from '../../utils/formatCurrency.js';

function SummaryCard({ label, revenue, change }) {
  const isPositive = change?.startsWith('+');
  const isNeutral = change === '0%';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Gradient top border */}
      <div className="h-0.5 bg-gradient-to-r from-[#0052FF] to-[#4D7CFF]" />
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-[#64748B] mb-3">{label}</p>
        <p className="font-display text-3xl text-[#0F172A]">{formatCurrency(revenue)}</p>
        {change && (
          <p className={`text-sm mt-2 font-medium ${isNeutral ? 'text-[#64748B]' : isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {change} vs prev. period
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="h-0.5 bg-[#E2E8F0]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-8 w-32 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="h-3 w-24 bg-[#F1F5F9] rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function SaleSummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryCard label="Today's Revenue" revenue={summary.today.revenue} change={summary.today.change} />
      <SummaryCard label="This Week" revenue={summary.thisWeek.revenue} change={summary.thisWeek.change} />
      <SummaryCard label="This Month" revenue={summary.thisMonth.revenue} change={summary.thisMonth.change} />
    </div>
  );
}
