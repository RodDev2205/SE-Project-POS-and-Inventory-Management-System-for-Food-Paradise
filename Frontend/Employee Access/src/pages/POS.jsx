import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CategoryTabs from '../components/CategoryTabs';
import MenuItems from '../components/MenuItems';
import OrderPanel from '../components/OrderPanel';
import CheckoutModal from '../modal/Checkout';
import PrintingModal from '../modal/PrintingModal';

export default function POS() {
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [orderType, setOrderType] = useState('Dine In');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [showCheckoutModal, setCheckOutModal] = useState(false);
  const [ showPrinting, setShowPrinting ] = useState(false);

  const [discountInfo, setDiscountInfo] = useState({ discountType: "None", discountPercent: "10 % off" });

  const updateQuantity = (index, delta) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setOrderItems(newItems);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const addItem = (item) => {
    const existingIndex = orderItems.findIndex(i => i.name === item.name);
    if (existingIndex >= 0) {
      updateQuantity(existingIndex, 1);
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-screen bg-gray-100 overflow-auto flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 gap-6 px-4 pb-4">
        <div className="flex-1 flex flex-col overflow-hidden">
          <h1 className="text-2xl font-bold p-4">
            Point of Sale
          </h1>

          <CategoryTabs onCategoryChange={setSelectedCategory} onSearchChange={setSearchTerm} />

          <div className="flex-1 overflow-y-auto">
            <MenuItems onAddItem={addItem} selectedCategory={selectedCategory} searchTerm={searchTerm} />
          </div>
        </div>

        <div className="w-96">
          <OrderPanel 
            orderItems={orderItems}
            orderType={orderType}
            setOrderType={setOrderType}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            onCheckOut={() => setCheckOutModal(true)}
            onDiscountChange={setDiscountInfo}
            onOrderComplete={() => setOrderItems([])}
            onResetDiscount={() => setDiscountInfo({ discountType: "None", discountPercent: "10 % off" })}
          />
          {showCheckoutModal && (
            <CheckoutModal 
              orderItems={orderItems}
              orderType={orderType}
              discountType={discountInfo.discountType}
              discountPercent={discountInfo.discountPercent}
              onProceed={() => {
                setCheckOutModal(false);
                setShowPrinting(true);
                setOrderItems([]);
                setDiscountInfo({ discountType: "None", discountPercent: "10 % off" });
              }}
              onCancel={() => setCheckOutModal(false)}
              />
            )}

          {showPrinting && (
            <PrintingModal 
              onDone={() => {
                setShowPrinting(false);
              }}
              />
            )}
        </div>
      </div>
      </div>
    </div>
  );
}