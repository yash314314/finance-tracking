'use client';

import { useState, useCallback, useEffect } from 'react';

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

export function TransactionForm({ initialData, onSuccess, onCancel }) {
  const categories = [
    'Groceries', 'Rent', 'Utilities', 'Transportation', 'F&B', 'Entertainment',
    'Salary', 'Freelance', 'Investments', 'Other Income', 'Health', 'Education', 'Shopping', 'Miscellaneous'
  ];

  const [amount, setAmount] = useState(initialData?.amount || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [type, setType] = useState(initialData?.type || 'expense');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      const newDate = initialData.date ? new Date(initialData.date) : null;
      setDate(newDate && !isNaN(newDate) ? newDate.toISOString().split('T')[0] : '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || categories[0]);
      setType(initialData.type || 'expense');
    } else {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(categories[0]);
      setType('expense');
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

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0 || isNaN(parsedAmount)) {
      setFormError('Amount must be a positive number.');
      return;
    }
    if (!date) {
      setFormError('Date is required.');
      return;
    }
    if (description.trim().length < 2 || description.trim().length > 50) {
      setFormError('Description must be between 2 and 50 characters.');
      return;
    }
    if (!category) {
      setFormError('Category is required.');
      return;
    }
    if (!type || (type !== 'expense' && type !== 'income')) {
      setFormError('Type must be either "expense" or "income".');
      return;
    }

    setIsLoading(true);
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `/api/transactions/${initialData._id}` : '/api/transactions';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          date: new Date(date).toISOString(),
          description: description.trim(),
          category,
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      showMessage(
        initialData ? 'Transaction updated.' : 'Transaction added.',
        `Amount: $${parsedAmount.toFixed(2)} - ${description.trim()} (${category})`,
        'info'
      );

      if (!initialData) {
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory(categories[0]);
        setType('expense');
      }

      onSuccess();
      onCancel?.();
    } catch (error) {
      showMessage('Error', error.message || 'Failed to perform action.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-100 mb-1">Amount</label>
        <input
          type="number"
          id="amount"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-zinc-100 mb-1">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-100 mb-1">Description</label>
        <input
          type="text"
          id="description"
          placeholder="Groceries, Rent, Salary..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-100 mb-1">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-zinc-100 mb-1">Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
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
          {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
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
