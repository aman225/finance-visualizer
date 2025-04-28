"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryById } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";

interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string;
}

interface Transaction {
  _id: string;
  amount: number;
  category?: string;
  date: string;
}

interface BudgetListProps {
  refresh: boolean;
}

export default function BudgetList({ refresh }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Get current and recent months for the dropdown
  useEffect(() => {
    const months = [];
    const now = new Date();
    
    for (let i = -2; i < 6; i++) { // Show past 2 months and next 5
      const date = new Date(now.getFullYear(), now.getMonth() + i);
      months.push(format(date, "yyyy-MM"));
    }
    
    setAvailableMonths(months);
    
    // Default to current month
    const currentMonth = format(now, "yyyy-MM");
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch budgets
  useEffect(() => {
    if (!selectedMonth) return;
    
    async function fetchBudgets() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/budgets?month=${selectedMonth}`);
        
        if (!res.ok) {
          throw new Error(`Error fetching budgets: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setBudgets(data);
        } else {
          console.error("API did not return an array:", data);
          setError("Unexpected data format received from server");
          setBudgets([]);
        }
      } catch (err) {
        console.error("Failed to fetch budgets", err);
        setError(err instanceof Error ? err.message : "Failed to fetch budgets");
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, [selectedMonth, refresh]);

  // Fetch transactions for the selected month
  useEffect(() => {
    if (!selectedMonth) return;
    
    async function fetchTransactions() {
      try {
        setLoading(true);
        const res = await fetch("/api/transactions");
        
        if (!res.ok) {
          throw new Error(`Error fetching transactions: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Filter transactions for the selected month
          const filteredTransactions = data.filter(tx => {
            const txMonth = format(new Date(tx.date), "yyyy-MM");
            return txMonth === selectedMonth;
          });
          
          setTransactions(filteredTransactions);
        } else {
          console.error("API did not return an array:", data);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [selectedMonth, refresh]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete budget");
      }

      setBudgets(budgets.filter(budget => budget._id !== id));
      toast.success("Budget deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete budget");
    }
  }

  // Calculate spending per category
  const categorySpending = transactions.reduce((acc: Record<string, number>, tx) => {
    const category = tx.category || "other";
    if (!acc[category]) acc[category] = 0;
    acc[category] += Math.abs(tx.amount);
    return acc;
  }, {});

  if (loading && !budgets.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Monthly Budgets</CardTitle>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
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
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {budgets.length === 0 ? (
          <p className="text-center text-muted-foreground">No budgets set for {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}.</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const category = getCategoryById(budget.category);
              const spent = categorySpending[budget.category] || 0;
              const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
              const isOverBudget = spent > budget.amount;
              
              return (
                <div key={budget._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ₹{spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                        </div>
                        <div className={`text-xs ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                          {isOverBudget ? `₹${(spent - budget.amount).toFixed(2)} over budget` : `₹${(budget.amount - spent).toFixed(2)} remaining`}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(budget._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={isOverBudget ? "bg-red-200" : ""}             
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}