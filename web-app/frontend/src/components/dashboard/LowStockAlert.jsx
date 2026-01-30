import React, {useState} from "react";
import { AlertTriangle } from "lucide-react";

export default function LowStockAlert ({lowStockItems = []}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    Low Stock Alerts
                </h2>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50"> 
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remaining</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Threshold</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {lowStockItems.length > 0 ? (
                            lowStockItems.map((alert, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{alert.item}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{alert.branch}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{alert.remaining}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{alert.threshold}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        alert.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No low stock alerts
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}