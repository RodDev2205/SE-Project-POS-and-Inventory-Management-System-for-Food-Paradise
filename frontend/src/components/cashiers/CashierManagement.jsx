import React, { useState } from 'react';
import CashierCard from './CashierCard';
import AddNewCashierForm from './AddNewCashierForm';
import EditCashierModal from './EditCashierModal';
import ResetPasswordModal from './ResetPasswordModal';

const initialCashiers = [
  { id: 1, name: "John Doe", username: "johndoe", role: "Cashier", status: "Active", lastLogin: "2025-11-22 06:00 AM", password: "1234" },
  { id: 2, name: "Jane Smith", username: "janes", role: "Cashier", status: "Active", lastLogin: "2025-11-21 05:30 PM", password: "abcd" },
  { id: 3, name: "Michael Chen", username: "mikec", role: "Cashier", status: "Inactive", lastLogin: "2025-11-18 08:00 AM", password: "pass" },
];

export default function CashierManagement() {
    const [cashiers, setCashiers] = useState(initialCashiers);
    const [editingCashier, setEditingCashier] = useState(null);
    const [resettingCashier, setResettingCashier] = useState(null);

    const handleAddCashier = (newCashier) => setCashiers([...cashiers, newCashier]);
    const handleSaveEdit = (updatedCashier) => {
        setCashiers(cashiers.map(c => c.id === updatedCashier.id ? updatedCashier : c));
        setEditingCashier(null);
    };
    const handleSavePassword = (updatedCashier) => {
        setCashiers(cashiers.map(c => c.id === updatedCashier.id ? updatedCashier : c));
        setResettingCashier(null);
    };
    const handleToggleStatus = (id) => {
        setCashiers(cashiers.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Cashier Account Management</h2>
            <AddNewCashierForm onAddCashier={handleAddCashier} />
            <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">Cashier Roster ({cashiers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cashiers.map(cashier => (
                        <CashierCard 
                            key={cashier.id} 
                            cashier={cashier} 
                            onEdit={setEditingCashier} 
                            onResetPassword={setResettingCashier} 
                            onToggleStatus={handleToggleStatus} 
                        />
                    ))}
                </div>
            </div>
            {editingCashier && <EditCashierModal cashier={editingCashier} onClose={() => setEditingCashier(null)} onSave={handleSaveEdit} />}
            {resettingCashier && <ResetPasswordModal cashier={resettingCashier} onClose={() => setResettingCashier(null)} onSave={handleSavePassword} />}
        </div>
    );
}
