
import { nanoid } from "nanoid";
// Tipi Transaction 
export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  done?: boolean;
  note?: string;
  paymentType?: string;
  payeeName?: string;
  date?: string;
  isExternalApi?: boolean; 
}
// URL e API te jashtme
const EXTERNAL_API_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
export const generateRandomTransactions = async (): Promise<Transaction[]> => {
  const categories = ["Transport", "Food and Drink", "Shopping", "Entertainment", "Home Bills"];
  const paymentOptions = ["Cash", "Card"];
  try {
    const response = await fetch(EXTERNAL_API_URL);
    if (!response.ok) throw new Error(`Gabim ne API! Statusi: ${response.status}`);
    const externalData: any[] = await response.json();
    const transformedTransactions: Transaction[] = externalData.map((data, index) => {
      const amount = Math.floor(Math.random() * 100) + 1;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const paymentType = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
      return {
        id: nanoid(),
        type: "expense",
        amount,
        category,
        done: false,
        date: new Date().toDateString(),
        note: data.title.substring(0, 50),
        paymentType,
        payeeName: `API Payee #${index + 1}`,
        isExternalApi: true,
      };
    });
    return transformedTransactions;
  } catch (error) {
    console.error("Deshtoi marrja e transaksioneve nga API:", error);
    return [];
  }
};
