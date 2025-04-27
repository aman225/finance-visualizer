"use client";

import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
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
      
      <TransactionList 
        refresh={refreshFlag} 
        onEdit={handleEdit}
      />
      
      <MonthlyExpensesChart refresh={refreshFlag} />
    </div>
  );
}