import React from 'react';

export default function OrderTypeSelector({ orderType, setOrderType }) {
  return (
    <>
      <div className="p-2">
        <h2 className="text-2xl font-bold mb-4">Order Number #</h2>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setOrderType('Dine In')}
            className={`flex-1 py-2 rounded ${
              orderType === 'Dine In'
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Dine In
          </button>
          <button 
            onClick={() => setOrderType('Takeout/Delivery')}
            className={`flex-1 py-2 rounded ${
              orderType === 'Takeout/Delivery'
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Takeout/Delivery
          </button>
        </div>
      </div>
    </>
  );
}