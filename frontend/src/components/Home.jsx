import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, sendEmailVerification } from "firebase/auth";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      // Fetch user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };

      fetchUserData();
    }
  }, [currentUser, navigate, db]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      setVerificationError("");
    } catch (error) {
      setVerificationError(
        "Failed to send verification email. Please try again later."
      );
      console.error("Error sending verification:", error);
    }
  };

  const isProfileIncomplete = !userData?.fullName || !userData?.photoURL;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <div className="flex items-center space-x-4">
            {!isProfileIncomplete && (
              <>
                {userData?.photoURL && (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <button
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Status */}
        {currentUser && !currentUser.emailVerified && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Email Verification Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Please verify your email address to access all features.
                  </p>
                  {verificationError && (
                    <p className="text-red-600 mt-1">{verificationError}</p>
                  )}
                  {verificationSent ? (
                    <p className="text-green-600 mt-1">
                      Verification email sent! Please check your inbox.
                    </p>
                  ) : (
                    <button
                      onClick={handleSendVerification}
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Send Verification Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Verified Success Message */}
        {currentUser?.emailVerified && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Thank you, your email has been verified!
                </p>
              </div>
            </div>
          </div>
        )}

        {isProfileIncomplete ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Profile Incomplete
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please complete your profile to get the best experience.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/profile")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome, {userData?.fullName}!
            </h2>
            <p className="text-gray-600">
              Start managing your expenses efficiently!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
