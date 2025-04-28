"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionList from "./TransactionList";
import SpendingInsights from "./SpendingInsights";
import { getCategoryById } from "@/lib/categories";
import { ArrowDown, ArrowUp, DollarSign, PieChart } from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

interface CategoryTotal {
  categoryId: string;
  total: number;
}

export default function Dashboard({ refresh, onEdit }: { refresh: boolean; onEdit: (transaction: Transaction) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [topCategories, setTopCategories] = useState<CategoryTotal[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/transactions");
        
        if (!res.ok) {
          throw new Error(`Error fetching transactions: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setTransactions(data);
          
          // Calculate totals
          const expenses = data
            .filter(tx => tx.amount < 0)
            .reduce((total, tx) => total + Math.abs(tx.amount), 0);
          
          const income = data
            .filter(tx => tx.amount > 0)
            .reduce((total, tx) => total + tx.amount, 0);
          
          setTotalExpenses(expenses);
          setTotalIncome(income);
          
          // Calculate category totals
          const categoryTotals: Record<string, number> = {};
          data.forEach(tx => {
            const categoryId = tx.category || "other";
            if (!categoryTotals[categoryId]) {
              categoryTotals[categoryId] = 0;
            }
            categoryTotals[categoryId] += Math.abs(tx.amount);
          });
          
          // Convert to array and sort by total
          const sortedCategories = Object.entries(categoryTotals)
            .map(([categoryId, total]) => ({ categoryId, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3); // Top 3 categories
          
          setTopCategories(sortedCategories);
        } else {
          console.error("API did not return an array:", data);
          setError("Unexpected data format received from server");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        setError(err instanceof Error ? err.message : "Failed to fetch transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [refresh]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-500 text-center">Error: {error}</p>
      </div>
    );
  }

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Spending Insights Component */}
      <SpendingInsights refresh={refresh} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time expenses
            </p>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time income
            </p>
          </CardContent>
        </Card>

        {/* Net Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹ {netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map((category) => {
                const categoryInfo = getCategoryById(category.categoryId);
                return (
                  <div key={category.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: categoryInfo.color }}
                      ></div>
                      <span>{categoryInfo.name}</span>
                    </div>
                    <span className="font-medium">₹ {category.total.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No category data available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList 
            refresh={refresh}
            onEdit={onEdit}
            limit={5} // Show only 5 recent transactions
          />
        </CardContent>
      </Card>
    </div>
  );
}