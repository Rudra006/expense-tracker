import { useState, useCallback, useEffect } from 'react';
import { updateExpense } from '../api/expenses';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other',
];

function toInputDate(iso) {
  // Convert ISO string → YYYY-MM-DD for <input type="date">
  return new Date(iso).toISOString().slice(0, 10);
}

function validate(v) {
  const e = {};
  const num = Number(v.amount);
  if (!v.amount)                         e.amount      = 'Amount is required';
  else if (!Number.isFinite(num)||num<=0) e.amount      = 'Must be a positive number';
  if (!v.category)                       e.category    = 'Category is required';
  if (!v.description.trim())             e.description = 'Description is required';
  if (!v.date)                           e.date        = 'Date is required';
  return e;
}

export default function EditExpenseModal({ expense, onSave, onClose }) {
  const [form, setForm]               = useState({
    amount:      expense.amount,
    category:    expense.category,
    description: expense.description,
    date:        toInputDate(expense.date),
  });
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const updated = await updateExpense(expense.id, form);
      onSave(updated);
    } catch (err) {
      setServerError(err.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Edit Expense">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Expense</h2>
            <p className="modal-subtitle">Update the details below</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="edit-amount">Amount (₹)</label>
              <input
                id="edit-amount" name="amount" type="number"
                min="0.01" step="0.01" value={form.amount}
                onChange={handleChange} disabled={loading}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="field">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category" name="category" value={form.category}
                onChange={handleChange} disabled={loading}
                aria-invalid={!!errors.category}
              >
                <option value="">— Select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="field flex-2">
              <label htmlFor="edit-description">Description</label>
              <input
                id="edit-description" name="description" type="text"
                value={form.description} onChange={handleChange}
                disabled={loading} maxLength={500}
                aria-invalid={!!errors.description}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="field">
              <label htmlFor="edit-date">Date</label>
              <input
                id="edit-date" name="date" type="date"
                value={form.date} onChange={handleChange}
                disabled={loading} aria-invalid={!!errors.date}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          {serverError && <p className="server-error">{serverError}</p>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
