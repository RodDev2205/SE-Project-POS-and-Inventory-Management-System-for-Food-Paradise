import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/POScomponent/Modal/Modal";
import ItemsPanel from "../components/POScomponent/Panel/ItemsPanel";
import ReceiptPanel from "../components/POScomponent/Panel/ReceiptPanel";
import ReceiptModal from "../components/POScomponent/Modal/ReceiptModal";
import VoidTransactionModal from "../components/POScomponent/Modal/VoidTransactionModal";

export default function POSCashier({ isCashier, isAdmin }) {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [items, setItems] = useState([]);

  // ================== FETCH PRODUCTS ==================
  useEffect(() => {
    fetch("http://localhost:5200/api/menu", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  const filteredItems = useMemo(() => {
    let result = items.filter(
      (item) =>
        (activeCategory === "All" || item.category_name === activeCategory) &&
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "nameAsc":
        return result.sort((a, b) => a.product_name.localeCompare(b.product_name));
      case "priceAsc":
        return result.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return result.sort((a, b) => b.price - a.price);
      default:
        return result;
    }
  }, [activeCategory, searchTerm, sortOption, items]);

  // ================== HANDLE CHECKOUT ==================
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    try {
      const response = await fetch("http://localhost:5200/api/pos/complete-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      const data = await response.json();

      if (data.success) {
        setModalContent(
          <ReceiptModal
            orderId={data.orderId}   // ✅ REAL DB order_id
            total={totalAmount}
            cart={cart}
            onClose={() => setModalOpen(false)}
          />
        );

        setModalOpen(true);
        setCart([]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error completing sale.");
    }
  };


  const handleVoidTransaction = () => {
    setModalContent(
      <VoidTransactionModal
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setCart([]);
          alert("Transaction successfully voided!");
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };

  return (
    <div className="flex-1 flex gap-3 h-[calc(100vh-120px)]">
      <ItemsPanel
        items={filteredItems}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOption={sortOption}
        setSortOption={setSortOption}
        cart={cart}
        setCart={setCart}
      />
      <ReceiptPanel
        cart={cart}
        totalAmount={totalAmount}
        handleCheckout={handleCheckout} // now actually completes sale
        setCart={setCart}
        isCashier={isCashier}
        isAdmin={isAdmin}
        handleVoidTransaction={handleVoidTransaction}
      />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
}
