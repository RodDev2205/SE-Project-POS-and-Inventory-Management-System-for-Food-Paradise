import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function CategoryTabs({ onCategoryChange, onSearchChange }) {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const tabs = ['All', 'Meals', 'Drinks', 'Sides'];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (onCategoryChange) {
            onCategoryChange(tab);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    return (
        <div className="px-4 mb-4">
            <div className="bg-white py-2 px-4 rounded shadow-sm flex gap-4 items-center">
                
                {tabs.map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-4 py-2 rounded shadow ${
                            activeTab === tab 
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-gray-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}

                <div className="relative ml-3 w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full h-9 pl-9 pr-3 bg-white rounded shadow outline-none"
                    />
                </div>

            </div>
        </div>
    );
}