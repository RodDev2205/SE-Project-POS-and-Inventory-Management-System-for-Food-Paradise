import { Edit, Trash2 } from "lucide-react";

const MenuTable = ({ menuItems, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {menuItems.length ? (
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Ingredients</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4">{item.id}</td>
                <td className="py-3 px-4">{item.name}</td>
                <td className="py-3 px-4">{item.ingredients}</td>
                <td className="py-3 px-4">{item.price}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No menu items available.</p>
      )}
    </div>
  );
};

export default MenuTable;
