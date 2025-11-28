import React, { useState } from 'react';

export default function ResetPasswordModal({ cashier, onClose, onSave }) {
    const [password, setPassword] = useState(cashier.password || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...cashier, password });
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg w-96">
                <h3 className="text-xl font-bold mb-4">Reset Password</h3>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg">Update Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
