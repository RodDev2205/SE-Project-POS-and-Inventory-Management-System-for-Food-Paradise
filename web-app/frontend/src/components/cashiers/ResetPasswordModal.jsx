import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordModal({ cashier, onClose, onSave }) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(cashier.id, password); // send cashierId and new password
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white bg-opacity-50 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg w-96 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-4">Reset Password</h3>

                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 pr-12 border rounded-lg bg-white/40 backdrop-blur-sm"
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
