import React, { useEffect } from "react";

export default function PrintingModal({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone?.();
    }, 2000);

    console.log("PRINT MODAL LOADED")
    console.log("onDone:", onDone);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-brightness-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-12 w-96 shadow-xl flex flex-col items-center">

        <div className="mb-8">
          <svg
            viewBox="0 0 100 100"
            className="animate-spin"
            style={{ width: "128px", height: "128px" }} 
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#047857"
              strokeWidth="8"
              fill="none"
              strokeDasharray="188.4"
              strokeDashoffset="47.1"
              strokeLinecap="round"
            />

            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#000000"
              strokeWidth="8"
              fill="none"
              strokeDasharray="188.4"
              strokeDashoffset="141.4"
              strokeLinecap="round"
              transform="rotate(90 50 50)"
            />
          </svg>
        </div>

        <p className="text-center text-base font-semibold">
          Receipt is now being printed, please wait...
        </p>
      </div>
    </div>
  );
}