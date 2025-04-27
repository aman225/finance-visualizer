"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

export default function MonthlyExpensesChart({ refresh }: { refresh: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    }

    fetchTransactions();
  }, [refresh]);

  const monthlyData = transactions.reduce((acc: { [key: string]: number }, tx) => {
    const month = format(new Date(tx.date), "MMM yyyy"); // eg: Apr 2025
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});

  const chartData = Object.keys(monthlyData).map((month) => ({
    month,
    total: monthlyData[month],
  }));

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">Monthly Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
