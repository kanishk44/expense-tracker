import { useState } from "react";
import { useDispatch } from "react-redux";
import { togglePremium } from "../store/slices/authSlice";

export default function PremiumButton() {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(togglePremium())}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center space-x-2">
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1V8a1 1 0 011-1zm7-5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>Activate Premium</span>
      </div>
      {isHovered && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white text-gray-800 p-3 rounded-lg shadow-lg text-sm">
          Unlock premium features like:
          <ul className="list-disc list-inside mt-1">
            <li>Dark Mode</li>
            <li>Export to CSV</li>
            <li>Advanced analytics</li>
            <li>Custom categories</li>
          </ul>
        </div>
      )}
    </button>
  );
}
