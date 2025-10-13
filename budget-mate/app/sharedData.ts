export let doneExpenses: any[] = [];

export const addDoneExpense = (expense: any) => {
    doneExpenses.push(expense);
};