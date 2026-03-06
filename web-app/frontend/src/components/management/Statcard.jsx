import React from 'react';

const StatCard = ({ icon: Icon, title, value, bgColor, textColor, hasIncrease }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 flex justify-between items-start`}>
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`${textColor} text-2xl font-bold mt-2`}>{value}</p>
      </div>
      <div className={`${textColor} opacity-20`}>
        <Icon size={32} />
      </div>
    </div>
  );
};

export default StatCard;
