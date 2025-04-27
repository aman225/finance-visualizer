"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

interface TransactionListProps {
  refresh: boolean;
  onEdit: (transaction: Transaction) => void;
}

export default function TransactionList({ refresh, onEdit }: TransactionListProps) {
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

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete transaction");
      }

      // Remove from local state
      setTransactions(transactions.filter(tx => tx._id !== id));
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-500 text-center">Error: {error}</p>
        <Button 
          className="mt-2 mx-auto block" 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!transactions.length) {
    return <p className="text-center mt-8">No transactions found.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 space-y-4">
      <h2 className="text-lg font-semibold mb-4 text-center">Recent Transactions</h2>
      {transactions.map((tx) => (
        <motion.div
          key={tx._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{tx.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold mr-4">₹ {tx.amount}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(tx)}
                    title="Edit transaction"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(tx._id)}
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}