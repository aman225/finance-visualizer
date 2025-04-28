"use client";

import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";
import PieChart from "./CategoryPieChart";
import Dashboard from "./Dashboard";
import BudgetComparisonChart from "./BudgetComparisonChart";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBudgetSaved() {
    triggerRefresh();
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Personal Finance Tracker</h1>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <TransactionForm
          onTransactionAdded={triggerRefresh}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
        />
        <BudgetForm onBudgetSaved={handleBudgetSaved} />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard refresh={refreshFlag} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList refresh={refreshFlag} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid md:grid-cols-2 gap-8">
            <MonthlyExpensesChart refresh={refreshFlag} />
            <PieChart refresh={refreshFlag} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Budget Comparison and List Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <BudgetComparisonChart refresh={refreshFlag} />
        <BudgetList refresh={refreshFlag} />
      </div>
    </div>
  );
}
