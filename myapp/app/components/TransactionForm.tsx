// components/TransactionForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input"; // shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


export default function TransactionForm({ onTransactionAdded }: { onTransactionAdded: () => void }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !date) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description, date }),
      });

      if (!res.ok) {
        throw new Error("Failed to create transaction");
      }

      setAmount("");
      setDescription("");
      setDate("");
      onTransactionAdded(); // Trigger refresh in parent component

      toast.success("Transaction added successfully!");

    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto p-4">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSuccess("");
            }}
          />
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSuccess("");
            }}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSuccess("");
            }}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !amount || !description || !date}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              "Add Transaction"
            )}
          </Button>

          {success && <p className="text-green-500 text-sm">{success}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
