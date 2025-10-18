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
  addTransaction: (t: Transaction) => void;
  markAsDone: (id: string) => void;
  deleteTransaction: (id: string) => void;
};

const BudgetContext = createContext<BudgetContextType>({} as BudgetContextType);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [doneExpenses, setDoneExpenses] = useState<Transaction[]>([]);

  const balance = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
                - doneExpenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <BudgetContext.Provider
      value={{
        balance,
        transactions,
        doneExpenses,
        addTransaction: t => setTransactions(prev => [...prev, { ...t, id: Date.now().toString(), done: false }]),
        markAsDone: id => {
          const txn = transactions.find(t => t.id === id);
          if (!txn) return;
          setTransactions(prev => prev.filter(t => t.id !== id));
          setDoneExpenses(prev => [...prev, { ...txn, done: true }]);
        },
        deleteTransaction: id => setTransactions(prev => prev.filter(t => t.id !== id))
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
