import React from "react";

export default function MenuItems ({items = [], onAddItem, selectedCategory = 'All', searchTerm = ''}) {
  // Use backend items if available, otherwise use dummy data
  const allItems = items && items.length > 0 ? items : [
    { product_id: 1, product_name: 'Spaghetti with Toasted Bread', price: 150, category_name: 'Meals' },
    { product_id: 2, product_name: 'Chicken Lomi', price: 200, category_name: 'Meals' },
    { product_id: 3, product_name: 'Pancit Guisado', price: 250, category_name: 'Meals' },
    { product_id: 4, product_name: 'Spaghetti Delights', price: 290, category_name: 'Meals' },
    { product_id: 5, product_name: 'Cheese Burger', price: 180, category_name: 'Meals' },
    { product_id: 6, product_name: 'Fried Buttered Chicken', price: 220, category_name: 'Meals' },
    { product_id: 7, product_name: 'Beef Tapa', price: 320, category_name: 'Meals' },
    { product_id: 8, product_name: 'Chicken Curry', price: 350, category_name: 'Meals' },
    { product_id: 9, product_name: 'French Fries', price: 120, category_name: 'Sides' },
    { product_id: 10, product_name: 'Toasted Bread', price: 160, category_name: 'Sides' }
  ];

  const bestSellers = allItems.filter(item => 
    item.category_name === 'Meals'
  ).slice(0, 4);

  const filterBySearchAndCategory = (items) => {
    return items.filter(item => {
      const itemCategory = item.category_name || item.category || 'Meals';
      const itemName = item.product_name || item.name || '';
      const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory;
      const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const filteredBestSellers = filterBySearchAndCategory(bestSellers);
  const filteredAllItems = filterBySearchAndCategory(allItems);

  return (
    <div className="bg-white rounded p-4 mb-4">
      <div className="bg-emerald-700 rounded-lg p-4 mb-4">
        <h2 className="text-white text-2xl font-bold mb-3">Best Seller</h2>
        <div className="grid grid-cols-4 gap-4">
          {filteredBestSellers.map((item, idx) => (
            <div 
              key={item.product_id || idx}
              onClick={() => onAddItem && onAddItem(item)}
              className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-200 rounded mb-2 h-20 flex items-center justify-center text-gray-500 text-xs">
                Image
              </div>
              <div className="text-xs font-medium">{item.product_name || item.name}</div>
              <div className="text-xs text-gray-600">₱{typeof item.price === 'string' ? item.price : item.price}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Items Grid */}
      <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1">
        {filteredAllItems.map((item, index) => (
          <div 
            key={item.product_id || index}
            onClick={() => onAddItem && onAddItem(item)}
            className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="bg-gray-200 rounded mb-2 h-20 flex items-center justify-center text-gray-500 text-xs">
              Image
            </div>
            
            <div className="text-xs font-medium">{item.product_name || item.name}</div>
            <div className="text-xs text-gray-600">₱{typeof item.price === 'string' ? item.price : item.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}