"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

export default function MonthlyExpensesChart({ refresh }: { refresh: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Verify that data is an array before setting state
        if (Array.isArray(data)) {
          setTransactions(data);
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
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Monthly Expenses</h2>
        <Skeleton className="h-72 rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-semibold mb-4 text-center">Monthly Expenses</h2>
        <p className="text-red-500 text-center">Error: {error}</p>
      </div>
    );
  }

  // Only process if we have data
  if (!transactions.length) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Monthly Expenses</h2>
        <p className="text-center text-gray-500">No data available to display chart.</p>
      </div>
    );
  }

  const monthlyData = transactions.reduce((acc: { [key: string]: number }, tx) => {
    const month = format(new Date(tx.date), "MMM yyyy"); // eg: Apr 2025
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});

  const chartData = Object.keys(monthlyData).map((month) => ({
    month,
    total: monthlyData[month],
  }));

  // Sort by month chronologically
  chartData.sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">Monthly Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}