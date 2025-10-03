import React from 'react';

function StatCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color] || colorClasses.gray} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-60">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-50 ml-2">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 text-xs font-semibold">
          {trend}
        </div>
      )}
    </div>
  );
}

export default StatCard;

