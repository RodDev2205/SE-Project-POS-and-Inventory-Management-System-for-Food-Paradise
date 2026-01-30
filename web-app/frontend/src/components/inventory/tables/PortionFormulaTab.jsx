// components/inventory/tables/PortionFormulaTable.jsx
import { Edit } from "lucide-react";
import { usePortions } from "../../hooks/usePortions";
import { useInventory } from "../../hooks/useInventory";

export default function PortionFormulaTable({ onEdit }) {
  const { portions } = usePortions();
  const { inventory } = useInventory();

  const getIngredientName = (id) => {
    const found = inventory.find((item) => item.id === id);
    return found ? found.name : "—";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Portion Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Ingredient
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Qty
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
              Unit
            </th>
            <th className="px-4 py-2 text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody>
          {portions.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                No portion formulas created yet.
              </td>
            </tr>
          ) : (
            portions.map((portion) => (
              <tr key={portion.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{portion.name}</td>
                <td className="px-4 py-3 text-sm">
                  {getIngredientName(portion.ingredientId)}
                </td>
                <td className="px-4 py-3 text-sm">{portion.qty}</td>
                <td className="px-4 py-3 text-sm">{portion.unit}</td>

                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(portion)}
                    className="text-green-700 hover:text-green-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
