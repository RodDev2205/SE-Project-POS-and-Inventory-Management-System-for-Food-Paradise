import React from "react";

export default function Records () {
    const records = [
        { date: '10-30-25', transaction: '00259', amount: 155.00, status: 'Completed'},
        { date: '10-29-25', transaction: '00357', amount: 225.00, status: 'Completed'},
        { date: '10-29-25', transaction: '00355', amount: 320.00, status: 'Completed'},
    ];

    return (
        <div className="flex-1 bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Records</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-300"> 
                        <th className="text-left pb-3 font-bold text-gray-800">Date</th>
                        <th className="text-left pb-3 font-bold text-gray-800">Transaction</th>
                        <th className="text-left pb-3 font-bold text-gray-800">Amount</th>
                        <th className="text-left pb-3 font-bold text-gray-800">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 text-gray-700">{record.date}</td>
                            <td className="py-4 text-gray-700">{record.transaction}</td>
                            <td className="py-4 text-gray-700">₱ {record.amount.toFixed(2)}</td>
                            <td className="py-4 text-gray-700">{record.status}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    )
}