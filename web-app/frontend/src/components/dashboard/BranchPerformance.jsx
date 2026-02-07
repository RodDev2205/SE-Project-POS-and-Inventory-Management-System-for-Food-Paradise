import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";

export default function BranchPerformance ({ branchPerformance = [] }) {

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(value);
      
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Branch Performance</h2>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {branchPerformance.length > 0 ? (
                        branchPerformance.map((branch, idx) => (
                            <div key={idx} 
                            className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    branch.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                    branch.rank === 2 ? 'bg-gray-200 text-gray-700' :
                                    'bg-orange-100 text-orange-700'
                                    }`}>
                                        {branch.rank}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{branch.name}</div>
                                        <div className="text-sm text-gray-500">{formatCurrency(branch.sales)}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-1 ${branch.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {branch.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-sm font-medium">{Math.abs(branch.change)}%</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No branch data available</p>
                    )}
                </div>
            </div>
        </div>
    )
}