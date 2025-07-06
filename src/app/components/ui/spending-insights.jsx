'use client';

import React from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';

export function SpendingInsights({ transactions, budgets }) {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');


  const aggregateExpensesByCategory = (txns, monthFilter) => {
    const aggregated = {};
    txns.forEach(txn => {
      const txnDate = parseISO(txn.date);
      const txnMonth = format(txnDate, 'yyyy-MM');
      if (txn.type === 'expense' && txn.amount > 0 && txnMonth === monthFilter) {
        const category = txn.category || 'Uncategorized';
        aggregated[category] = (aggregated[category] || 0) + txn.amount;
      }
    });
    return aggregated;
  };

  const currentMonthExpenses = aggregateExpensesByCategory(transactions, currentMonth);
  const previousMonthExpenses = aggregateExpensesByCategory(transactions, previousMonth);

  const currentMonthBudgets = {};
  budgets.forEach(budget => {
    if (budget.month === currentMonth) {
      currentMonthBudgets[budget.category] = budget.budgetAmount;
    }
  });

  const insights = [];

  let overBudgetCategories = [];
  let underBudgetCategories = [];

  Object.keys(currentMonthBudgets).forEach(category => {
    const budgeted = currentMonthBudgets[category];
    const actual = currentMonthExpenses[category] || 0;
    const difference = actual - budgeted;

    if (budgeted > 0 && actual > budgeted) {
      overBudgetCategories.push({ category, difference });
    } else if (budgeted > 0 && actual < budgeted) {
      underBudgetCategories.push({ category, difference: -difference }); 
    }
  });

  if (overBudgetCategories.length > 0) {
    overBudgetCategories.sort((a, b) => b.difference - a.difference);
    insights.push(
      <p key="over-budget" className="text-red-300">
        You are **over budget** in: {overBudgetCategories.map(item => `${item.category} by $${item.difference.toFixed(2)}`).join(', ')}. Consider reviewing spending in these areas.
      </p>
    );
  }

  if (underBudgetCategories.length > 0) {
    underBudgetCategories.sort((a, b) => b.difference - a.difference);
    insights.push(
      <p key="under-budget" className="text-emerald-300">
        Great job! You are **under budget** in: {underBudgetCategories.map(item => `${item.category} by $${item.difference.toFixed(2)}`).join(', ')}.
      </p>
    );
  }

  if (overBudgetCategories.length === 0 && underBudgetCategories.length === 0 && Object.keys(currentMonthBudgets).length > 0) {
    insights.push(
      <p key="on-budget" className="text-zinc-300">
        You are currently **on track** with your budgets for {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')}. Keep it up!
      </p>
    );
  } else if (Object.keys(currentMonthBudgets).length === 0) {
    insights.push(
      <p key="no-budget" className="text-zinc-400">
        No budgets set for {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')}. Set some budgets to get personalized insights!
      </p>
    );
  }

  const allCategories = new Set([...Object.keys(currentMonthExpenses), ...Object.keys(previousMonthExpenses)]);
  const significantChanges = [];

  allCategories.forEach(category => {
    const current = currentMonthExpenses[category] || 0;
    const previous = previousMonthExpenses[category] || 0;

    if (current > 0 || previous > 0) {
      const percentageChange = previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);

      if (percentageChange > 20) { 
        significantChanges.push({ category, change: percentageChange.toFixed(0), type: 'increase' });
      } else if (percentageChange < -20) { 
        significantChanges.push({ category, change: Math.abs(percentageChange).toFixed(0), type: 'decrease' });
      }
    }
  });

  if (significantChanges.length > 0) {
    significantChanges.sort((a, b) => b.change - a.change); 
    insights.push(
      <div key="spending-trends" className="mt-4 pt-4 border-t border-zinc-600">
        <h4 className="text-lg font-semibold text-zinc-200 mb-2">Spending Trends:</h4>
        {significantChanges.map((item, index) => (
          <p key={index} className={item.type === 'increase' ? 'text-red-300' : 'text-emerald-300'}>
            Your spending in **{item.category}** has {item.type === 'increase' ? 'increased' : 'decreased'} by **{item.change}%** compared to last month.
          </p>
        ))}
      </div>
    );
  } else if (Object.keys(currentMonthExpenses).length > 0 && Object.keys(previousMonthExpenses).length > 0) {
     insights.push(
      <p key="stable-spending" className="text-zinc-300 mt-4 pt-4 border-t border-zinc-600">
        Your spending patterns are relatively stable compared to last month.
      </p>
    );
  }


  if (insights.length === 0) {
    return <p className="text-zinc-400 mt-8 text-center">Add transactions and budgets to see spending insights.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-zinc-100">Spending Insights</h2>
      <div className="bg-zinc-700 p-4 rounded-lg space-y-2">
        {insights}
      </div>
    </div>
  );
}
