/**
 * FilterSort — compact inline toolbar controls.
 * Rendered inside the expense card header; no card wrapper of its own.
 */
export default function FilterSort({ categories, filter, sort, onFilterChange, onSortChange }) {
  return (
    <div className="filter-controls">
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort by date"
      >
        <option value="date_desc">Newest first</option>
        <option value="date_asc">Oldest first</option>
      </select>

      {filter && (
        <button className="clear-filter-btn" onClick={() => onFilterChange('')}>
          Clear ×
        </button>
      )}
    </div>
  );
}
