import React, { useState } from 'react';

export default function VoidCode({ onSubmit, onCancel}) {
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(code);
    };

    return (
        <div className="fixed inset-0 bg-opacity-40 backdrop-brightness-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-center mb-6">Please Enter the Code</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2 text-center">
              Enter the manager code here
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-700"
              placeholder=""
            />
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
    )
}