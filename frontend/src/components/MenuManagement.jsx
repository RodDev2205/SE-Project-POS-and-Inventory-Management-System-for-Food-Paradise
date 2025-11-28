import React, { useState } from 'react';
import { Plus, Trash2, Edit, Utensils, Coffee, Soup } from 'lucide-react';

// --- Placeholder Data ---
const initialMenuItems = [
  { id: 1, name: "Grilled Salmon Steak", category: "Main Courses", price: 18.99, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1579631580252-9653a1a67a05?q=80&w=2940&auto=format&fit=crop' },
  { id: 2, name: "Classic Cheeseburger", category: "Sandwiches", price: 10.50, stock: 'Low Stock', image: 'https://images.unsplash.com/photo-1568901346537-29d3b190a618?q=80&w=2832&auto=format&fit=crop' },
  { id: 3, name: "Espresso", category: "Beverages", price: 3.00, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1541167760496-1c4627fe5526?q=80&w=2940&auto=format&fit=crop' },
  { id: 4, name: "Chocolate Lava Cake", category: "Desserts", price: 7.50, stock: 'Out of Stock', image: 'https://images.unsplash.com/photo-1571434190825-9772097e108d?q=80&w=2940&auto=format&fit=crop' },
];

const categories = [
  { name: "All Items", icon: Utensils },
  { name: "Main Courses", icon: Utensils },
  { name: "Beverages", icon: Coffee },
  { name: "Desserts", icon: Soup },
  { name: "Sandwiches", icon: Utensils },
];

// --- Menu Item Card Component ---
const MenuItemCard = ({ item, onEdit, onDelete }) => {
  const stockColor = item.stock === 'In Stock' ? 'bg-green-100 text-green-700' :
                     item.stock === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img src={item.image || 'https://via.placeholder.com/300x200?text=Food+Item'} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-bold text-gray-800 leading-tight">{item.name}</h4>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${stockColor}`}>{item.stock}</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{item.category}</p>
        <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-2xl font-extrabold text-[#1B5E20]">${item.price.toFixed(2)}</span>
          <div className="flex space-x-2">
            <button className="p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-gray-100" onClick={() => onEdit(item)}>
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-gray-100" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Add New Item Form Component ---
const AddNewItemForm = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[1].name);
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    const newItem = { id: Date.now(), name, category, price: parseFloat(price), stock: 'In Stock', image: 'https://via.placeholder.com/300x200?text=New+Item' };
    onAddItem(newItem);
    setName(''); setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#E8F5E9] p-6 rounded-xl shadow-inner border border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center"><Plus className="w-5 h-5 mr-2" /> Add New Menu Item</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="p-3 border border-green-300 rounded-lg" required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 border border-green-300 rounded-lg bg-white" required>
          {categories.slice(1).map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
        </select>
        <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} className="p-3 border border-green-300 rounded-lg" step="0.01" min="0" required />
      </div>
      <button type="submit" className="mt-4 w-full md:w-auto px-6 py-3 bg-[#1B5E20] text-white font-semibold rounded-lg shadow-md hover:bg-[#33691E]">Create Item</button>
    </form>
  );
};

// --- Edit Item Modal ---
const EditItemModal = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(item.price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, name, category, price: parseFloat(price) });
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">Edit Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 border rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="w-full p-3 border rounded-lg" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.slice(1).map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
          </select>
          <input type="number" className="w-full p-3 border rounded-lg" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" required />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Menu Management Component ---
const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [activeCategory, setActiveCategory] = useState(categories[0].name);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddItem = (newItem) => setMenuItems([...menuItems, newItem]);
  const handleDeleteItem = (id) => setMenuItems(menuItems.filter(item => item.id !== id));
  const handleSaveEditedItem = (updatedItem) => {
    setMenuItems(menuItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  const filteredItems = activeCategory === 'All Items' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>

      <AddNewItemForm onAddItem={handleAddItem} />

      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          const Icon = cat.icon;
          return (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-[#1B5E20] text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'}`}>
              <Icon className="w-4 h-4 mr-2" />
              {cat.name} ({menuItems.filter(item => cat.name === 'All Items' || item.category === cat.name).length})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} onEdit={() => setEditingItem(item)} onDelete={() => handleDeleteItem(item.id)} />
        ))}
        {filteredItems.length === 0 && (
          <div className="lg:col-span-4 text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-500">No items found in the **{activeCategory}** category.</p>
          </div>
        )}
      </div>

      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEditedItem} />
      )}
    </div>
  );
};

export default MenuManagement;
