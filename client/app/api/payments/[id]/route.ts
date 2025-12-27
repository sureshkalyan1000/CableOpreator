// app/api/payments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import mongoose from 'mongoose';

// GET - Get single payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    // Await the params Promise
    const { id } = await params;
    
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const paymentId = id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    const payment = await db.collection('payments').findOne({
      _id: new mongoose.Types.ObjectId(paymentId)
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);

  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    // Await the params Promise
    const { id } = await params;
    
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const paymentId = id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    // Check if payment exists
    const payment = await db.collection('payments').findOne({
      _id: new mongoose.Types.ObjectId(paymentId)
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Delete payment
    const result = await db.collection('payments').deleteOne({
      _id: new mongoose.Types.ObjectId(paymentId)
    });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: 'Payment deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete payment' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update payment by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise
) {
  try {
    // Await the params Promise
    const { id } = await params;
    
    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const paymentId = id;
    const body = await request.json();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existingPayment = await db.collection('payments').findOne({
      _id: new mongoose.Types.ObjectId(paymentId)
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update logic here (similar to your existing code)
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Remove _id if present to avoid update errors
    delete updateData._id;
    delete updateData.userId; // Don't allow changing userId

    const result = await db.collection('payments').updateOne(
      { _id: new mongoose.Types.ObjectId(paymentId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      const updatedPayment = await db.collection('payments').findOne({
        _id: new mongoose.Types.ObjectId(paymentId)
      });
      
      return NextResponse.json(
        { 
          message: 'Payment updated successfully',
          payment: updatedPayment
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment', details: error.message },
      { status: 500 }
    );
  }
}