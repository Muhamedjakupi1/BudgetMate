
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
const EXTERNAL_API_URL = "https://fakestoreapi.com/products?limit=5";
export const generateRandomTransactions = async (): Promise<Transaction[]> => {
  const paymentOptions = ["Cash", "Card"];
  try {
    const response = await fetch(EXTERNAL_API_URL);
    if (!response.ok) throw new Error(`Gabim ne API! Statusi: ${response.status}`);
    const externalData: any[] = await response.json();
    const transformedTransactions: Transaction[] = externalData.map((data, index) => {
      const amount = Math.floor(Math.random() * 100) + 1;
      const paymentType = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
      return {
        id: nanoid(),
        type: "expense",
        amount,
        category: "Shopping",  
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
    console.error("An error occurred while trying to get the random transactions:", error);
    return [];
  }
};
