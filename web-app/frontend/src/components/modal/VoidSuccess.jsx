import React from "react";

export default function VoidSuccess({ onClose }) {
     return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-brightness-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-4">Item void success</h2>
        
        <p className="text-center text-sm text-gray-700 mb-6">
          Check logs and records to confirm the voided item.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50"
        >
          Return to POS
        </button>
      </div>
    </div>
  );
}