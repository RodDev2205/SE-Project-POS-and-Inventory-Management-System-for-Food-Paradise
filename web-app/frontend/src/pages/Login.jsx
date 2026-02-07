import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apple, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });

  const showPopup = (message) => {
    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 1500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (password.length < 3) {
      setPasswordError("Password must be at least 3 characters long.");
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5200/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, platform: "web" }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        // If backend sent the specific Deactivated error
        if (data.error === "Deactivated" || response.status === 403) {
          showPopup(data.message || "Your account is deactivated.");
        } else {
          showPopup(data.error || "Invalid credentials!");
        }
        return;
      }

      // Since we filtered status on backend, if we are here, status is "Activate"
      const roleId = Number(data.role_id);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role_id", roleId);

      switch (roleId) {
        case 3:
          navigate("/superadmin");
          break;
        case 2:
          navigate("/admin");
          break;
        case 1:
          navigate("/pos");
          break;
        default:
          showPopup("Unknown role returned by backend.");
      }
    } catch (err) {
      setLoading(false);
      showPopup("Server error. Cannot connect to backend.");
    }
  };

  return (
    <div
      className="
        w-full h-screen flex items-center justify-center 
        bg-green-600 
        px-4 relative overflow-hidden
      "
    >
      {/* Floating unfocused circles */}
      <div className="absolute w-72 h-72 bg-white/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10"></div>

      {popup.show && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl animate-[fadeIn_0.3s]">
            <p className="text-gray-800 font-medium">{popup.message}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="
          w-full max-w-md bg-white/20 border border-white/30 
          backdrop-blur-xl shadow-2xl rounded-3xl p-10 
          text-white animate-[slideUp_0.6s_ease]
        "
      >
        <h1 className="text-5xl font-extrabold text-center mb-2 tracking-tight drop-shadow-lg">
          <span className="text-green-300">Food</span>
          <Apple className="inline-block w-10 h-10 text-red-500 mx-1" />
          <span className="text-white">Paradise</span>
        </h1>

        <p className="text-center text-sm text-white/90 mb-10">
          Sign in to access your system dashboard.
        </p>

        <div className="space-y-7">

          {/* Username Input */}
          <div>
            <label className="block font-semibold mb-2 text-white/90">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl
                bg-white/15 text-white placeholder-white/70
                border border-white/30
                focus:outline-none focus:ring-2 focus:ring-yellow-300
                focus:border-yellow-300 transition
              "
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Input with Eye Toggle */}
          <div>
            <label className="block font-semibold mb-2 text-white/90">Passkey</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-white/15 text-white placeholder-white/70
                  border border-white/30
                  focus:outline-none focus:ring-2 focus:ring-yellow-300
                  focus:border-yellow-300 transition
                "
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2 
                  text-white/80 hover:text-white transition
                "
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="text-red-300 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              mt-2 w-full flex justify-center items-center 
              bg-yellow-300 hover:bg-yellow-200 transition font-bold 
              py-3 rounded-xl shadow-lg text-green-800 tracking-wide 
              hover:shadow-yellow-400/40
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-white/80 text-sm mt-3">
            Powered by <span className="text-yellow-200 font-semibold">Paradise System</span>
          </p>
        </div>
      </form>
    </div>
  );
}
