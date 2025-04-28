"use client";

import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";
import PieChart from "./CategoryPieChart";
import Dashboard from "./Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export default function TransactionPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  function triggerRefresh() {
    setRefreshFlag(!refreshFlag); // toggling triggers re-fetch
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Personal Finance Tracker</h1>
      
      <TransactionForm 
        onTransactionAdded={triggerRefresh} 
        editingTransaction={editingTransaction}
        setEditingTransaction={setEditingTransaction}
      />
      
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Dashboard refresh={refreshFlag} onEdit={handleEdit} />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionList 
            refresh={refreshFlag}
            onEdit={handleEdit}
          />
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-8">
          <MonthlyExpensesChart refresh={refreshFlag} />
          <PieChart refresh={refreshFlag} />
        </TabsContent>
      </Tabs>
    </div>
  );
}