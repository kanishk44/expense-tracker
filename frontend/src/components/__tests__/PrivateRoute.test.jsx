import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";
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

// Mock Dashboard component for testing
const MockDashboard = () => <div>Dashboard Content</div>;

describe("PrivateRoute Component", () => {
  it("renders protected content when user is authenticated", () => {
    const store = createTestStore({
      auth: { user: { email: "test@example.com" }, isPremium: false },
      theme: { isDarkMode: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MockDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/dashboard content/i)).toBeInTheDocument();
  });
});
