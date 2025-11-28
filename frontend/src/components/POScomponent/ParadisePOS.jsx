import React, { useState, useMemo } from "react";
import { Search, Trash } from "lucide-react";

export default function ParadisePOS() {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");

    // ---------- ITEMS WITH CATEGORY ----------
    const items = [
        { id: 1, name: 'Beef Burger', price: 120, category: "Meals" },
        { id: 2, name: 'Spaghetti', price: 150, category: "Meals" },
        { id: 3, name: 'Iced Tea', price: 45, category: "Drinks" },
        { id: 4, name: 'Chocolate Cake', price: 100, category: "Desserts" },
        { id: 5, name: 'Chicken Meal', price: 180, category: "Meals" },
        { id: 6, name: 'Extra Cheese', price: 20, category: "Add-ons" },
    ];

    const categories = ["All", "Meals", "Drinks", "Desserts", "Add-ons"];

    // ---------- FILTER ITEMS ----------
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchCategory =
                activeCategory === "All" || item.category === activeCategory;

            const matchSearch = item.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            return matchCategory && matchSearch;
        });
    }, [searchTerm, activeCategory]);

    // ---------- ADD ITEM ----------
    const addToOrder = (item) => {
        setOrders(prev => {
            const exists = prev.find(o => o.id === item.id);
            if (exists) {
                return prev.map(o =>
                    o.id === item.id ? { ...o, qty: o.qty + 1 } : o
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // ---------- UPDATE QUANTITY ----------
    const updateQty = (id, qty) => {
        if (qty <= 0) {
            setOrders(prev => prev.filter(o => o.id !== id));
        } else {
            setOrders(prev =>
                prev.map(o => (o.id === id ? { ...o, qty } : o))
            );
        }
    };

    // ---------- REMOVE ----------
    const removeItem = (id) => {
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    // ---------- TOTALS ----------
    const subtotal = orders.reduce((sum, o) => sum + o.price * o.qty, 0);
    const discount = subtotal * 0.10;
    const vat = subtotal * 0.12;
    const total = subtotal - discount + vat;

    return (
        <div className="bg-white rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Point of Sale</h2>

            {/* CATEGORY TABS */}
            <div className="flex gap-8 mb-6 border-b-2 border-gray-200">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`pb-4 font-semibold ${
                            activeCategory === cat
                                ? "text-black border-b-2 border-black"
                                : "text-gray-600 hover:text-black"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex gap-6">
                {/* ITEMS */}
                <div className="flex-1">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-gray-100 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
                                onClick={() => addToOrder(item)}
                            >
                                <div className="bg-gray-300 h-24 rounded mb-3 flex items-center justify-center text-gray-600 text-sm">
                                    Image
                                </div>
                                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                <p className="text-green-600 font-bold">₱ {item.price}</p>
                            </div>
                        ))}
                    </div>

                    {/* SEARCH */}
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 outline-none text-gray-700"
                        />
                    </div>
                </div>

                {/* ORDER SUMMARY */}
                <div className="w-80 bg-gray-50 rounded-lg p-6 flex-shrink-0">
                    <h2 className="text-xl font-bold mb-6">Order</h2>

                    {/* ORDERED ITEMS */}
                    <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                        {orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold">{order.qty}x {order.name}</span>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            className="px-2 bg-gray-200 rounded"
                                            onClick={() => updateQty(order.id, order.qty - 1)}
                                        >-</button>
                                        <button
                                            className="px-2 bg-gray-200 rounded"
                                            onClick={() => updateQty(order.id, order.qty + 1)}
                                        >+</button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">₱ {order.price * order.qty}</span>
                                    <Trash
                                        size={18}
                                        className="cursor-pointer text-red-500"
                                        onClick={() => removeItem(order.id)}
                                    />
                                </div>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <p className="text-gray-500 text-center">No items added.</p>
                        )}
                    </div>

                    {/* TOTALS */}
                    <div className="space-y-2 text-sm mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold">₱ {subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Discount (10%)</span>
                            <span className="font-semibold">-₱ {discount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>VAT (12%)</span>
                            <span className="font-semibold">₱ {vat.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* FINAL TOTAL */}
                    <div className="flex justify-between font-bold text-lg mb-6 pb-6 border-b-2 border-gray-200">
                        <span>Total</span>
                        <span>₱ {total.toFixed(2)}</span>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-2">
                        <button className="flex-1 bg-white text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
                            Cancel
                        </button>

                        <button className="flex-1 bg-white text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
                            Hold
                        </button>

                        <button className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700">
                            <div className="text-xs">Checkout</div>
                            <div className="text-sm">₱ {total.toFixed(2)}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
