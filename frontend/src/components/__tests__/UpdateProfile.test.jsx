import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import UpdateProfile from "../UpdateProfile";
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

describe("UpdateProfile Component", () => {
  it("renders update profile form", () => {
    const store = createTestStore({
      auth: {
        user: { email: "test@example.com", displayName: "Test User" },
        isPremium: false,
      },
      theme: { isDarkMode: false },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <UpdateProfile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/update profile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/display name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
