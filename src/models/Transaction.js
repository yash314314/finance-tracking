
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [50, 'Description can not be more than 50 characters'],
  },
  category: { 
    type: String,
    required: [true, 'Please add a category'],
  },
  type: { 
    type: String,
    enum: ['expense', 'income'], 
    required: [true, 'Please specify transaction type (expense/income)'],
    default: 'expense', 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
