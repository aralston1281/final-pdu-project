import React from 'react';

function ProgressBar({ current, max, label, showPercentage = true, height = 'h-4' }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  // Color based on percentage
  let colorClass = 'bg-green-500';
  if (percentage > 100) {
    colorClass = 'bg-red-500';
  } else if (percentage >= 80) {
    colorClass = 'bg-orange-500';
  } else if (percentage >= 70) {
    colorClass = 'bg-yellow-500';
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          {showPercentage && (
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

