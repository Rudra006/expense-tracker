const mongoose = require('mongoose');

/**
 * Amount is stored as an integer in **paise** (1 INR = 100 paise).
 * This avoids all floating-point rounding errors that occur when storing
 * money as IEEE-754 doubles (e.g., 0.1 + 0.2 !== 0.3).
 *
 * idempotencyKey allows clients to retry POST /expenses safely.
 * userId scopes each expense to its owner — users never see each other's data.
 */
const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number, // integer paise
      required: true,
      min: [1, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Compound index for the most common query: list expenses for a user sorted by date
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });

expenseSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    amount: (this.amount / 100).toFixed(2),
    category: this.category,
    description: this.description,
    date: this.date,
    created_at: this.created_at,
  };
};

module.exports = mongoose.model('Expense', expenseSchema);
