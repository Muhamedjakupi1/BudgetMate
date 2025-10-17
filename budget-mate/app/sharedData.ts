export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  note?: string;
  paymentType?: string;
  payeeName?: string;
  date?: string;
};

export let transactions: Transaction[] = [];
export let doneExpenses: Transaction[] = [];
export let totalBudget = 0;

export const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
  const newTransaction = { ...transaction, id: Date.now().toString() };
  transactions.push(newTransaction);

  if (newTransaction.type === 'income') {
    totalBudget += newTransaction.amount;
  }
};

export const deleteTransaction = (id: string) => {
  transactions = transactions.filter(t => t.id !== id);
};

export const markAsDone = (id: string) => {
  const transaction = transactions.find(t => t.id === id);
  if (transaction && transaction.type === 'expense') {
    doneExpenses.push(transaction);
    totalBudget -= transaction.amount;
  }
  transactions = transactions.filter(t => t.id !== id);
};

export const getTransactions = () => transactions;
export const getDoneExpenses = () => doneExpenses;
export const getBudget = () => totalBudget;
