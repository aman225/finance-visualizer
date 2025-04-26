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

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
