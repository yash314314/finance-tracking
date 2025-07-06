'use client';

import { useState, useCallback, useEffect } from 'react';
import { format, getYear, getMonth, setMonth, setYear } from 'date-fns';


function CustomMessageBox({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const bgColor = type === 'error' ? 'bg-red-700' : 'bg-zinc-700';
  const borderColor = type === 'error' ? 'border-red-600' : 'border-zinc-600';
  const titleColor = type === 'error' ? 'text-red-100' : 'text-zinc-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className={`w-full max-w-sm rounded-lg shadow-xl p-6 ${bgColor} ${borderColor} border`}>
        <h3 className={`text-xl font-bold mb-2 ${titleColor}`}>{title}</h3>
        <p className="text-zinc-300 mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function BudgetForm({ initialData, onSuccess, onCancel }) {
 
  const categories = [
    'Groceries', 'Rent', 'Utilities', 'Transportation', 'F&B', 'Entertainment',
    'Salary', 'Freelance', 'Investments', 'Other Income', 'Health', 'Education', 'Shopping', 'Miscellaneous'
  ];


  const currentMonthYear = format(new Date(), 'yyyy-MM');
  const [month, setMonthState] = useState(initialData?.month || currentMonthYear);
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [budgetAmount, setBudgetAmount] = useState(initialData?.budgetAmount || '');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '', type: 'info' });


  useEffect(() => {
    if (initialData) {
      setMonthState(initialData.month || currentMonthYear);
      setCategory(initialData.category || categories[0]);
      setBudgetAmount(initialData.budgetAmount || '');
    } else {

      setMonthState(currentMonthYear);
      setCategory(categories[0]);
      setBudgetAmount('');
    }
    setFormError(null);
  }, [initialData]);


  const showMessage = useCallback((title, message, type = 'info') => {
    setMessageBoxContent({ title, message, type });
    setIsMessageBoxOpen(true);
  }, []);

  const closeMessageBox = useCallback(() => {
    setIsMessageBoxOpen(false);
    setMessageBoxContent({ title: '', message: '', type: 'info' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const parsedBudgetAmount = parseFloat(budgetAmount);
    if (parsedBudgetAmount < 0 || isNaN(parsedBudgetAmount)) {
      setFormError('Budget amount must be a non-negative number.');
      return;
    }
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      setFormError('Month is required and must be in YYYY-MM format.');
      return;
    }
    if (!category) {
      setFormError('Category is required.');
      return;
    }

    setIsLoading(true);
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `/api/budgets/${initialData._id}` : '/api/budgets';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          category,
          budgetAmount: parsedBudgetAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      showMessage(
        initialData ? 'Budget updated.' : 'Budget set.',
        `Budget for ${category} in ${month}: $${parsedBudgetAmount.toFixed(2)}`,
        'info'
      );

      if (!initialData) {
        setBudgetAmount('');
        setMonthState(currentMonthYear); 
        setCategory(categories[0]); 
      }
      onSuccess();
      onCancel?.();
    } catch (error) {
      showMessage(
        'Error',
        error.message || 'Failed to perform action.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };


  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = -12; i <= 12; i++) { 
      const date = setMonth(today, getMonth(today) + i);
      options.push(format(date, 'yyyy-MM'));
    }
    return [...new Set(options)].sort(); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-zinc-100 mb-1">
          Month
        </label>
        <select
          id="month"
          value={month}
          onChange={(e) => setMonthState(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          {generateMonthOptions().map((m) => (
            <option key={m} value={m}>
              {format(new Date(`${m}-01`), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-100 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="budgetAmount" className="block text-sm font-medium text-zinc-100 mb-1">
          Budget Amount
        </label>
        <input
          type="number"
          id="budgetAmount"
          step="0.01"
          placeholder="0.00"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {formError && (
        <p className="text-red-400 text-sm">{formError}</p>
      )}

      <div className="flex justify-end gap-2 mt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 hover:bg-zinc-600 hover:text-zinc-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Budget' : 'Set Budget'}
        </button>
      </div>

      <CustomMessageBox
        isOpen={isMessageBoxOpen}
        onClose={closeMessageBox}
        title={messageBoxContent.title}
        message={messageBoxContent.message}
        type={messageBoxContent.type}
      />
    </form>
  );
}
