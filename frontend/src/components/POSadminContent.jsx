import React, { useState, useMemo } from "react";
import Modal from "../components/POScomponent/Modal/Modal";
import ItemsPanel from "../components/POScomponent/Panel/ItemsPanel";
import ReceiptPanel from "../components/POScomponent/Panel/ReceiptPanel";
import ReceiptModal from "../components/POScomponent/Modal/ReceiptModal";
import VoidTransactionModal from "../components/POScomponent/Modal/VoidTransactionModal";

export default function POSCashier({ isAdmin }) {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const items = [
    { name: "Spaghetti", price: 75.0, category: "Meals" },
    { name: "Iced tea", price: 45.0, category: "Drinks" },
    { name: "Beef burger", price: 65.0, category: "Meals" },
    { name: "Chicken", price: 110.0, category: "Meals" },
    { name: "Halo-Halo", price: 75.0, category: "Dessert" },
    { name: "Fries", price: 50.0, category: "Add-ons" },
    { name: "Burger steak", price: 75.0, category: "Meals" },
    { name: "Cola (liter)", price: 50.0, category: "Drinks" },
    { name: "Coffee", price: 55.0, category: "Drinks" },
  ];

  const totalAmount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  const filteredItems = useMemo(() => {
    let result = items.filter(
      (item) =>
        (activeCategory === "All" || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "nameAsc":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "priceAsc":
        return result.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return result.sort((a, b) => b.price - a.price);
      default:
        return result;
    }
  }, [activeCategory, searchTerm, sortOption]);

  const handleCheckout = () => {
    setModalContent(
      <ReceiptModal total={totalAmount} cart={cart} onClose={() => setModalOpen(false)} />
    );
    setModalOpen(true);
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
    <div className="flex-1 flex gap-3 h-[calc(100vh-120px)] mt-4">
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
        handleCheckout={handleCheckout}
        setCart={setCart}
        isAdmin={isAdmin}
        handleVoidTransaction={handleVoidTransaction}
      />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
}
