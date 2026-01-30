import React, { useState } from 'react';

export default function SalesCard ({title, amount, colorClass = 'bg-white border-gray-200', textColorClass = 'text-green-600'}) {
    const formatCurrency = (value) => {
        if (value == null || isNaN(Number(value))) return '-';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(Number(value));
    };

    return (
        <div className={`${colorClass} rounded-lg shadow-sm border p-6`}>
            <div className="text-sm text-gray-600 mb-2">{title}</div>
            <div className={`text-3xl font-bold ${textColorClass}`}>{formatCurrency(amount)}</div>
        </div>
    );
};

