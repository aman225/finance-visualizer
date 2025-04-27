"use client";

import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import MonthlyExpensesChart from "../components/MonthlyExpensesChart";

export default function TransactionPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  function triggerRefresh() {
    setRefreshFlag(!refreshFlag); // toggling triggers re-fetch
  }

  return (
    <div className="p-4">
      <TransactionForm onTransactionAdded={triggerRefresh} />
      <TransactionList refresh={refreshFlag} />
      <MonthlyExpensesChart refresh={refreshFlag} />

    </div>
  );
}
