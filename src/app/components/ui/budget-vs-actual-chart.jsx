'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, isSameMonth } from 'date-fns';

export function BudgetVsActualChart({ transactions, budgets }) {
  const currentMonth = format(new Date(), 'yyyy-MM');

  const getChartData = (txns, bgs, monthFilter = currentMonth) => {
    const aggregatedExpenses = {};
    const budgetMap = {};

    
    bgs.forEach(budget => {
      if (budget.month === monthFilter) {
        budgetMap[budget.category] = budget.budgetAmount;
      }
    });

   
    txns.forEach(txn => {
      const txnDate = parseISO(txn.date);
      const txnMonth = format(txnDate, 'yyyy-MM');

     
      if (txn.type === 'expense' && txn.amount > 0 && txnMonth === monthFilter) {
        const category = txn.category || 'Uncategorized';
        if (!aggregatedExpenses[category]) {
          aggregatedExpenses[category] = 0;
        }
        aggregatedExpenses[category] += txn.amount;
      }
    });

    
    const chartData = [];
    const allCategories = new Set([...Object.keys(budgetMap), ...Object.keys(aggregatedExpenses)]);

    allCategories.forEach(category => {
      const budgeted = budgetMap[category] || 0;
      const actual = aggregatedExpenses[category] || 0;
      const difference = budgeted - actual;
      const isOverBudget = actual > budgeted && budgeted > 0; 

      chartData.push({
        name: category,
        budgeted,
        actual,
        difference,
        isOverBudget,
      });
    });

   
    chartData.sort((a, b) => a.name.localeCompare(b.name));

    return chartData;
  };

  const chartData = getChartData(transactions, budgets);

  if (chartData.length === 0) {
    return <p className="text-zinc-400 mt-8 text-center">No budget or expense data for {format(new Date(`${currentMonth}-01`), 'MMMM yyyy')} to display budget vs. actual comparison.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-zinc-100">Budget vs. Actual ({format(new Date(`${currentMonth}-01`), 'MMMM yyyy')})</h2>
      <div className="bg-zinc-700 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              contentStyle={{ backgroundColor: '#3f3f46', border: '1px solid #52525b', color: '#e4e4e7', borderRadius: '4px' }}
              itemStyle={{ color: '#e4e4e7' }}
              formatter={(value, name, props) => {
                if (name === 'budgeted') return [`$${value.toFixed(2)} (Budgeted)`, 'Budgeted'];
                if (name === 'actual') return [`$${value.toFixed(2)} (Actual)`, 'Actual'];
                return value;
              }}
            />
            <Legend wrapperStyle={{ color: '#e4e4e7' }} />
            <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#82ca9d" name="Actual" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
