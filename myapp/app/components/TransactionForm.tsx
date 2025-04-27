// components/TransactionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface TransactionFormProps {
  onTransactionAdded: () => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

export default function TransactionForm({ 
  onTransactionAdded, 
  editingTransaction,
  setEditingTransaction 
}: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set form data when editing transaction
  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      // Format date to YYYY-MM-DD for input[type="date"]
      setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
    }
  }, [editingTransaction]);

  function resetForm() {
    setAmount("");
    setDescription("");
    setDate("");
    setEditingTransaction(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !date) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingTransaction) {
        // Update existing transaction
        const res = await fetch("/api/transactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTransaction._id,
            amount: Number(amount),
            description,
            date,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to update transaction");
        }

        toast.success("Transaction updated successfully!");
      } else {
        // Create new transaction
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount), description, date }),
        });

        if (!res.ok) {
          throw new Error("Failed to create transaction");
        }

        toast.success("Transaction added successfully!");
      }

      resetForm();
      onTransactionAdded(); // Trigger refresh in parent component

    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto p-4">
      <CardContent>
        <h2 className="text-lg font-semibold mb-4 text-center">
          {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={error && !amount ? "true" : "false"}
          />
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={error && !description ? "true" : "false"}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={error && !date ? "true" : "false"}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !amount || !description || !date}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingTransaction ? "Updating..." : "Saving..."}
                </div>
              ) : (
                editingTransaction ? "Update Transaction" : "Add Transaction"
              )}
            </Button>
            {editingTransaction && (
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}