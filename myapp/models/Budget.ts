import mongoose, { Schema } from "mongoose";

const BudgetSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String, // Format: "YYYY-MM"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure unique budget per category and month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);