import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // local states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      navigate("/owner"); // Admin Dashboard
    } 
    else if (username === "cashier" && password === "cashier123") {
      navigate("/pos"); // Cashier POS
    } 
    else {
      alert("Invalid credentials!");
    }
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

          <div>
            <label className="block text-left font-semibold text-gray-800 mb-2">
              Passkey
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-200 rounded px-4 py-3 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
