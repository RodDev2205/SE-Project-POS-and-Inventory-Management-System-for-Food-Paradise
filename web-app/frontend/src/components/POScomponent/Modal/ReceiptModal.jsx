import React, { useState, useEffect } from "react";

export default function ReceiptModal({ orderId, total, cart, onClose }) {
  const [given, setGiven] = useState("");
  const [orderType, setOrderType] = useState("Dine-in");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showSuccess, setShowSuccess] = useState(false);

  const change = given ? (parseFloat(given) - total).toFixed(2) : "0.00";

  const handlePrint = async () => {
    const payload = {
      orderId,
      cart,
      total,
      given,
      change,
      orderType,
      paymentMethod,
      date: new Date().toLocaleString(),
    };

    try {
      const res = await fetch("http://localhost:5200/api/print-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccess(true);

        // ✅ Auto close popup + modal
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        alert("Printer error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to print receipt.");
    }
  };

  return (
    <div className="relative space-y-4 w-full">

      {/* ✅ SUCCESS POPUP */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-center
                          animate-fade-in">
            <h2 className="text-green-600 text-lg font-bold">
              ✅ Receipt Printed
            </h2>
            <p className="text-sm text-gray-600">
              Closing receipt...
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Food<span className="text-gray-800">Paradise</span>
        </h1>
        <p className="text-gray-600 text-sm">Official Receipt</p>
      </div>

      <div className="border-b pb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Receipt #{orderId}</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Order Type: {orderType}</span>
          <span>Payment: {paymentMethod}</span>
        </div>
      </div>

      <div className="space-y-1">
        {cart.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>{item.qty} x {item.item}</span>
            <span>₱ {(item.qty * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₱ {total.toFixed(2)}</span>
        </div>

        {paymentMethod === "Cash" && (
          <>
            <div className="flex justify-between">
              <span>Given:</span>
              <span>₱ {given || "0.00"}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Change:</span>
              <span>₱ {change}</span>
            </div>
          </>
        )}

        <div className="flex justify-between font-bold text-base">
          <span>Total:</span>
          <span>₱ {total.toFixed(2)}</span>
        </div>
      </div>

      {paymentMethod === "Cash" && (
        <input
          type="number"
          className="w-full border rounded p-2"
          placeholder="Enter Given Amount"
          value={given}
          onChange={(e) => setGiven(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <select
          className="flex-1 border rounded p-2"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option>Dine-in</option>
          <option>Take-out</option>
          <option>Delivery</option>
        </select>

        <select
          className="flex-1 border rounded p-2"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>Online</option>
        </select>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
          onClick={handlePrint}
        >
          Print Receipt
        </button>
        <button
          className="flex-1 bg-gray-300 hover:bg-gray-400 font-bold py-2 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
