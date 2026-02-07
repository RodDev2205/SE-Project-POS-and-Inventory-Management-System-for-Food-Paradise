import React from "react";

export default function MenuItems ({onAddItem, selectedCategory = 'All', searchTerm = ''}) {
  const bestSellers = [
    { name: 'Spaghetti with Toasted Bread', price: '₱150', category: 'Meals' },
    { name: 'Chicken Lomi', price: '₱200', category: 'Meals' },
    { name: 'Pancit Guisado', price: '₱250', category: 'Meals' },
    { name: 'Spaghetti Delights', price: '₱290', category: 'Meals' }
  ];
  
  const allItems = [
    { name: 'Cheese Burger', price: '₱180', category: 'Meals' },
    { name: 'Fried Buttered Chicken', price: '₱220', category: 'Meals' },
    { name: 'Beef Tapa', price: '₱320', category: 'Meals' },
    { name: 'Chicken Curry', price: '₱350', category: 'Meals' },
    { name: 'Ampalaya Con Carne', price: '₱280', category: 'Meals' },
    { name: 'Lechon Kawali', price: '₱260', category: 'Meals' },
    { name: 'Lumpia Shanghai', price: '₱240', category: 'Meals' },
    { name: 'Fried Chicken', price: '₱230', category: 'Meals' },
    { name: 'Fried Rice', price: '₱150', category: 'Meals' },
    { name: 'Shanghai Rice', price: '₱100', category: 'Meals' },
    { name: 'French Fries', price: '₱120', category: 'Sides' },
    { name: 'Toasted Bread', price: '₱160', category: 'Sides' }
  ];

  const filterBySearchAndCategory = (items) => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
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
              key={idx}
              onClick={() => onAddItem && onAddItem(item)}
              className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-200 rounded mb-2 h-20 flex items-center justify-center text-gray-500 text-xs">
                Image
              </div>
              <div className="text-xs font-medium">{item.name}</div>
              <div className="text-xs text-gray-600">{item.price}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Items Grid */}
      <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1">
        {filteredAllItems.map((item, index) => (
          <div 
            key={index}
            onClick={() => onAddItem && onAddItem(item)}
            className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="bg-gray-200 rounded mb-2 h-20 flex items-center justify-center text-gray-500 text-xs">
              Image
            </div>
            
            <div className="text-xs font-medium">{item.name}</div>
            <div className="text-xs text-gray-600">{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}