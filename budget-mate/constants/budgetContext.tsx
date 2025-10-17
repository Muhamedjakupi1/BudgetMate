import React, { createContext, useContext, useState } from "react";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  note?: string;
  paymentType?: string;
  payeeName?: string;
  date: string;
  done?: boolean;
};

type BudgetContextType = {
  balance: number;
  transactions: Transaction[];
  doneExpenses: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  markAsDone: (id: string) => void;
  deleteTransaction: (id: string) => void;
};

const BudgetContext = createContext<BudgetContextType>({} as BudgetContextType);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [doneExpenses, setDoneExpenses] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  const recalcBalance = (txns: Transaction[], doneTxns: Transaction[]) => {
    const totalIncome = txns.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalDoneExpenses = doneTxns.reduce((sum, t) => sum + t.amount, 0);
    setBalance(totalIncome - totalDoneExpenses);
  };

  const addTransaction = (transaction: Transaction) => {
    const newTxn = { ...transaction, id: Date.now().toString(), done: false };
    const newTransactions = [...transactions, newTxn];
    setTransactions(newTransactions);
    recalcBalance(newTransactions, doneExpenses);
  };

  const markAsDone = (id: string) => {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;
    const newTransactions = transactions.filter(t => t.id !== id);
    const newDoneExpenses = [...doneExpenses, { ...txn, done: true }];
    setTransactions(newTransactions);
    setDoneExpenses(newDoneExpenses);
    recalcBalance(newTransactions, newDoneExpenses);
  };

  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    recalcBalance(newTransactions, doneExpenses);
  };

  return (
    <BudgetContext.Provider
      value={{ balance, transactions, doneExpenses, addTransaction, markAsDone, deleteTransaction }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
