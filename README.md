# Expense Tracker

A minimal full-stack personal finance tool built with the **MERN** stack
(MongoDB · Express · React · Node.js).

---

## Quick Start (local)

### Prerequisites
- Node.js ≥ 18
- A MongoDB instance (local or [Atlas free tier](https://www.mongodb.com/atlas))

### 1 — Backend

```bash
cd backend
cp .env.example .env          # fill in MONGODB_URI
npm install
npm run dev                   # listens on :5000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev                   # listens on :5173, proxies /expenses → :5000
```

Open **http://localhost:5173**

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.js            # Express entry point
│   │   ├── models/
│   │   │   └── Expense.js    # Mongoose schema
│   │   └── routes/
│   │       └── expenses.js   # GET + POST /expenses
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── expenses.js   # fetch wrapper
    │   ├── components/
    │   │   ├── ExpenseForm.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── FilterSort.jsx
    │   │   └── CategorySummary.jsx
    │   ├── App.jsx
    │   └── App.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API

| Method | Path         | Description                              |
|--------|--------------|------------------------------------------|
| POST   | /expenses    | Create an expense (idempotent)           |
| GET    | /expenses    | List expenses                            |
| GET    | /expenses?category=Food | Filter by category            |
| GET    | /expenses?sort=date_desc | Sort newest first (default)  |
| GET    | /health      | Health check                             |

**POST body**
```json
{
  "amount": "250.50",
  "category": "Food",
  "description": "Lunch at canteen",
  "date": "2024-04-10"
}
```
Send an `Idempotency-Key: <uuid>` header to make retries safe.

---

## Key Design Decisions

### Money as integer paise
Amounts are stored as **integer paise** (1 INR = 100 paise) in MongoDB.
Floating-point doubles cannot represent all decimal fractions exactly
(0.1 + 0.2 ≠ 0.3), which is unacceptable for financial data.
The API layer converts paise ↔ decimal strings so callers never see raw paise.

### Idempotency on POST /expenses
The frontend generates a UUID (`crypto.randomUUID`) once per "fresh" form.
It is sent as an `Idempotency-Key` HTTP header.
- If the server has already processed that key it returns the stored record (200).
- The UUID is persisted alongside the document with a unique sparse index.
- A duplicate key error from a concurrent request is caught and resolved gracefully.
- The key is **not** rotated on failure — the user can retry safely.
- The key **is** rotated after a successful submission to prepare the form for the next entry.

### Persistence: MongoDB (Atlas free tier)
MongoDB was chosen because:
- The Atlas M0 free tier is sufficient for this workload.
- Mongoose gives a clean schema + validation layer on top.
- It is the natural fit for the MERN stack requirement.

### Client-side filter + sort
All expenses are fetched once on load and filter/sort are applied in the
browser. This avoids a round-trip for every dropdown change, making the UI
feel instant. The server still supports `?category` and `?sort=date_desc`
for direct API consumers.

### Amount displayed with `en-IN` locale
Indian number formatting (e.g. 1,00,000) is used via
`toLocaleString('en-IN')` to match the ₹ currency symbol used throughout.

---

## Trade-offs (timebox)

- **No authentication** — a real app would require user accounts.
- **No delete / edit** — CRUD was scoped to create + read per the spec.
- **No pagination** — acceptable for a personal tool with hundreds of records; would need cursor-based pagination at scale.
- **No test suite** — would add unit tests for the paise conversion helper and integration tests for the API routes (supertest + jest) given more time.
- **No HTTPS in dev** — handled by the hosting platform in production.

---

## Hosting for Free

### Step 1 — MongoDB Atlas (database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Try Free**.
2. Create a **free M0 cluster** (512 MB, plenty for this app).
3. Create a database user (username + password).
4. Under **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** → **Drivers** → copy the connection string, replace `<password>`.

### Step 2 — Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**.
2. Connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add environment variables:
   - `MONGODB_URI` → your Atlas connection string
   - `CORS_ORIGINS` → your Vercel frontend URL (added in step 3)
   - `PORT` → `10000` (Render sets this automatically; you can leave it out)
7. Deploy. Render gives you a URL like `https://expense-api.onrender.com`.

> The free Render tier spins down after 15 minutes of inactivity. The first
> request after sleep takes ~30 s. Upgrade to a paid plan ($7/mo) to keep
> it always on.

### Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://expense-api.onrender.com`)
5. Deploy. Vercel gives you a URL like `https://expense-tracker.vercel.app`.
6. Copy that URL and paste it into Render's `CORS_ORIGINS` env var, then redeploy the backend.

### Summary of free services used

| Service | What for | Free tier limit |
|---------|----------|-----------------|
| MongoDB Atlas M0 | Database | 512 MB storage |
| Render (free) | Backend API | Spins down on idle |
| Vercel (hobby) | Frontend | Unlimited for personal projects |
