
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction'; 


export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    const body = await req.json();
    
    const { amount, date, description, category, type } = body;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required for update' }, { status: 400 });
    }
    
    if (!amount || !date || !description || !category || !type) {
      return NextResponse.json({ error: 'Missing required fields for update' }, { status: 400 });
    }
    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 });
    }
    if (new Date(date).toString() === 'Invalid Date') {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    if (type !== 'expense' && type !== 'income') {
      return NextResponse.json({ error: 'Invalid transaction type. Must be "expense" or "income".' }, { status: 400 });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id, 
      { amount, date, description, category, type },
      { new: true, runValidators: true } 
    );

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error('Error updating transaction:', error);
   
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required for deletion' }, { status: 400 });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
