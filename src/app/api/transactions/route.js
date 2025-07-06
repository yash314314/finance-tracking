
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  await dbConnect();
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    
    const { amount, date, description, category, type } = body;
    console.log('API POST: Received raw transaction data:', body);
    console.log('API POST: Destructured values:', { amount, date, description, category, type });

    
    if (!amount || !date || !description || !category || !type) {
      console.error('API POST: Validation Error - Missing required fields.');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof amount !== 'number' || isNaN(amount)) {
      console.error('API POST: Validation Error - Amount must be a number.');
      return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 });
    }
    if (new Date(date).toString() === 'Invalid Date') {
      console.error('API POST: Validation Error - Invalid date format.');
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    
    if (type !== 'expense' && type !== 'income') {
      console.error('API POST: Validation Error - Invalid transaction type.');
      return NextResponse.json({ error: 'Invalid transaction type. Must be "expense" or "income".' }, { status: 400 });
    }

 
    const transactionDataToSave = {
      amount,
      date,
      description,
      category, 
      type,    
    };
    console.log('API POST: Data being sent to Mongoose.create:', transactionDataToSave);

    const newTransaction = await Transaction.create(transactionDataToSave);
    console.log('API POST: New transaction created by Mongoose:', newTransaction);

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('API POST: Error adding transaction:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('API POST: Mongoose Validation Errors:', messages);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}
