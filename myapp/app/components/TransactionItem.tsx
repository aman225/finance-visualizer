// components/TransactionItem.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
}

export default function TransactionItem({ transaction, onTransactionUpdated }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(transaction.date.split("T")[0]); // Format date for input

  async function handleUpdate() {
    if (!amount || !description || !date) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          date,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update transaction");
      }

      toast.success("Transaction updated successfully!");
      setIsEditing(false);
      onTransactionUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update transaction");
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast.success("Transaction deleted successfully!");
      onTransactionUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  }

  // If in edit mode, show the edit form
  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdate}>
                <Check className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default view mode
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold">₹ {transaction.amount}</p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}