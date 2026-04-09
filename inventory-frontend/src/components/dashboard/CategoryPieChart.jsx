import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0052FF', '#4D7CFF', '#0F172A', '#64748B', '#94A3B8'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] rounded-xl px-3 py-2 text-white text-sm shadow-xl">
      <p className="text-white/60 text-xs mb-0.5">{payload[0].name}</p>
      <p className="font-semibold">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function CategoryPieChart({ data = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">By Category</span>
        </div>
        <p className="text-[#64748B] text-sm">This month</p>
      </div>

      {loading ? (
        <div className="h-[240px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
        </div>
      ) : !data.length ? (
        <div className="h-[240px] flex items-center justify-center text-center">
          <p className="text-[#64748B] text-sm">No category data yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              dataKey="revenue"
              nameKey="name"
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#64748B', fontSize: '12px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
