/**
 * CategorySummary — shows total spent per category for the full dataset.
 * Only rendered when there is at least one expense.
 */
export default function CategorySummary({ expenses }) {
  if (!expenses.length) return null;

  // Aggregate by category (paise to avoid float accumulation)
  const byCategory = {};
  for (const e of expenses) {
    const paise = Math.round(parseFloat(e.amount) * 100);
    byCategory[e.category] = (byCategory[e.category] ?? 0) + paise;
  }

  const rows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <section className="card summary">
      <h2>Spending by Category</h2>
      <ul className="summary-list">
        {rows.map(([cat, paise]) => (
          <li key={cat}>
            <span className="category-pill">{cat}</span>
            <span className="summary-amount">
              ₹{(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
