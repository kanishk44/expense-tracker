import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import ExpenseForm from "../ExpenseForm";
import authReducer from "../../store/slices/authSlice";
import expensesReducer from "../../store/slices/expensesSlice";
import themeReducer from "../../store/slices/themeSlice";

// Create a test store
const createTestStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      expenses: expensesReducer,
      theme: themeReducer,
    },
    preloadedState: initialState,
  });
};

describe("ExpenseForm Component", () => {
  it("renders expense form fields", () => {
    const store = createTestStore({
      auth: { user: { uid: "test-uid" }, isPremium: false },
      expenses: { expenses: [] },
      theme: { isDarkMode: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ExpenseForm />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/category/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/date/i)).toBeInTheDocument();
  });
});
