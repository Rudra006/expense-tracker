const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const requireAuth = require('../middleware/auth');

// All expense routes require authentication
router.use(requireAuth);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseAmountToPaise(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// POST /expenses  — create (idempotent, user-scoped)
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey) {
      const existing = await Expense.findOne({ idempotencyKey, userId: req.userId }).select('+idempotencyKey');
      if (existing) return res.status(200).json(existing.toPublicJSON());
    }

    const { amount, category, description, date } = req.body;

    const missing = ['amount', 'category', 'description', 'date'].filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const amountPaise = parseAmountToPaise(amount);
    if (amountPaise === null) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'date is not a valid ISO date' });
    }

    const expense = new Expense({
      userId: req.userId,
      amount: amountPaise,
      category: String(category).trim(),
      description: String(description).trim(),
      date: parsedDate,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });

    await expense.save();
    return res.status(201).json(expense.toPublicJSON());
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.idempotencyKey) {
      const existing = await Expense.findOne({
        idempotencyKey: req.headers['idempotency-key'],
        userId: req.userId,
      });
      if (existing) return res.status(200).json(existing.toPublicJSON());
    }
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /expenses  — list (user-scoped, filterable, sortable)
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { category, sort } = req.query;

    const filter = { userId: req.userId };
    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }

    const sortOrder = sort === 'date_asc' ? { date: 1 } : { date: -1 };

    const expenses = await Expense.find(filter).sort(sortOrder);
    return res.json(expenses.map((e) => e.toPublicJSON()));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
