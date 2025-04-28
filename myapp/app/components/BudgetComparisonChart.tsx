"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryById } from "@/lib/categories";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface BudgetComparisonChartProps {
  refresh: boolean;
}

export default function BudgetComparisonChart({ refresh }: BudgetComparisonChartProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

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

  // Fetch budgets and transactions
  useEffect(() => {
    if (!selectedMonth) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch budgets
        const budgetsRes = await fetch(`/api/budgets?month=${selectedMonth}`);
        if (!budgetsRes.ok) {
          throw new Error(`Error fetching budgets: ${budgetsRes.status}`);
        }
        const budgetsData = await budgetsRes.json();
        
        // Fetch transactions
        const transactionsRes = await fetch("/api/transactions");
        if (!transactionsRes.ok) {
          throw new Error(`Error fetching transactions: ${transactionsRes.status}`);
        }
        const transactionsData = await transactionsRes.json();
        
        if (Array.isArray(budgetsData) && Array.isArray(transactionsData)) {
          setBudgets(budgetsData);
          
          // Filter transactions for the selected month
          const filteredTransactions = transactionsData.filter(tx => {
            const txMonth = format(new Date(tx.date), "yyyy-MM");
            return txMonth === selectedMonth;
          });
          
          setTransactions(filteredTransactions);
          
          // Prepare chart data
          prepareChartData(budgetsData, filteredTransactions);
        } else {
          console.error("API did not return arrays:", { budgetsData, transactionsData });
          setError("Unexpected data format received from server");
          setBudgets([]);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setBudgets([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth, refresh]);

  function prepareChartData(budgets: Budget[], transactions: Transaction[]) {
    // Calculate spending per category
    const categorySpending = transactions.reduce((acc: Record<string, number>, tx) => {
      const category = tx.category || "other";
      if (!acc[category]) acc[category] = 0;
      acc[category] += Math.abs(tx.amount);
      return acc;
    }, {});
    
    // Combine budget and actual spending data
    const data = budgets.map(budget => {
      const category = getCategoryById(budget.category);
      return {
        name: category.name,
        Budget: budget.amount,
        Actual: categorySpending[budget.category] || 0,
        color: category.color
      };
    });
    
    // Add categories that have transactions but no budget
    Object.entries(categorySpending).forEach(([categoryId, amount]) => {
      const exists = budgets.some(budget => budget.category === categoryId);
      if (!exists) {
        const category = getCategoryById(categoryId);
        data.push({
          name: category.name,
          Budget: 0,
          Actual: amount,
          color: category.color
        });
      }
    });
    
    setChartData(data);
  }

  if (loading && !chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Budget vs Actual</CardTitle>
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
        
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground">No budget data available for {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="Budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="Actual" fill="#82ca9d" name="Actual Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}