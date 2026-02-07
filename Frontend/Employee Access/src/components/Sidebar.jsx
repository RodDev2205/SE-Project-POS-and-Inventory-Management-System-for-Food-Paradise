import React, { useState } from 'react';
import { ShoppingCart, FileText, Settings, LogOut, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function Sidebar ({ isOpen = true, onClose }) {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) {
            onClose();
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowLogoutConfirm(false);
        navigate('/Login');
    };

    return (
        <div className={`${isOpen ? 'w-60' : 'w-0'} bg-emerald-800 h-screen flex flex-col transition-all duration-300 overflow-hidden`}>
            <div className="bg-emerald-700 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded"></div>
                <img 
                src={logo}
                alt="Logo"
                className="text-white font-bold text-lg" />
            </div>

            <nav className="flex-1 py-4">
                <button onClick={() => handleNavigation('/POS')} className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-emerald-700 transition-colors">
                <ShoppingCart size={18} />
                <span className="font-medium">POS</span>
                </button>

                <button onClick={() => handleNavigation('/LogsandRecords')} className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-emerald-700 transition-colors">
                <FileText size={18} />
                <span className="font-medium">Logs and Records</span>
                </button>

                <button onClick={() => handleNavigation('/Settings')} className="w-full flex items-center gap-3 px-6 py-3 text-white hover:bg-emerald-700 transition-colors">
                <Settings size={18} />
                <span className="font-medium">Settings</span>
                </button>
            </nav>

            <div className="border-t border-emerald-700">
                <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-6 py-4 text-white hover:bg-emerald-700 transition-colors">
                    <LogOut size={18} />
                    <span className="font-medium">LogOut</span>
                </button>
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-opacity-40 backdrop-brightness-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
                        <h2 className="text-lg font-bold mb-2">Confirm Logout</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`flex-1 py-2 rounded font-semibold flex items-center justify-center gap-2 ${
                                    isLoggingOut 
                                        ? 'bg-emerald-600 text-white cursor-not-allowed opacity-75' 
                                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                }`}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        <span>Logging out...</span>
                                    </>
                                ) : (
                                    'Logout'
                                )}
                            </button>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                disabled={isLoggingOut}
                                className={`flex-1 py-4 border border-gray-300 rounded font-semibold ${
                                    isLoggingOut
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}