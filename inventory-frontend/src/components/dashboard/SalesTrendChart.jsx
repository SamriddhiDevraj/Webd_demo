import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

function formatXDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] rounded-xl px-3 py-2 text-white text-sm shadow-xl">
      <p className="text-white/60 text-xs mb-1">{formatXDate(label)}</p>
      <p className="font-semibold">${payload[0].value.toFixed(2)}</p>
      {payload[0].payload.count !== undefined && (
        <p className="text-white/60 text-xs">{payload[0].payload.count} sale{payload[0].payload.count !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

export default function SalesTrendChart({ data = [], loading }) {
  const hasData = data.some((d) => d.revenue > 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Sales Trend</span>
          </div>
          <p className="text-[#64748B] text-sm">Last 30 days</p>
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
        </div>
      ) : !hasData ? (
        <div className="h-[280px] flex items-center justify-center text-center">
          <div>
            <p className="text-[#0F172A] font-medium">No sales data yet</p>
            <p className="text-[#64748B] text-sm mt-1">Record your first sale to see trends.</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXDate}
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0052FF"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#0052FF', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
