// src/components/PasswordInput.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label className="block text-left font-semibold text-gray-800 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full bg-gray-200 rounded px-4 py-3 pr-12 focus:outline-none transition 
            ${error ? "border border-red-500" : ""}`}
          required
        />

        {/* Eye Icon */}
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                     hover:text-gray-700 transition"
        >
          {showPassword ? (
            <EyeOff size={20} className="transition-opacity duration-200" />
          ) : (
            <Eye size={20} className="transition-opacity duration-200" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1 animate-pulse">{error}</p>
      )}
    </div>
  );
}
