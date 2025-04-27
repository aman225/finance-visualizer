// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { amount, description, date } = await request.json();

    if (!amount || !description || !date) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const newTransaction = await Transaction.create({ amount, description, date });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find().sort({ date: -1 });
    
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(transactions) ? transactions : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const { id, amount, description, date } = await request.json();

    if (!id || !amount || !description || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, description, date },
      { new: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Missing transaction ID" }, { status: 400 });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}