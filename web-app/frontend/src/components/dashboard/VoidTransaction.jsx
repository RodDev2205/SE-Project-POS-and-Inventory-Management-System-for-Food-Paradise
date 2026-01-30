import React, {useState} from 'react';

export default function VoidedTransaction ({ voidedTransactions = [] }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recent Voided Transactions</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receipt #</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cashier</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>  
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>                   
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {voidedTransactions.length > 0 ? (
                            voidedTransactions.map((trans, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{trans.receipt}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{trans.cashier}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{trans.branch}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{trans.reason}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{trans.time}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No voided transactions
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}