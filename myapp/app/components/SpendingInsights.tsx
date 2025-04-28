"use client";

import { useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { getCategoryById } from "@/lib/categories";

interface Transaction {
  _id: string;
  amount: number;
  category?: string;
  date: string;
}

interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string;
}

interface SpendingInsightsProps {
  refresh: boolean;
}

export default function SpendingInsights({ refresh }: SpendingInsightsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<{
    monthlyChange: number;
    topIncreaseCategory: { name: string; amount: number } | null;
    topDecreaseCategory: { name: string; amount: number } | null;
    mostOverBudget: { name: string; amount: number; percentage: number } | null;
    biggestExpense: { name: string; amount: number; percentage: number } | null;
  }>({
    monthlyChange: 0,
    topIncreaseCategory: null,
    topDecreaseCategory: null,
    mostOverBudget: null,
    biggestExpense: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch transactions
        const transactionsRes = await fetch("/api/transactions");
        if (!transactionsRes.ok) {
          throw new Error(`Error fetching transactions: ${transactionsRes.status}`);
        }
        const transactionsData = await transactionsRes.json();
        
        // Fetch current month budgets
        const currentMonth = format(new Date(), "yyyy-MM");
        const budgetsRes = await fetch(`/api/budgets?month=${currentMonth}`);
        if (!budgetsRes.ok) {
          throw new Error(`Error fetching budgets: ${budgetsRes.status}`);
        }
        const budgetsData = await budgetsRes.json();
        
        if (Array.isArray(transactionsData) && Array.isArray(budgetsData)) {
          setTransactions(transactionsData);
          setBudgets(budgetsData);
          generateInsights(transactionsData, budgetsData);
        } else {
          console.error("API did not return arrays", { transactionsData, budgetsData });
          setError("Unexpected data format received from server");
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refresh]);

  function generateInsights(transactions: Transaction[], budgets: Budget[]) {
    const now = new Date();
    const currentMonth = format(now, "yyyy-MM");
    
    // Calculate date ranges
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    // Filter transactions by month
    const currentMonthTransactions = transactions.filter(tx => 
      isWithinInterval(new Date(tx.date), { start: currentMonthStart, end: currentMonthEnd })
    );
    
    const lastMonthTransactions = transactions.filter(tx => 
      isWithinInterval(new Date(tx.date), { start: lastMonthStart, end: lastMonthEnd })
    );
    
    // Calculate total spending by month
    const currentMonthTotal = currentMonthTransactions.reduce((sum, tx) => 
      sum + Math.abs(tx.amount < 0 ? tx.amount : 0), 0);
    
    const lastMonthTotal = lastMonthTransactions.reduce((sum, tx) => 
      sum + Math.abs(tx.amount < 0 ? tx.amount : 0), 0);
    
    // Calculate monthly change percentage
    const monthlyChange = lastMonthTotal === 0 ? 0 : 
      ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    
    // Calculate spending by category for current and last month
    const currentMonthByCategory = currentMonthTransactions.reduce((acc: Record<string, number>, tx) => {
      const category = tx.category || "other";
      if (!acc[category]) acc[category] = 0;
      acc[category] += Math.abs(tx.amount < 0 ? tx.amount : 0);
      return acc;
    }, {});
    
    const lastMonthByCategory = lastMonthTransactions.reduce((acc: Record<string, number>, tx) => {
      const category = tx.category || "other";
      if (!acc[category]) acc[category] = 0;
      acc[category] += Math.abs(tx.amount < 0 ? tx.amount : 0);
      return acc;
    }, {});
    
    // Find categories with biggest increase/decrease
    let maxIncrease = -Infinity;
    let maxDecrease = Infinity;
    let topIncreaseCategory = null;
    let topDecreaseCategory = null;
    
    Object.keys({ ...currentMonthByCategory, ...lastMonthByCategory }).forEach(category => {
      const current = currentMonthByCategory[category] || 0;
      const last = lastMonthByCategory[category] || 0;
      const change = current - last;
      
      if (change > maxIncrease && last > 0) {
        maxIncrease = change;
        topIncreaseCategory = { name: category, amount: change };
      }
      
      if (change < maxDecrease && current > 0) {
        maxDecrease = change;
        topDecreaseCategory = { name: category, amount: Math.abs(change) };
      }
    });
    
    // Find category most over budget
    let maxOverBudget = -Infinity;
    let mostOverBudgetCategory = null;
    
    budgets.forEach(budget => {
      const spent = currentMonthByCategory[budget.category] || 0;
      const overAmount = spent - budget.amount;
      const percentage = budget.amount > 0 ? (overAmount / budget.amount) * 100 : 0;
      
      if (overAmount > 0 && percentage > maxOverBudget) {
        maxOverBudget = percentage;
        mostOverBudgetCategory = { 
          name: budget.category, 
          amount: overAmount,
          percentage: percentage
        };
      }
    });
    
    // Find biggest expense category
    let maxExpense = -Infinity;
    let biggestExpenseCategory = null;
    
    Object.entries(currentMonthByCategory).forEach(([category, amount]) => {
      if (amount > maxExpense) {
        maxExpense = amount;
        biggestExpenseCategory = { 
          name: category, 
          amount: amount,
          percentage: currentMonthTotal > 0 ? (amount / currentMonthTotal) * 100 : 0
        };
      }
    });
    
    setInsights({
      monthlyChange,
      topIncreaseCategory,
      topDecreaseCategory,
      mostOverBudget: mostOverBudgetCategory,
      biggestExpense: biggestExpenseCategory
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatCategoryName(categoryId: string): string {
    const category = getCategoryById(categoryId);
    return category?.name || categoryId;
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center pt-6">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <p>Failed to load insights: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {insights.monthlyChange > 0 ? (
              <ArrowUp className="mr-2 h-4 w-4 text-destructive" />
            ) : insights.monthlyChange < 0 ? (
              <ArrowDown className="mr-2 h-4 w-4 text-primary" />
            ) : (
              <span className="mr-2 h-4 w-4" />
            )}
            <span className={`text-2xl font-bold ${
              insights.monthlyChange > 0 ? 'text-destructive' : 
              insights.monthlyChange < 0 ? 'text-primary' : ''
            }`}>
              {Math.abs(insights.monthlyChange).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {insights.monthlyChange > 0 
              ? "Spending increased compared to last month" 
              : insights.monthlyChange < 0
              ? "Spending decreased compared to last month"
              : "Spending unchanged from last month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {insights.topIncreaseCategory ? "Biggest Increase" : "No Increases"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.topIncreaseCategory ? (
            <>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold">
                  {formatCurrency(insights.topIncreaseCategory.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCategoryName(insights.topIncreaseCategory.name)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No categories with spending increases
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {insights.topDecreaseCategory ? "Biggest Decrease" : "No Decreases"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.topDecreaseCategory ? (
            <>
              <div className="flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {formatCurrency(insights.topDecreaseCategory.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCategoryName(insights.topDecreaseCategory.name)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No categories with spending decreases
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {insights.mostOverBudget ? "Most Over Budget" : "Budget On Track"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.mostOverBudget ? (
            <>
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold">
                  {formatCurrency(insights.mostOverBudget.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCategoryName(insights.mostOverBudget.name)} 
                ({insights.mostOverBudget.percentage.toFixed(0)}% over)
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              All categories within budget
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}