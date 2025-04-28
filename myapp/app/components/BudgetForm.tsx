"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/categories";
import { format } from "date-fns";

interface Budget {
  _id?: string;
  category: string;
  amount: number;
  month: string;
}

interface BudgetFormProps {
  onBudgetSaved: () => void;
}

export default function BudgetForm({ onBudgetSaved }: BudgetFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  // Get current and next 6 months for the dropdown
  useEffect(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i);
      months.push(format(date, "yyyy-MM"));
    }
    
    setAvailableMonths(months);
    
    // Default to current month
    setMonth(format(now, "yyyy-MM"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!category || !amount || !month) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          month,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save budget");
      }

      toast.success("Budget saved successfully!");
      setCategory("");
      setAmount("");
      onBudgetSaved();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      toast.error("Failed to save budget");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto p-4">
      <CardContent>
        <h2 className="text-lg font-semibold mb-4 text-center">Set Monthly Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            placeholder="Budget Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={error && !amount ? "true" : "false"}
          />
          
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {format(new Date(m + "-01"), "MMMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !category || !amount || !month}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              "Set Budget"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}