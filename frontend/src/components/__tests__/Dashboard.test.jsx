import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
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

describe("Dashboard Component", () => {
  it("renders dashboard with user email", () => {
    const store = createTestStore({
      auth: { user: { email: "test@example.com" }, isPremium: false },
      expenses: { expenses: [] },
      theme: { isDarkMode: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/welcome, test@example.com/i)).toBeInTheDocument();
  });
});
