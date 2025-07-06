'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';


const COLORS = [
  '#8884d8', 
  '#82ca9d', 
  '#ffc658', 
  '#ff8042', 
  '#0088FE', 
  '#00C49F', 
  '#FFBB28',
  '#FF8042', 
  '#A28DFF', 
  '#64D8C7', 
  '#FFD700', 
  '#FF4500', 
  '#36A2EB', 
  '#FF6384', 
  '#4BC0C0',
];

export function CategoryPieChart({ transactions }) {
  const aggregateCategoryExpenses = (txns) => {
    const categoryData = {};

    txns.forEach(txn => {

      if (txn.type === 'expense' && txn.amount > 0 && txn.category) {
        if (!categoryData[txn.category]) {
          categoryData[txn.category] = 0;
        }
        categoryData[txn.category] += txn.amount;
      }
    });


    const data = Object.keys(categoryData).map(category => ({
      name: category,
      value: categoryData[category],
    }));


    data.sort((a, b) => b.value - a.value);

    return data;
  };

  const chartData = aggregateCategoryExpenses(transactions);

  if (chartData.length === 0) {
    return <p className="text-zinc-400 mt-8 text-center">No expense data categorized to display in the pie chart yet.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-zinc-100">Expenses by Category</h2>
      <div className="bg-zinc-700 p-4 rounded-lg flex flex-col items-center"> 
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#3f3f46', border: '1px solid #52525b', color: '#e4e4e7', borderRadius: '4px' }}
              itemStyle={{ color: '#e4e4e7' }}
              formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend
              wrapperStyle={{ color: '#e4e4e7' }}
              formatter={(value) => <span style={{ color: '#e4e4e7' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
