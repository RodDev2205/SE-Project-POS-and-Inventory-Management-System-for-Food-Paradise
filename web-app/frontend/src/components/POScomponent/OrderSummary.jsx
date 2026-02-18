import React from "react";
import { X } from "lucide-react";

export default function OrderSummary({ 
    subtotal,
    discountType,
    setDiscountType,
    discountPercent,
    setDiscountPercent
}) {
    const percentValue = parseInt(discountPercent);

    let discountAmount = 0;

    if (discountType !== "None") {
        discountAmount = subtotal * (percentValue / 100);
    }

    const total = subtotal - discountAmount;
    const changeDue = 0;

    return (
        <div className="border-t pt-3 space-y-3">
           
            <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">{subtotal}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Discount applied</span>

                <div className="flex gap-2">
                    <button
                        onClick={() => setDiscountType("None")}
                        className={`px-3 py-1 rounded text-xs ${
                            discountType === "None"
                                ? "bg-emerald-700 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        None
                    </button>

                    <button
                        onClick={() => setDiscountType("Senior")}
                        className={`px-3 py-1 rounded text-xs ${
                            discountType === "Senior"
                                ? "bg-emerald-700 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        Senior
                    </button>

                    <select
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                    >
                        <option>10 % off</option>
                        <option>20 % off</option>
                        <option>30 % off</option>
                    </select>

                    <button
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                        onClick={() => {
                            setDiscountType("None");
                            setDiscountPercent("10 % off");
                        }}
                    >
                        <X className="w-3 h-3 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-gray-700">Discount Amount</span>
                <span className="font-semibold">{discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-bold border-t pt-3">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
            </div>
        </div>
    );
}