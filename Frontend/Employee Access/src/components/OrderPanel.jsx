import React, { useState } from "react";
import OrderType from "./OrderType";
import OrderList from "./OrderList";
import OrderSummary from "./OrderSummary";
import OrderAction from "./OrderActions";
import VoidItem from "../modal/VoidItem";
import VoidCode from "../modal/VoidCode";
import VoidSuccess from "../modal/VoidSuccess";

export default function OrderPanel({
  orderItems,
  orderType,
  setOrderType,
  updateQuantity,
  removeItem,
  onCheckOut,
  onDiscountChange,
  onOrderComplete,
  onResetDiscount,
}) {
  const [discountType, setDiscountType] = useState("None");
  const [discountPercent, setDiscountPercent] = useState("10 % off");
  
  const subtotal = orderItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace('₱', '').replace(',', '')) 
      : Number(item.price);
    return sum + (item.quantity * price);
  }, 0);

  const handleDiscountChange = (typeOrUpdater, percentOrUndefined) => {
    let newType = typeof typeOrUpdater === 'function' ? typeOrUpdater(discountType) : typeOrUpdater;
    let newPercent = typeof percentOrUndefined === 'function' ? percentOrUndefined(discountPercent) : percentOrUndefined;
    
    if (percentOrUndefined === undefined) {
      newPercent = discountPercent;
    }
    
    setDiscountType(newType);
    setDiscountPercent(newPercent);
    if (onDiscountChange) {
      onDiscountChange({ discountType: newType, discountPercent: newPercent });
    }
  };

  // Voiding flow state and handlers
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showVoidManagerCode, setShowVoidManagerCode] = useState(false);
  const [showVoidSuccess, setShowVoidSuccess] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const requestVoidItem = (index) => {
    setSelectedItemIndex(index);
    setShowVoidConfirm(true);
  };

  const handleVoidConfirm = () => {
    setShowVoidConfirm(false);
    setShowVoidManagerCode(true);
  };

  const handleVoidManagerCodeSubmit = (code) => {
    if (code) {
      setShowVoidManagerCode(false);
      if (selectedItemIndex !== null) {
        removeItem(selectedItemIndex);
      }
      setShowVoidSuccess(true);
      setTimeout(() => setShowVoidSuccess(false), 2000);
      setSelectedItemIndex(null);
    }
  };

  const handleCloseVoidModals = () => {
    setShowVoidConfirm(false);
    setShowVoidManagerCode(false);
    setShowVoidSuccess(false);
    setSelectedItemIndex(null);
  };

  const listContainerClass = orderItems.length <= 2 ? "max-h-24" : "flex-1";

  return (
    <div className=" bg-white p-3 rounded-2xl flex flex-col shadow-lg">
      <OrderType 
        orderType={orderType} 
        setOrderType={setOrderType}
        orderItems={orderItems}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />

      <OrderList
        orderItems={orderItems}
        updateQuantity={updateQuantity}
        removeItem={requestVoidItem}
        containerClassName={listContainerClass}
      />

      <OrderSummary 
        subtotal={subtotal}
        discountType={discountType}
        setDiscountType={(type) => handleDiscountChange(type, discountPercent)}
        discountPercent={discountPercent}
        setDiscountPercent={(percent) => handleDiscountChange(discountType, percent)}
      />

      <OrderAction
        orderItems={orderItems}
        orderType={orderType}
        onCheckOut={onCheckOut}
        discountType={discountType}
        discountPercent={discountPercent}
        onOrderComplete={onOrderComplete}
        onResetDiscount={onResetDiscount}
      />

      {showVoidConfirm && (
        <VoidItem
          itemName={selectedItemIndex !== null ? orderItems[selectedItemIndex]?.name : ''}
          onProceed={handleVoidConfirm}
          onCancel={handleCloseVoidModals}
        />
      )}

      {showVoidManagerCode && (
        <VoidCode
          onSubmit={handleVoidManagerCodeSubmit}
          onCancel={handleCloseVoidModals}
        />
      )}

      {showVoidSuccess && (
        <VoidSuccess onClose={handleCloseVoidModals} />
      )}
    </div>
  );
}