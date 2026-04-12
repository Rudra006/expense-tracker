import StatsCards from './StatsCards';
import CategoryBarChart from './charts/CategoryBarChart';
import SpendingTrendChart from './charts/SpendingTrendChart';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function SkeletonCard({ height = 260 }) {
  return <div className="skeleton" style={{ height, borderRadius: 10 }} />;
}

export default function Dashboard({ expenses, loading, onNavigate }) {
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview at a glance</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('add')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Stats */}
      {loading
        ? <div className="stats-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}</div>
        : <StatsCards expenses={expenses} />
      }

      {/* Charts row */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending by Category</h2>
            <p className="card-subtitle">Total amount per category</p>
          </div>
          {loading ? <SkeletonCard /> : <CategoryBarChart expenses={expenses} />}
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending Trend</h2>
            <p className="card-subtitle">Monthly totals over time</p>
          </div>
          {loading ? <SkeletonCard /> : <SpendingTrendChart expenses={expenses} />}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="card">
        <div className="card-header card-header--row">
          <div>
            <h2 className="card-title">Recent Expenses</h2>
            <p className="card-subtitle">Last 5 entries</p>
          </div>
          {expenses.length > 5 && (
            <button className="btn-ghost" onClick={() => onNavigate('expenses')}>
              View all →
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonCard height={120} />
        ) : recent.length === 0 ? (
          <div className="table-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <p>No expenses yet.</p>
            <button className="btn-primary" onClick={() => onNavigate('add')}>
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td><span className="date-text">{formatDate(e.date)}</span></td>
                    <td><span className="pill">{e.category}</span></td>
                    <td className="desc-cell">{e.description}</td>
                    <td className="right amount">
                      ₹{parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
