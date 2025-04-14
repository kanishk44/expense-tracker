import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";
import authReducer from "../../store/slices/authSlice";
import themeReducer from "../../store/slices/themeSlice";

// Create a test store
const createTestStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
    },
    preloadedState: initialState,
  });
};

describe("Login Component", () => {
  it("renders login form title", () => {
    const store = createTestStore({
      auth: { user: null, loading: false, error: null },
      theme: { isDarkMode: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
  });
});
