import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import mongoose from 'mongoose'; // Import mongoose for Types.ObjectId

// GET - Fetch all payments or filter by userId
export async function GET(request: NextRequest) {
  try {
    // Connect using your existing Mongoose function
    const mongooseConnection = await connectToDatabase();
    
    // Get the native MongoDB driver from Mongoose connection
    const db = mongooseConnection.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month'); // Optional filter by month
    const year = searchParams.get('year'); // Optional filter by year

    let query: any = {};
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      query.payFor = {
        $gte: startDate,
        $lt: endDate
      };
    } else if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      
      query.payFor = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const payments = await db.collection('payments')
      .find(query)
      .sort({ payFor: -1, payDate: -1 }) // Sort by payment period and then date
      .toArray();

    return NextResponse.json(payments);

  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    // Connect using your existing Mongoose function
    const mongooseConnection = await connectToDatabase();
    
    // Get the native MongoDB driver from Mongoose connection
    const db = mongooseConnection.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const body = await request.json();

    // Validate required fields
    const { userId, payFor, payDate, paid, balance } = body;

    if (!userId || !payFor || !payDate || paid === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, payFor, payDate, paid' },
        { status: 400 }
      );
    }

    // Validate userId format - use mongoose.Types.ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Parse payFor as Date (accepts multiple formats)
    let payForDate: Date;
    try {
      // Try parsing as ISO string
      payForDate = new Date(payFor);
      
      // If payFor is in "YYYY-MM" format, set to first day of month
      if (typeof payFor === 'string' && /^\d{4}-\d{2}$/.test(payFor)) {
        payForDate = new Date(payFor + '-01');
      }
      
      // Validate date
      if (isNaN(payForDate.getTime())) {
        throw new Error('Invalid payFor date');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payFor date format. Use YYYY-MM-DD, YYYY-MM, or ISO string' },
        { status: 400 }
      );
    }

    // Parse payDate as Date
    let payDateTime: Date;
    try {
      payDateTime = new Date(payDate);
      if (isNaN(payDateTime.getTime())) {
        throw new Error('Invalid payDate');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payDate format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for duplicate payment for same month/year
    const existingPayment = await db.collection('payments').findOne({
      userId: new mongoose.Types.ObjectId(userId),
      payFor: {
        $gte: new Date(payForDate.getFullYear(), payForDate.getMonth(), 1),
        $lt: new Date(payForDate.getFullYear(), payForDate.getMonth() + 1, 1)
      }
    });

    if (existingPayment) {
      return NextResponse.json(
        { 
          error: 'Payment already exists for this month',
          existingPayment 
        },
        { status: 409 } // Conflict
      );
    }

    // Create payment document
    const paymentData = {
      userId: new mongoose.Types.ObjectId(userId),
      payFor: payForDate,
      payDate: payDateTime,
      paid: Number(paid),
      balance: balance ? Number(balance) : 0,
      month: payForDate.getMonth() + 1, // 1-12
      year: payForDate.getFullYear(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert payment
    const result = await db.collection('payments').insertOne(paymentData);

    // Get the created payment
    const createdPayment = await db.collection('payments').findOne({
      _id: result.insertedId
    });

    return NextResponse.json(
      { 
        message: 'Payment created successfully',
        payment: createdPayment
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}