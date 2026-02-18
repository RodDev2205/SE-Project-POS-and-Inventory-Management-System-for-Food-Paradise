import React from 'react';
import { Plus, Minus, X } from 'lucide-react';

export default function OrderItem({ item, index, updateQuantity, removeItem }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center text-sm">
      <div className="col-span-5 text-gray-700">{item.name}</div>
      <div className="col-span-3 flex items-center justify-center gap-1">
        <button
          onClick={() => updateQuantity(index, 1)}
          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          <Plus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(index, -1)}
          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          <Minus className="w-3 h-3" />
        </button>
      </div>
      <div className="col-span-2 text-right text-gray-700">{item.price}</div>
      <div className="col-span-2 flex justify-center">
        <button
          onClick={() => removeItem(index)}
          className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
        >
          <X className="w-3 h-3 text-gray-600" />
        </button>
      </div>
    </div>
  );
}