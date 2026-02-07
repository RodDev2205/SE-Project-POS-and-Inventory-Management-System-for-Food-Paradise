import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Settings () {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex h-screen bg-gray-100 overflow-auto flex-col flex-1">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
                
                <div className="flex-1 bg-white m-4 rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Settings</h1>
                    <div className="h-full bg-gray-50 rounded"></div>
                </div>
            </div>
        </div>
    )
}