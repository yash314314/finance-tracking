'use client';

import React from 'react';

export function SummaryCards({ transactions }) {

  const totalIncome = transactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = transactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const netBalance = totalIncome - totalExpenses;


  const netBalanceColor = netBalance >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  
      <div className="bg-zinc-800 p-6 rounded-lg shadow-xl border border-zinc-700 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">Total Income</h3>
        <p className="text-3xl font-bold text-emerald-400">${totalIncome.toFixed(2)}</p>
      </div>


      <div className="bg-zinc-800 p-6 rounded-lg shadow-xl border border-zinc-700 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">Total Expenses</h3>
        <p className="text-3xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
      </div>

   
      <div className="bg-zinc-800 p-6 rounded-lg shadow-xl border border-zinc-700 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-zinc-300 mb-2">Net Balance</h3>
        <p className={`text-3xl font-bold ${netBalanceColor}`}>${netBalance.toFixed(2)}</p>
      </div>
    </div>
  );
}
