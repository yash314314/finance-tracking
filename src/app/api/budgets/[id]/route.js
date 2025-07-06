
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget'; 

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = params; 
    const body = await req.json();
    const { month, category, budgetAmount } = body;

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required for update' }, { status: 400 });
    }
    if (!month || !category || budgetAmount === undefined || budgetAmount === null) {
      return NextResponse.json({ error: 'Missing required fields for update: month, category, and budgetAmount' }, { status: 400 });
    }
    if (typeof budgetAmount !== 'number' || isNaN(budgetAmount) || budgetAmount < 0) {
      return NextResponse.json({ error: 'Budget amount must be a non-negative number' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}$/.test(month)) { 
      return NextResponse.json({ error: 'Month must be in YYYY-MM format' }, { status: 400 });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { month, category, budgetAmount },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBudget, { status: 200 });
  } catch (error) {
    console.error('Error updating budget:', error);
    if (error.code === 11000) { 
      return NextResponse.json({ error: 'A budget for this category and month already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required for deletion' }, { status: 400 });
    }

    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Budget deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
