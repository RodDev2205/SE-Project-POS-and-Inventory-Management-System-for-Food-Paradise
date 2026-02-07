import React from "react";
import OrderItem from "./OrderItem";

export default function OrderList ({ orderItems, updateQuantity, removeItem, containerClassName = "flex-1"}) {
    return (
        <>
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b">
            <div className="col-span-5">Item</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-center">Action</div>
        </div>

        <div className={`${containerClassName} overflow-y-auto py-3 space-y-2`}>
            {orderItems.map((item, index) => (
                <OrderItem 
                    key={index}
                    item={item}
                    index={index}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                />
            ))}
        </div>
        </>
    )
}