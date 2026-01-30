// PortionFormulaTabContent.jsx
import React from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import PortionFormulaTable from './PortionFomulaTable'; // Assuming same directory

const PortionFormulaTabContent = ({ portions, inventory, setShowPortionModal, setEditingPortion }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center text-gray-800">
          <FlaskConical className="w-5 h-5 mr-2 text-green-800" /> Portion Formulas
        </h3>

        <button
          onClick={() => {
            setEditingPortion(null); // Ensure we're adding a new one
            setShowPortionModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Portion
        </button>
      </div>

      <PortionFormulaTable
        portions={portions}
        inventory={inventory}
        setEditingPortion={setEditingPortion}
        setShowPortionModal={setShowPortionModal}
      />
    </div>
  );
};

export default PortionFormulaTabContent;