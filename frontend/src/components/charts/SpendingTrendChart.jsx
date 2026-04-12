import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function buildData(expenses) {
  const map = {};
  for (const e of expenses) {
    const key = new Date(e.date).toISOString().slice(0, 7); // YYYY-MM
    const paise = Math.round(parseFloat(e.amount) * 100);
    map[key] = (map[key] ?? 0) + paise;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, paise]) => ({
      month: formatMonth(ym),
      amount: paise / 100,
    }));
}

function formatMonth(ym) {
  const [year, month] = ym.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', {
    month: 'short',
    year: '2-digit',
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">
        ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function SpendingTrendChart({ expenses }) {
  const data = buildData(expenses);
  if (data.length < 1) return <p className="chart-empty">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#trendGradient)"
          dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#6366f1' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
