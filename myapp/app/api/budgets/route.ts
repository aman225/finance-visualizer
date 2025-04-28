import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Budget } from "@/models/Budget";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { category, amount, month } = await request.json();

    if (!category || !amount || !month) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Use upsert to handle both create and update in one operation
    const budget = await Budget.findOneAndUpdate(
      { category, month },
      { category, amount, month },
      { new: true, upsert: true }
    );

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    
    let query = {};
    if (month) {
      query = { month };
    }
    
    const budgets = await Budget.find(query);
    
    return NextResponse.json(budgets);
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
      return NextResponse.json({ message: "Missing budget ID" }, { status: 400 });
    }

    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) {
      return NextResponse.json({ message: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}