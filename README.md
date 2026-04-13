# Expense Tracker

A full-stack personal finance application built with the **MERN** stack. Users can securely record, review, edit, and delete their personal expenses with real-time filtering, sorting, and visual analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT), bcrypt |

---

## Features

- **Authentication** — Secure register/login with JWT sessions. Each user's data is fully isolated.
- **Create expenses** — Amount, category, description, and date with client + server validation.
- **Edit expenses** — Update any field via an inline modal.
- **Delete expenses** — Inline confirmation prevents accidental deletion.
- **Filter & sort** — Filter by category, sort by date (newest/oldest). Applied client-side for instant feedback.
- **Dashboard** — Spending by category (bar chart), monthly trend (area chart), and 4 summary stat cards.
- **Idempotent submission** — A UUID `Idempotency-Key` header prevents duplicate entries on network retries or double-clicks.
- **Responsive** — Fully usable from 380 px (mobile) to 1440 px+ (desktop).

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- MongoDB (local instance or Atlas connection string)

### Backend

```bash
cd backend
cp .env.example .env   # set MONGODB_URI and JWT_SECRET
npm install
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The Vite dev server proxies `/auth`, `/expenses`, and `/health` to the backend automatically — no `VITE_API_URL` needed locally.

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express entry point, CORS, middleware
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js             # User schema (bcrypt password hashing)
│   │   │   └── Expense.js          # Expense schema (amount stored in paise)
│   │   └── routes/
│   │       ├── auth.js             # POST /auth/register, /auth/login
│   │       └── expenses.js         # CRUD /expenses, /expenses/:id
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── auth.js             # register / login API calls
    │   │   └── expenses.js         # fetch / create / update / delete API calls
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state, token persistence
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── AuthPage.jsx    # Tabbed login / register page
    │   │   ├── charts/
    │   │   │   ├── CategoryBarChart.jsx
    │   │   │   └── SpendingTrendChart.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── EditExpenseModal.jsx
    │   │   ├── ExpenseForm.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── FilterSort.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── StatsCards.jsx
    │   ├── App.jsx
    │   └── App.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Reference

All `/expenses` routes require an `Authorization: Bearer <token>` header.

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |
| `GET` | `/expenses` | List all expenses for the authenticated user |
| `GET` | `/expenses?category=Food` | Filter by category |
| `GET` | `/expenses?sort=date_asc` | Sort oldest first (`date_desc` is default) |
| `POST` | `/expenses` | Create an expense (send `Idempotency-Key` header) |
| `PUT` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense |
| `GET` | `/health` | Health check |

### Expense payload

```json
{
  "amount": "250.50",
  "category": "Food",
  "description": "Lunch at canteen",
  "date": "2026-04-10"
}
```

---

## Design Decisions

### Money stored as integer paise

Amounts are persisted as **integer paise** (1 INR = 100 paise) rather than floating-point numbers. IEEE-754 doubles cannot represent all decimal fractions exactly — `0.1 + 0.2 !== 0.3` — which is unacceptable for financial data. The API layer converts between paise and decimal strings on every read/write so callers always receive correct values like `"250.50"`.

### Idempotent POST /expenses

The frontend generates a `crypto.randomUUID()` key when a form is first rendered. This UUID is sent as an `Idempotency-Key` HTTP header on every create request.

- If the server has already processed that key, it returns the existing record (HTTP 200) without creating a duplicate.
- The key is **not** rotated on network failure — allowing safe retries.
- The key **is** rotated after a successful save — preparing the form for the next entry.
- A unique sparse index on `idempotencyKey` in MongoDB handles concurrent duplicate requests gracefully.

### JWT authentication

Credentials are never stored. On login/register the server issues a signed JWT (`jsonwebtoken`, 7-day expiry). The token is stored in `localStorage` and attached as a `Bearer` token on every API request. A 401 response automatically clears the token and redirects to the login screen.

Passwords are hashed with **bcrypt (cost factor 12)** and the `password` field is excluded from all Mongoose query results by default (`select: false`).

### Client-side filter and sort

All expenses are fetched once on load. Filtering by category and sorting by date are applied in the browser, giving instant feedback without a network round-trip on every control change. The server-side `?category` and `?sort` query parameters remain available for direct API consumers or future pagination needs.

### User data isolation

Every expense document stores a `userId` field indexed alongside `date`. All read and write operations include `userId: req.userId` in the query filter, ensuring one user can never access another user's data even if they know a document ID.
