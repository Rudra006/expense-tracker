import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchExpenses, deleteExpense } from './api/expenses';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import FilterSort from './components/FilterSort';
import EditExpenseModal from './components/EditExpenseModal';

const PAGE_TITLES = { dashboard: 'Dashboard', expenses: 'Expenses', add: 'Add Expense' };

function AppShell() {
  const { user, logout } = useAuth();

  const [activePage,     setActivePage]     = useState('dashboard');
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [allExpenses,    setAllExpenses]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort,           setSort]           = useState('date_desc');
  const [editingExpense, setEditingExpense] = useState(null); // expense being edited

  const loadExpenses = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchExpenses({ sort: 'date_desc' });
      setAllExpenses(data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const categories = useMemo(
    () => [...new Set(allExpenses.map((e) => e.category))].sort(),
    [allExpenses]
  );

  const visibleExpenses = useMemo(() => {
    let list = categoryFilter
      ? allExpenses.filter((e) => e.category.toLowerCase() === categoryFilter.toLowerCase())
      : allExpenses;
    return [...list].sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      return sort === 'date_asc' ? -diff : diff;
    });
  }, [allExpenses, categoryFilter, sort]);

  const visibleTotal = useMemo(
    () => visibleExpenses.reduce((s, e) => s + Math.round(parseFloat(e.amount) * 100), 0),
    [visibleExpenses]
  );

  // ── CRUD handlers ──

  const handleCreated = useCallback((newExpense) => {
    setAllExpenses((prev) => [newExpense, ...prev]);
    setActivePage('expenses');
  }, []);

  const handleUpdated = useCallback((updatedExpense) => {
    setAllExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    setEditingExpense(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await deleteExpense(id);
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleNavigate = useCallback((page) => {
    setActivePage(page);
    setMobileOpen(false);
  }, []);

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        user={user}
        onLogout={logout}
      />

      <div className="main-content">
        {/* ── Topbar ── */}
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="topbar-title">{PAGE_TITLES[activePage]}</span>
          <div className="topbar-right">
            <span className="topbar-user-name">{user?.name}</span>
            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <button className="topbar-logout-btn" onClick={logout} title="Sign out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Pages ── */}
        <div className="page-wrapper">

          {activePage === 'dashboard' && (
            <Dashboard
              expenses={allExpenses}
              loading={loading}
              onNavigate={handleNavigate}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
            />
          )}

          {activePage === 'expenses' && (
            <div className="page">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Expenses</h1>
                  <p className="page-subtitle">Browse, filter and sort all your entries</p>
                </div>
                <button className="btn-primary" onClick={() => handleNavigate('add')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Expense
                </button>
              </div>

              <div className="card full-card">
                <div className="card-toolbar">
                  <FilterSort
                    categories={categories}
                    filter={categoryFilter}
                    sort={sort}
                    onFilterChange={setCategoryFilter}
                    onSortChange={setSort}
                  />
                  <div className="card-toolbar-summary">
                    <span className="record-count">
                      {visibleExpenses.length} record{visibleExpenses.length !== 1 ? 's' : ''}
                    </span>
                    <span className="total-badge">
                      Total: ₹{(visibleTotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="card-divider" />
                <ExpenseList
                  expenses={visibleExpenses}
                  loading={loading}
                  error={error}
                  onEdit={setEditingExpense}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          )}

          {activePage === 'add' && (
            <div className="page page--centered">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Add Expense</h1>
                  <p className="page-subtitle">Record a new expense entry</p>
                </div>
              </div>
              <ExpenseForm onCreated={handleCreated} />
            </div>
          )}

        </div>
      </div>

      {/* ── Edit modal — rendered at root so it overlays everything ── */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={handleUpdated}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

function Root() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
