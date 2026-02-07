// PortionFormulaTable.jsx
import React from 'react';
import { Edit } from 'lucide-react';

const PortionFormulaTable = ({ portions, inventory, setEditingPortion, setShowPortionModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portion Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingredients & Qty</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {portions.map((p) => (
            <tr key={p.portion_id}>
              <td className="px-6 py-4 text-sm font-medium align-top">{p.portion_name}</td>

              <td className="px-6 py-4 text-sm">
                <div className="flex flex-col gap-1">
                  {p.formula.map((f) => {
                    const ingredient = inventory.find((i) => i.raw_item_id === f.raw_item_id);
                    if (!ingredient) return null;
                    return (
                      <span key={f.raw_item_id}>
                        {ingredient.name}: {Number(f.qty).toFixed(2)} {ingredient.unit}
                      </span>
                    );
                  })}
                </div>
              </td>

              <td className="px-6 py-4 align-top">
                <button
                  onClick={() => {
                    setEditingPortion(p);
                    setShowPortionModal(true);
                  }}
                  className="text-green-700"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {portions.length === 0 && (
        <p className="text-center text-gray-500 pt-4">No portion formulas yet.</p>
      )}
    </div>
  );
};

export default PortionFormulaTable;
