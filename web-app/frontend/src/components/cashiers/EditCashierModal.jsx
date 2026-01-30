import React, { useState } from 'react';

export default function EditCashierModal({ cashier, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...cashier });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg w-96">
                <h3 className="text-xl font-bold mb-4">Edit Cashier Details</h3>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
