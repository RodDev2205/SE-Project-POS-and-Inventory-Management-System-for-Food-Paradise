import React, { useState } from 'react';

export default function Checkout({ orderItems = [], orderType, discountType = "None", discountPercent = "10 % off", onProceed, onCancel }) {
  const [cashGiven, setCashGiven] = useState('');
  const [error, setError] = useState('');

  const subtotal = orderItems.reduce(
    (sum, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace('₱', '').replace(',', '')) 
        : Number(item.price);
      return sum + (Number(item.quantity) * price);
    },
    0
  );

  const percentValue = parseInt(discountPercent);
  let discountAmount = 0;

  if (discountType !== "None") {
    discountAmount = subtotal * (percentValue / 100);
  }

  const total = subtotal - discountAmount;
  const numericCash = parseFloat(cashGiven) || 0;
  const changeDue = numericCash - total;
  const displayChange = cashGiven === '' ? 0 : changeDue;

  const handleProceed = () => {
    setError('');
    if (!cashGiven && numericCash === 0) {
      setError('Please enter cash amount.');
      return;
    }
    if (numericCash < total) {
      setError('Insufficient cash given.');
      return;
    }
    onProceed && onProceed();
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-brightness-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-2">Check out - {orderType}</h2>
        <div className="text-sm text-gray-600 mb-1">Date and Time: Jan 20, 2026 | 12:20 pm</div>
        <div className="text-sm text-gray-600 mb-1">Sale Id #: 00192</div>
        <div className="text-sm text-gray-600 mb-4">Cashier: Employee Name</div>

        <div className="border-t border-b border-gray-300 py-2 mb-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold mb-2">
            <div className="col-span-6">Item</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Price</div>
          </div>

          {orderItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 text-sm py-1">
              <div className="col-span-6">{item.name}</div>
              <div className="col-span-3 text-center">{item.quantity}</div>
              <div className="col-span-3 text-right">{item.price}</div>
            </div>
          ))}
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span>Total Item amount</span>
            <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
          </div>
          {discountType !== "None" && (
            <div className="flex justify-between text-sm">
              <span>Discount ({discountType} - {discountPercent})</span>
              <span className="font-semibold text-emerald-600">-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>Total Due</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <div className="flex justify-between text-sm">
            <span>Payment Type: Cash</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span>Cash Given</span>
            <input 
              type="number" 
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-300 rounded font-semibold"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 mt-1">{error}</div>
          )}
          <div className="flex justify-between text-sm">
            <span>Change Due</span>
            <span className={`font-semibold ${displayChange < 0 ? 'text-red-600' : 'text-green-600'}`}>₱{displayChange.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleProceed}
            disabled={numericCash < total}
            className={`flex-1 py-2 rounded font-semibold ${numericCash < total ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
          >
            Proceed order
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}