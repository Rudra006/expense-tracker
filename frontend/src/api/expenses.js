const BASE = import.meta.env.VITE_API_URL ?? '';

function getToken() {
  return localStorage.getItem('et_token');
}

async function request(path, { headers: extraHeaders, ...rest } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    ...rest,
  });

  if (res.status === 401) {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export function fetchExpenses({ category, sort } = {}) {
  const qs = new URLSearchParams();
  if (category) qs.set('category', category);
  if (sort)     qs.set('sort', sort);
  const query = qs.toString() ? `?${qs}` : '';
  return request(`/expenses${query}`);
}

export function createExpense(data, idempotencyKey) {
  return request('/expenses', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(data),
  });
}

export function updateExpense(id, data) {
  return request(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id) {
  return request(`/expenses/${id}`, { method: 'DELETE' });
}
