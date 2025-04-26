// models/Transaction.ts
import mongoose, { Schema, Document } from "mongoose";

// Define the structure of a Transaction document
export interface ITransaction extends Document {
  amount: number;
  description: string;
  date: Date;
}

// Create the schema
const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt timestamps automatically
  }
);

// Export model safely (avoid recompiling during hot-reload)
export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
