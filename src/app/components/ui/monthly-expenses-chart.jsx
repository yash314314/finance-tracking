'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export function MonthlyExpensesChart({ transactions }) {
  const aggregateMonthlyExpenses = (txns) => {
    const monthlyData = {};

    txns.forEach(txn => {

      const date = parseISO(txn.date);
      const monthYear = format(date, 'MMM yyyy'); 

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += txn.amount;
    });

    
    const sortedData = Object.keys(monthlyData)
      .map(key => {
        
        const [monthStr, yearStr] = key.split(' ');
        const dateForSorting = new Date(`${monthStr} 1, ${yearStr}`);
        return { name: key, expenses: monthlyData[key], _sortDate: dateForSorting };
      })
      .sort((a, b) => a._sortDate.getTime() - b._sortDate.getTime()) 
      .map(({ name, expenses }) => ({ name, expenses })); 

    return sortedData;
  };

  const chartData = aggregateMonthlyExpenses(transactions);

  if (chartData.length === 0) {
    return <p className="text-zinc-400 mt-8 text-center">No expense data to display for the chart yet.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-zinc-100">Monthly Expenses Overview</h2>
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
              formatter={(value) => `$${value.toFixed(2)}`}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="expenses" fill="#60a5fa" radius={[4, 4, 0, 0]} /> 
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
