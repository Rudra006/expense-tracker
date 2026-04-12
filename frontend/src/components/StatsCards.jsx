function fmt(paise) {
  return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function StatsCards({ expenses }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let totalPaise = 0;
  let monthPaise = 0;
  const catMap = {};

  for (const e of expenses) {
    const paise = Math.round(parseFloat(e.amount) * 100);
    totalPaise += paise;
    if (new Date(e.date).toISOString().slice(0, 7) === thisMonth) monthPaise += paise;
    catMap[e.category] = (catMap[e.category] ?? 0) + paise;
  }

  const topCategory =
    Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const cards = [
    {
      label: 'Total Spent',
      value: `₹${fmt(totalPaise)}`,
      sub: `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`,
      color: 'indigo',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'This Month',
      value: `₹${fmt(monthPaise)}`,
      sub: now.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      color: 'cyan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Total Entries',
      value: expenses.length,
      sub: 'all time',
      color: 'emerald',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Top Category',
      value: topCategory,
      sub: topCategory !== '—' ? `₹${fmt(catMap[topCategory] ?? 0)}` : 'no data yet',
      color: 'amber',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card stat-card--${c.color}`}>
          <div className="stat-card-icon">{c.icon}</div>
          <div className="stat-card-body">
            <p className="stat-card-label">{c.label}</p>
            <p className="stat-card-value">{c.value}</p>
            <p className="stat-card-sub">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
