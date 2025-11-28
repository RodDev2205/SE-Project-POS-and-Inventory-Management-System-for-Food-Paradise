// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PaswordInput";

export default function Login() {
  const navigate = useNavigate();

  // local states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();

    // Example validation
    if (password.length < 3) {
      setPasswordError("Password must be at least 3 characters long.");
      return;
    }

    setPasswordError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (username === "admin" && password === "admin123") {
        navigate("/owner"); // Admin Dashboard
      } else if (username === "cashier" && password === "cashier123") {
        navigate("/pos"); // Cashier POS
      } else {
        alert("Invalid credentials!");
      }
    }, 1000);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-green-600 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg p-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-black mb-2 text-center">
          Food Paradise Login
        </h1>

        <p className="text-gray-700 text-sm mb-6 text-center">
          Hello there! Please enter your username <br />
          and password to login.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-left font-semibold text-gray-800 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-200 rounded px-4 py-3 focus:outline-none"
              required
            />
          </div>

          {/* Reusable Password Input */}
          <PasswordInput
            label="Passkey"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full flex justify-center items-center bg-green-600 hover:bg-green-700 
            text-white font-bold py-3 rounded-full transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
