import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
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
} from "../store/slices/expensesSlice";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Salary",
  "Other",
];

export default function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { expenses, loading, error, editingExpense } = useSelector(
    (state) => state.expenses
  );
  const { user } = useSelector((state) => state.auth);
  const db = getFirestore();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      dispatch(fetchExpensesStart());

      const expensesRef = collection(db, "expenses");
      const q = query(expensesRef, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const fetchedExpenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount),
      }));

      fetchedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      dispatch(fetchExpensesSuccess(fetchedExpenses));
    } catch (err) {
      dispatch(
        fetchExpensesFailure(
          "Failed to fetch expenses. Please try again later."
        )
      );
      console.error("Error fetching expenses:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    dispatch(clearError());

    try {
      dispatch(addExpenseStart());

      const newExpense = {
        amount: parseFloat(amount),
        description,
        category,
        date: new Date().toISOString(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "expenses"), newExpense);
      const expenseWithId = { ...newExpense, id: docRef.id };

      dispatch(addExpenseSuccess(expenseWithId));

      setAmount("");
      setDescription("");
      setCategory("");
    } catch (err) {
      dispatch(
        addExpenseFailure("Failed to add expense. Please try again later.")
      );
      console.error("Error adding expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      dispatch(clearError());
      dispatch(deleteExpenseStart());

      await deleteDoc(doc(db, "expenses", expenseId));
      dispatch(deleteExpenseSuccess(expenseId));
    } catch (err) {
      dispatch(
        deleteExpenseFailure(
          "Failed to delete expense. Please try again later."
        )
      );
      console.error("Error deleting expense:", err);
    }
  };

  const handleEdit = (expense) => {
    dispatch(setEditingExpense(expense));
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategory(expense.category);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    dispatch(clearError());

    try {
      dispatch(updateExpenseStart());

      const updatedExpense = {
        amount: parseFloat(amount),
        description,
        category,
        date: editingExpense.date,
        userId: user.uid,
      };

      await updateDoc(doc(db, "expenses", editingExpense.id), updatedExpense);
      const expenseWithId = { ...updatedExpense, id: editingExpense.id };

      dispatch(updateExpenseSuccess(expenseWithId));

      setAmount("");
      setDescription("");
      setCategory("");
      dispatch(clearEditingExpense());
    } catch (err) {
      dispatch(
        updateExpenseFailure(
          "Failed to update expense. Please try again later."
        )
      );
      console.error("Error updating expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    dispatch(clearEditingExpense());
    setAmount("");
    setDescription("");
    setCategory("");
  };

  return (
    <div className="space-y-6">
      {/* Expense Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {editingExpense ? "Edit Expense" : "Add New Expense"}
        </h2>
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        <form
          onSubmit={editingExpense ? handleUpdate : handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
                disabled={submitting}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={submitting}
              >
                <option value="">Select a category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter expense description"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {editingExpense && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {editingExpense ? "Updating..." : "Adding..."}
                </div>
              ) : editingExpense ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Expenses List */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Expenses
        </h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No expenses added yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-3 text-right text-sm font-medium text-gray-900"
                  >
                    Total
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    ₹
                    {expenses
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
