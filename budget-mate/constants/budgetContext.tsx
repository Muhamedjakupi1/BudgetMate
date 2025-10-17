import React, { createContext, useContext, useState, ReactNode } from 'react';

type BudgetContextType = {
  balance: number;
  addIncome: (amount: number) => void;
  addExpense: (amount: number) => void;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const BudgetProvider: React.FC<Props> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const addIncome = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const addExpense = (amount: number) => {
    setBalance(prev => prev - amount);
  };

  return (
    <BudgetContext.Provider value={{ balance, addIncome, addExpense }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook për përdorim më të thjeshtë
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
