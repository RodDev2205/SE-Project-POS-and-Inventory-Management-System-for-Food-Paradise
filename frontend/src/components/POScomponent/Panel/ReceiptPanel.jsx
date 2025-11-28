import React from "react";

export default function ReceiptPanel({
  cart,
  totalAmount,
  handleCheckout,
  setCart,
  isAdmin,
  handleVoidTransaction,
}) {
  return (
    <div className="w-80 bg-white rounded-lg p-4 space-y-4 shadow h-full">
      <div className="flex justify-between items-center pb-3 border-b">
        <h2 className="font-bold text-lg"> Receipt #0098</h2>
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
      </div>

      <div className="space-y-2 pb-4 border-b">
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No items added</p>
        ) : (
          cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.qty}x {item.item}</span>
              <span className="font-semibold">₱ {(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">₱ {totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>No Discount Applied</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t">
          <span>Total</span>
          <span>₱ {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          className="w-full bg-green-600 text-white font-bold py-2 rounded-lg"
          onClick={handleCheckout}
        >
          Checkout
        </button>
        <button
          className="w-full bg-red-400 hover:bg-red-500 text-white font-bold py-2 rounded-lg"
          onClick={() => setCart([])}
        >
          Cancel
        </button>

        {isAdmin && (
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg"
            onClick={handleVoidTransaction}
          >
            Void Transaction
          </button>
        )}
      </div>
    </div>
  );
}
