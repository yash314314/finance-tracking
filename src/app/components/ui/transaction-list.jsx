'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';

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

export function TransactionList({ transactions, onTransactionChange, onEdit }) {
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState({
    title: '',
    message: '',
    type: 'info',
    isConfirmation: false,
    confirmAction: null,
  });

  const showMessage = useCallback((title, message, type = 'info', isConfirmation = false, confirmAction = null) => {
    setMessageBoxContent({ title, message, type, isConfirmation, confirmAction });
    setIsMessageBoxOpen(true);
  }, []);

  const closeMessageBox = useCallback(() => {
    setIsMessageBoxOpen(false);
    setMessageBoxContent({ title: '', message: '', type: 'info', isConfirmation: false, confirmAction: null });
  }, []);

  const handleDelete = async (id) => {
    showMessage(
      'Confirm Deletion',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      'error',
      true,
      async () => {
        try {
          const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete transaction');
          }

          showMessage('Transaction deleted.', 'The transaction has been removed.', 'info');
          onTransactionChange();
        } catch (error) {
          showMessage('Error', error.message || 'Failed to delete transaction.', 'error');
        } finally {
          closeMessageBox();
        }
      }
    );
  };

  const handleEditClick = (transaction) => {
    if (onEdit) {
      onEdit(transaction);
    } else {
      showMessage('Edit Feature', 'Edit functionality is not fully integrated yet.', 'info');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-zinc-100">Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-zinc-400">No transactions yet. Add one above!</p>
      ) : (
        <div className="rounded-md border border-zinc-700 overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-zinc-700">
              <tr className="border-b border-zinc-600">
                <th className="h-10 px-2 text-left align-middle font-medium text-zinc-300 whitespace-nowrap min-w-[100px]">Date</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-zinc-300 whitespace-nowrap min-w-[150px]">Description</th>
                <th className="h-10 px-2 text-right align-middle font-medium text-zinc-300 whitespace-nowrap min-w-[100px]">Amount</th>
                <th className="h-10 px-2 text-right align-middle font-medium text-zinc-300 whitespace-nowrap min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b border-zinc-700 hover:bg-zinc-700 transition-colors">
                  <td className="p-2 align-middle text-zinc-200">{format(new Date(transaction.date), 'MMM dd,yyyy')}</td>
                  <td className="p-2 align-middle text-zinc-200">{transaction.description}</td>
                  <td className="p-2 align-middle text-right text-zinc-200">${transaction.amount.toFixed(2)}</td>
                  <td className="p-2 align-middle text-right flex space-x-2 justify-end">
                    <button
                      onClick={() => handleEditClick(transaction)}
                      className="px-3 py-1 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 hover:bg-zinc-600 hover:text-zinc-50 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CustomMessageBox
        isOpen={isMessageBoxOpen}
        onClose={closeMessageBox}
        title={messageBoxContent.title}
        message={messageBoxContent.message}
        type={messageBoxContent.type}
      >
        {messageBoxContent.isConfirmation && (
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                messageBoxContent.confirmAction?.();
              }}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={closeMessageBox}
              className="px-4 py-2 rounded-md bg-zinc-700 text-zinc-100 border border-zinc-600 hover:bg-zinc-600 hover:text-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </CustomMessageBox>
    </div>
  );
}
