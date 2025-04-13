import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  editingExpense: null,
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    fetchExpensesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchExpensesSuccess: (state, action) => {
      state.expenses = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchExpensesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addExpenseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addExpenseSuccess: (state, action) => {
      state.expenses = [action.payload, ...state.expenses];
      state.loading = false;
      state.error = null;
    },
    addExpenseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateExpenseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateExpenseSuccess: (state, action) => {
      state.expenses = state.expenses.map((expense) =>
        expense.id === action.payload.id ? action.payload : expense
      );
      state.loading = false;
      state.error = null;
      state.editingExpense = null;
    },
    updateExpenseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteExpenseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteExpenseSuccess: (state, action) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    deleteExpenseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setEditingExpense: (state, action) => {
      state.editingExpense = action.payload;
    },
    clearEditingExpense: (state) => {
      state.editingExpense = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchExpensesStart,
  fetchExpensesSuccess,
  fetchExpensesFailure,
  addExpenseStart,
  addExpenseSuccess,
  addExpenseFailure,
  updateExpenseStart,
  updateExpenseSuccess,
  updateExpenseFailure,
  deleteExpenseStart,
  deleteExpenseSuccess,
  deleteExpenseFailure,
  setEditingExpense,
  clearEditingExpense,
  clearError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
