const express = require('express');
const mongoose = require('mongoose');
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

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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

// ---------------------------------------------------------------------------
// PUT /expenses/:id  — update an expense (user-scoped)
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const { amount, category, description, date } = req.body;

    if (amount !== undefined) {
      const amountPaise = parseAmountToPaise(amount);
      if (amountPaise === null) {
        return res.status(400).json({ error: 'amount must be a positive number' });
      }
      expense.amount = amountPaise;
    }

    if (category !== undefined) {
      const cat = String(category).trim();
      if (!cat) return res.status(400).json({ error: 'category cannot be empty' });
      expense.category = cat;
    }

    if (description !== undefined) {
      const desc = String(description).trim();
      if (!desc) return res.status(400).json({ error: 'description cannot be empty' });
      expense.description = desc;
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'date is not a valid ISO date' });
      }
      expense.date = parsedDate;
    }

    await expense.save();
    return res.json(expense.toPublicJSON());
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /expenses/:id  — delete an expense (user-scoped)
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    return res.json({ message: 'Expense deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
