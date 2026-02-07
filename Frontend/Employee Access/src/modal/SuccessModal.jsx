import React from 'react';

export default function SuccessModal ({ onClose }) {
    return (
        <div className="fixed inset-0 bg-opacity-40 backdrop-brightness-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-12 w-96 shadow-xl flex flex-col items-center">

                <div className="mb-8">
                    <svg 
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none">
                        <path 
                        d="M30 60 L50 80 L90 35"
                        stroke="#047857"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <h2 className="text-xl font-bold mb-2 text-center">Receipt printed!</h2>
                <p className="text-center text-base">Return the change and present the receipt</p>
            </div>
        </div>
    )
}