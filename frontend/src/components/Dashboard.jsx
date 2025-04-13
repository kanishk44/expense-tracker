import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { getAuth } from "firebase/auth";
import ExpenseForm from "./ExpenseForm";
import PremiumButton from "./PremiumButton";
import ThemeToggle from "./ThemeToggle";
import DownloadButton from "./DownloadButton";

export default function Dashboard() {
  const [error, setError] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();
  const expenses = useSelector((state) => state.expenses.expenses);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const isPremium = useSelector((state) => state.auth.isPremium);

  useEffect(() => {
    // Calculate total expenses
    const total = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );
    setTotalExpenses(total);
  }, [expenses]);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  async function handleLogout() {
    try {
      setError("");
      await auth.signOut();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      setError("Failed to log out");
    }
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
    >
      {/* Navigation */}
      <nav className={`${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Expense Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Welcome, {auth.currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow px-5 py-6 sm:px-6`}
        >
          <ExpenseForm />
        </div>

        {/* Show Premium Button if total expenses exceed 10,000 */}
        {totalExpenses > 10000 && !isPremium && <PremiumButton />}

        {/* Show Premium Features only when premium is activated */}
        {isPremium && (
          <>
            <ThemeToggle />
            <DownloadButton />
          </>
        )}
      </main>
    </div>
  );
}
