import React, { useState } from 'react';

export default function TopMenu ({ topItems = [] }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Top Menu Items</h2>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {topItems.length > 0 ? (
                        topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800">{item.name}</div>
                                    <div className="text-sm text-gray-500">{item.sold} {item.unit} sold today</div>
                                </div>
                                <div className="w-24 h-8 bg-green-100 rounded flex items-end justify-around px-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-3 bg-green-600 rounded-t" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No menu items available</p>
                    )}
                </div>
            </div>
        </div>
    )
}