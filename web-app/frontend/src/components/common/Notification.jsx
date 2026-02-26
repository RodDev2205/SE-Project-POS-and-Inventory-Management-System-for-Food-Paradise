import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, InfoIcon, X } from "lucide-react";

export default function Notification({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Auto-close after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          icon: <AlertCircle size={24} className="text-red-600" />,
          headerColor: "text-red-600",
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          icon: <CheckCircle size={24} className="text-green-600" />,
          headerColor: "text-green-600",
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          icon: <AlertTriangle size={24} className="text-yellow-600" />,
          headerColor: "text-yellow-600",
        };
      case "info":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          icon: <InfoIcon size={24} className="text-blue-600" />,
          headerColor: "text-blue-600",
        };
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          icon: <InfoIcon size={24} className="text-gray-600" />,
          headerColor: "text-gray-600",
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md">
      <div
        className={`${styles.bgColor} border ${styles.borderColor} ${styles.textColor} px-6 py-4 rounded-lg shadow-lg flex gap-4 items-start animate-fade-in`}
      >
        <div className="flex-shrink-0">{styles.icon}</div>

        <div className="flex-1">
          <p className={`font-semibold ${styles.headerColor} capitalize mb-1`}>
            {type}
          </p>
          <p className="text-sm">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
