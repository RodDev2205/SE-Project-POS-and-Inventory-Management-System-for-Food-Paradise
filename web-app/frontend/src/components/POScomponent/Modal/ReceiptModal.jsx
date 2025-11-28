import React, { useState } from "react";

export default function ReceiptModal({ total, cart, onClose }) {
  const [given, setGiven] = useState("");
  const [orderType, setOrderType] = useState("Dine-in");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const change = given ? (parseFloat(given) - total).toFixed(2) : "0.00";

  const handlePrint = () => {
    const receiptHTML = `
      <div style="font-family:'Courier New', monospace; width:280px; padding:10px;">
        <div style="text-align:center;">
          <h1 style="color:#16a34a; margin:0;">Food<span style="color:#111827">Paradise</span></h1>
          <p style="margin:0; font-size:12px;">Official Receipt</p>
        </div>
        <div style="border-bottom:1px dashed #000; margin:5px 0; padding-bottom:5px;">
          <div style="display:flex; justify-content:space-between; font-size:12px;">
            <span>Receipt #0098</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px;">
            <span>Order Type: ${orderType}</span>
            <span>Payment: ${paymentMethod}</span>
          </div>
        </div>
        ${cart.length === 0 
          ? `<p style="text-align:center; font-size:12px;">No items added</p>` 
          : cart.map(item => `
              <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span>${item.qty} x ${item.item}</span>
                <span>₱ ${(item.qty * item.price).toFixed(2)}</span>
              </div>
            `).join('')
        }
        <div style="border-top:1px dashed #000; margin-top:5px; padding-top:5px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span>₱ ${total.toFixed(2)}</span>
          </div>
          ${paymentMethod === "Cash" ? `
            <div style="display:flex; justify-content:space-between;">
              <span>Given Amount:</span>
              <span>₱ ${given || "0.00"}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
              <span>Change:</span>
              <span>₱ ${change}</span>
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;">
            <span>Total:</span>
            <span>₱ ${total.toFixed(2)}</span>
          </div>
        </div>
        <p style="text-align:center; font-size:10px; margin-top:10px;">Thank you for dining at Food Paradise!</p>
      </div>
    `;

    const printWindow = window.open("", "_blank", "width=300,height=600");
    printWindow.document.write(`<html><head><title>Receipt</title></head><body>${receiptHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">Food<span className="text-gray-800">Paradise</span></h1>
        <p className="text-gray-600 text-sm">Official Receipt</p>
      </div>

      <div className="border-b pb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Receipt #0098</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Order Type: {orderType}</span>
          <span>Payment: {paymentMethod}</span>
        </div>
      </div>

      <div className="space-y-1">
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No items added</p>
        ) : (
          cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.qty} x {item.item}</span>
              <span>₱ {(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₱ {total.toFixed(2)}</span>
        </div>

        {paymentMethod === "Cash" && (
          <>
            <div className="flex justify-between">
              <span>Given Amount:</span>
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
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
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
