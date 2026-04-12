import { useState, useCallback } from 'react';
import { createExpense } from '../api/expenses';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other',
];

function newKey() {
  return crypto.randomUUID();
}

const EMPTY_FORM = { amount: '', category: '', description: '', date: '' };

export default function ExpenseForm({ onCreated }) {
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [status, setStatus]             = useState('idle'); // idle | loading | error
  const [serverError, setServerError]   = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);

  const validate = (values) => {
    const errs = {};
    const num = Number(values.amount);
    if (!values.amount)                          errs.amount      = 'Amount is required';
    else if (!Number.isFinite(num) || num <= 0)  errs.amount      = 'Must be a positive number';
    if (!values.category)                        errs.category    = 'Category is required';
    if (!values.description.trim())              errs.description = 'Description is required';
    if (!values.date)                            errs.date        = 'Date is required';
    return errs;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading');
    setServerError('');
    try {
      const created = await createExpense(form, idempotencyKey);
      setForm(EMPTY_FORM);
      setErrors({});
      setIdempotencyKey(newKey());
      setStatus('idle');
      onCreated(created);
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="form-card">
      <h2>New Expense</h2>
      <form onSubmit={handleSubmit} noValidate>

        <div className="form-row">
          <div className="field">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount" name="amount" type="number" min="0.01" step="0.01"
              placeholder="0.00" value={form.amount}
              onChange={handleChange} disabled={isLoading}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category" name="category" value={form.category}
              onChange={handleChange} disabled={isLoading}
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
            <label htmlFor="description">Description</label>
            <input
              id="description" name="description" type="text"
              placeholder="What did you spend on?" value={form.description}
              onChange={handleChange} disabled={isLoading}
              aria-invalid={!!errors.description} maxLength={500}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date" name="date" type="date" value={form.date}
              onChange={handleChange} disabled={isLoading}
              aria-invalid={!!errors.date}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
        </div>

        {serverError && <p className="server-error">{serverError}</p>}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save Expense'}
          </button>
          {status === 'idle' && form.amount && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
