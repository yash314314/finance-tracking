
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget'; 

export async function GET() {
  await dbConnect();
  try {
    const budgets = await Budget.find({}).sort({ month: -1, category: 1 }); 
    return NextResponse.json(budgets, { status: 200 });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { month, category, budgetAmount } = body;

    if (!month || !category || budgetAmount === undefined || budgetAmount === null) {
      return NextResponse.json({ error: 'Missing required fields: month, category, and budgetAmount' }, { status: 400 });
    }
    if (typeof budgetAmount !== 'number' || isNaN(budgetAmount) || budgetAmount < 0) {
      return NextResponse.json({ error: 'Budget amount must be a non-negative number' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}$/.test(month)) { 
      return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 });
    }

    const newBudget = await Budget.create({ month, category, budgetAmount });
    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Error adding budget:', error);
    if (error.code === 11000) { 
      return NextResponse.json({ error: 'A budget for this category and month already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add budget' }, { status: 500 });
  }
}
