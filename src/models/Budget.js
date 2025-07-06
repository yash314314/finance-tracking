
import { Schema, models, model } from 'mongoose';

const BudgetSchema = new Schema({
  month: {
    type: String, 
    required: [true, 'Please specify the month for the budget'],
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category for the budget'],
  },
  budgetAmount: {
    type: Number,
    required: [true, 'Please specify a budget amount'],
    min: [0, 'Budget amount cannot be negative'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BudgetSchema.index({ month: 1, category: 1 }, { unique: true });

export default models.Budget || model('Budget', BudgetSchema);
