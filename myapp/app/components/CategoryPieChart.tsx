"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categories } from "@/lib/categories";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export default function CategoryPieChart({ refresh }: { refresh: boolean }) {
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
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-center">Spending by Category</h2>
          <Skeleton className="h-72 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-center">Spending by Category</h2>
          <p className="text-red-500 text-center">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Process data for pie chart
  const categoryData = transactions.reduce((acc: Record<string, number>, tx) => {
    const categoryId = tx.category || "other";
    const amount = Math.abs(tx.amount); // Using absolute value for pie chart
    
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    
    acc[categoryId] += amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryData).map(categoryId => {
    const category = categories.find(c => c.id === categoryId) || 
                     { id: categoryId, name: categoryId, color: "#6b7280" };
    
    return {
      name: category.name,
      value: categoryData[categoryId],
      color: category.color
    };
  }).filter(item => item.value > 0); // Only include categories with spending

  if (!pieData.length) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-center">Spending by Category</h2>
          <p className="text-center text-gray-500">No data available for categories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Spending by Category</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${value}`}
                labelFormatter={(label) => label}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}