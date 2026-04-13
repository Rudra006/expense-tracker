import { useState } from 'react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function ExpenseList({ expenses, loading, error, onEdit, onDelete }) {
  const [confirmId,  setConfirmId]  = useState(null); // row showing delete confirm
  const [deletingId, setDeletingId] = useState(null); // row being deleted

  const showActions = !!(onEdit || onDelete);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="table-state">
        <div className="spinner" />
        <p>Loading expenses…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-state table-state--error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{error}</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="table-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
        </svg>
        <p>No expenses found.</p>
        <span className="table-state-hint">Try clearing the category filter.</span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="right">Amount (₹)</th>
            {showActions && <th className="center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td><span className="date-text">{formatDate(e.date)}</span></td>
              <td><span className="pill">{e.category}</span></td>
              <td className="desc-cell">{e.description}</td>
              <td className="right amount">
                {parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>

              {showActions && (
                <td className="center">
                  {confirmId === e.id ? (
                    /* Inline delete confirmation */
                    <div className="confirm-row">
                      <span className="confirm-text">Delete?</span>
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id}
                      >
                        {deletingId === e.id ? '…' : 'Yes'}
                      </button>
                      <button
                        className="action-btn action-btn--muted"
                        onClick={() => setConfirmId(null)}
                        disabled={deletingId === e.id}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    /* Normal action buttons */
                    <div className="action-row">
                      {onEdit && (
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => onEdit(e)}
                          title="Edit expense"
                        >
                          <EditIcon />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="action-btn action-btn--delete"
                          onClick={() => setConfirmId(e.id)}
                          title="Delete expense"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
