'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionForm } from '../components/ui/transaction-form';
import { TransactionList } from '../components/ui/transaction-list';
import { MonthlyExpensesChart } from '../components/ui/monthly-expenses-chart';
import { CategoryPieChart } from '../components/ui/category-pie-chart';

const getAnimationDelay = (index) => `${200 * index}ms`;

function CustomMessageBox({ isOpen, onClose, title, message, type = 'info', children }) {
  if (!isOpen) return null;

  const bgColor = type === 'error' ? 'bg-red-700' : 'bg-zinc-700';
  const borderColor = type === 'error' ? 'border-red-600' : 'border-zinc-600';
  const titleColor = type === 'error' ? 'text-red-100' : 'text-zinc-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className={`w-full max-w-sm rounded-lg shadow-xl p-6 ${bgColor} ${borderColor} border`}>
        <h3 className={`text-xl font-bold mb-2 ${titleColor}`}>{title}</h3>
        {message && <p className="text-zinc-300 mb-4">{message}</p>}
        {children}
        <div className="flex justify-end mt-4">
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

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({
    title: '',
    message: '',
    type: 'info',
    isForm: false,
    initialFormData: null,
  });
  const [isMounted, setIsMounted] = useState(false);

  const showMessage = useCallback((title, message, type = 'info', isForm = false, initialFormData = null) => {
    setMessageBoxContent({ title, message, type, isForm, initialFormData });
    setIsMessageBoxOpen(true);
  }, []);

  const closeMessageBox = useCallback(() => {
    setIsMessageBoxOpen(false);
    setMessageBoxContent({ title: '', message: '', type: 'info', isForm: false, initialFormData: null });
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (errorMessage) {
      showMessage('Error Loading Data', errorMessage, 'error');
    }
  }, [errorMessage, showMessage]);

  const handleTransactionFormSuccess = useCallback(() => {
    closeMessageBox();
    showMessage('Success!', 'Transaction saved successfully.', 'info');
    fetchData();
  }, [closeMessageBox, showMessage, fetchData]);

  const handleTransactionFormCancel = useCallback(() => {
    closeMessageBox();
  }, [closeMessageBox]);

  const handleEditTransaction = useCallback((transaction) => {
    showMessage('Edit Transaction', null, 'info', true, transaction);
  }, [showMessage]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
        <p className="text-xl animate-pulse">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1
          className={`text-4xl md:text-5xl font-extrabold mb-8 text-zinc-50 ${
            isMounted ? "animate-fade-in-down" : "opacity-0 -translate-y-8"
          }`}
          style={{ animationDelay: getAnimationDelay(0) }}
        >
          My Dashboard
        </h1>

        <div
          className={`bg-zinc-800 p-6 rounded-lg shadow-xl mb-8 border border-zinc-700 ${
            isMounted ? "animate-slide-in-up" : "opacity-0 translate-y-8"
          }`}
          style={{ animationDelay: getAnimationDelay(1) }}
        >
          <h2 className="text-2xl font-bold mb-4 text-zinc-100">Transaction Input</h2>
          <p className="text-zinc-400 mb-4">Quickly log your income or expenses.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => showMessage('Add New Transaction', null, 'info', true, null)}
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
            >
              Add New Transaction
            </button>
          </div>
        </div>

        <div
          className={`bg-zinc-800 p-6 rounded-lg shadow-xl mb-8 border border-zinc-700 ${
            isMounted ? "animate-slide-in-up" : "opacity-0 translate-y-8"
          }`}
          style={{ animationDelay: getAnimationDelay(2) }}
        >
          <h2 className="text-2xl font-bold mb-4 text-zinc-100">Monthly Overview Chart</h2>
          <MonthlyExpensesChart transactions={transactions} />
        </div>

        <div
          className={`bg-zinc-800 p-6 rounded-lg shadow-xl mb-8 border border-zinc-700 ${
            isMounted ? "animate-slide-in-up" : "opacity-0 translate-y-8"
          }`}
          style={{ animationDelay: getAnimationDelay(3) }}
        >
          <CategoryPieChart transactions={transactions} />
        </div>

        <div
          className={`bg-zinc-800 p-6 rounded-lg shadow-xl border border-zinc-700 ${
            isMounted ? "animate-slide-in-up" : "opacity-0 translate-y-8"
          }`}
          style={{ animationDelay: getAnimationDelay(4) }}
        >
          <TransactionList
            transactions={transactions}
            onTransactionChange={fetchData}
            onEdit={handleEditTransaction}
          />
        </div>
      </div>

      <CustomMessageBox
        isOpen={isMessageBoxOpen}
        onClose={closeMessageBox}
        title={messageBoxContent.title}
        message={messageBoxContent.message}
        type={messageBoxContent.type}
      >
        {messageBoxContent.isForm && (
          <TransactionForm
            initialData={messageBoxContent.initialFormData}
            onSuccess={handleTransactionFormSuccess}
            onCancel={handleTransactionFormCancel}
          />
        )}
      </CustomMessageBox>
    </main>
  );
}
