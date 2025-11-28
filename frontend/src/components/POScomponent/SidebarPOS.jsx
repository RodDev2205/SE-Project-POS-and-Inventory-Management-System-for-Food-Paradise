import React from 'react';
import { Grid3x3, LineChart, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activePage, setActivePage }) {

    const navigate = useNavigate();

    const navItems = [
        { icon: Grid3x3, label: 'POS', path: '/pos' },
        { icon: LineChart, label: 'Records', path: '/records' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: LogOut, label: 'Logout', path: '/' },
    ];

    const handleNavigation = (item) => {
        // Update active content inside POS
        setActivePage(item.label);

        // Logout clears local/session storage
        if (item.label === "Logout") {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
        }

        navigate(item.path);
    };

    return (
        <div className="w-48 bg-white text-green-600 h-screen p-3 space-y-2">
            {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activePage === item.label;

                return (
                    <div
                        key={idx}
                        className={`rounded-lg p-4 flex items-center gap-3 cursor-pointer ${
                            isActive
                                ? 'bg-green-100 text-green-600'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => handleNavigation(item)}
                    >
                        <Icon size={24} />
                        <span className="font-semibold">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
