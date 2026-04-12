import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function buildData(expenses) {
  const map = {};
  for (const e of expenses) {
    const paise = Math.round(parseFloat(e.amount) * 100);
    map[e.category] = (map[e.category] ?? 0) + paise;
  }
  return Object.entries(map)
    .map(([category, paise]) => ({ category, amount: paise / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{payload[0].payload.category}</p>
      <p className="chart-tooltip-value">
        ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function CategoryBarChart({ expenses }) {
  const data = buildData(expenses);
  if (!data.length) return <p className="chart-empty">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
