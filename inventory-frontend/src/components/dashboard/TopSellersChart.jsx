import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] rounded-xl px-3 py-2 text-white text-sm shadow-xl">
      <p className="font-semibold">${payload[0].value.toFixed(2)}</p>
      {payload[0].payload.unitsSold !== undefined && (
        <p className="text-white/60 text-xs">{payload[0].payload.unitsSold} units sold</p>
      )}
    </div>
  );
}

export default function TopSellersChart({ data = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Top Sellers</span>
        </div>
        <p className="text-[#64748B] text-sm">This month by revenue</p>
      </div>

      {loading ? (
        <div className="h-[240px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
        </div>
      ) : !data.length ? (
        <div className="h-[240px] flex items-center justify-center text-center">
          <p className="text-[#64748B] text-sm">No sales this month yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0052FF" />
                <stop offset="100%" stopColor="#4D7CFF" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748B' }}
              width={110}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="url(#blueGradient)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
