import React from 'react';

export default function CancelOrder({ orderNumber = '#####', onProceed, onCancel }) {
    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-brightness-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-96 shadow-xl">
                <h2 className="text-xl font-bold text-center mb-4">Cancel order?</h2>

                <p className="text-center text-base mb-8">
                    Are you sure you want to cancel order {orderNumber} ?
                </p>

                <div className="flex gap-3">
                    <button 
                    onClick={onProceed}
                    className="flex-1 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800"
                    >
                        Proceed
                    </button>

                    <button
                    onClick={onCancel}
                    className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}