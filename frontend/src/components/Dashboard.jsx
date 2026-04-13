import StatsCards from './StatsCards';
import CategoryBarChart from './charts/CategoryBarChart';
import SpendingTrendChart from './charts/SpendingTrendChart';
import ExpenseList from './ExpenseList';

function SkeletonCard({ height = 260 }) {
  return <div className="skeleton" style={{ height, borderRadius: 10 }} />;
}

export default function Dashboard({ expenses, loading, onNavigate, onEdit, onDelete }) {
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

      {/* Charts */}
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
        <div className="card-divider" style={{ margin: '0 0 0 0' }} />
        <ExpenseList
          expenses={recent}
          loading={loading}
          error={null}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
