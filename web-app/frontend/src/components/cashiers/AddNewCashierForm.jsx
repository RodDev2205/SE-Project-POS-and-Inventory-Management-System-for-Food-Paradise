import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function AddNewCashierForm({ onAddCashier }) {
    const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newCashier = {
            id: Date.now(),
            ...formData,
            role: 'Cashier',      // Automatically set role
            status: 'Active',
            lastLogin: 'Never',
        };
        onAddCashier(newCashier);
        setFormData({ full_name: '', username: '', password: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
            <h3 className="text-xl font-bold text-[#1B5E20] mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" /> Register New Cashier Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    type="text" 
                    name="full_name" 
                    placeholder="Full Name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                    required 
                />
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Initial Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                    required 
                />
            </div>

            <button 
                type="submit" 
                className="mt-4 px-6 py-3 bg-[#1B5E20] text-white font-semibold rounded-lg shadow-md hover:bg-[#33691E] transition duration-200"
            >
                Create Cashier Account
            </button>
        </form>
    );
}
