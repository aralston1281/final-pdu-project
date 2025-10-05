// src/components/PlannerHeader.js (Updated with Dashboard Cards)

import React from 'react';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';

function PlannerHeader({
  targetLoadMW,
  setTargetLoadMW,
  autoDistribute,
  resetAll,
  totalPDUs,
  evenLoadPerPDU,
  pduMaxKW,
  totalAvailableCapacityMW,
  totalCustomKW,
  totalDeratedCapacityMW,
  unassignedKW,
  autoDistributeEnabled = true,
  setAutoDistributeEnabled,
  networkedLoadbanks,
  setNetworkedLoadbanks,
}) {
  const utilizationPercent = totalAvailableCapacityMW > 0 
    ? (parseFloat(totalCustomKW) / parseFloat(totalAvailableCapacityMW)) * 100 
    : 0;
    
  const derateUtilizationPercent = totalDeratedCapacityMW > 0
    ? (parseFloat(totalCustomKW) / totalDeratedCapacityMW) * 100
    : 0;

  let capacityColor = 'green';
  if (utilizationPercent > 100) capacityColor = 'red';
  else if (utilizationPercent >= 80) capacityColor = 'orange';
  else if (utilizationPercent >= 70) capacityColor = 'yellow';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Capacity"
          value={`${totalAvailableCapacityMW} MW`}
          subtitle={`Derated: ${totalDeratedCapacityMW.toFixed(2)} MW (80%)`}
          color="blue"
        />
        <StatCard
          title="Current Load"
          value={`${totalCustomKW} MW`}
          subtitle={`${totalPDUs} PDUs Active`}
          color={capacityColor}
        />
        <StatCard
          title="Utilization"
          value={`${utilizationPercent.toFixed(1)}%`}
          subtitle={`Derated: ${derateUtilizationPercent.toFixed(1)}%`}
          color={capacityColor}
        />
        <StatCard
          title="Per PDU Avg"
          value={`${evenLoadPerPDU.toFixed(1)} kW`}
          subtitle={`Max: ${pduMaxKW.toFixed(0)} kW`}
          color={evenLoadPerPDU > pduMaxKW ? 'red' : 'green'}
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          current={parseFloat(totalCustomKW) * 1000} 
          max={parseFloat(totalAvailableCapacityMW) * 1000}
          label="System Load"
          height="h-6"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left side: Input */}
        <div>
          <label className="block font-semibold text-lg mb-1">Target Load (MW)</label>
          <p className="text-xs text-gray-500 mb-2">
            {autoDistributeEnabled 
              ? "✓ Auto-updating as you make changes"
              : "Click \"Auto Distribute\" to apply changes"}
          </p>
          <input
            type="number"
            value={targetLoadMW}
            onChange={(e) => setTargetLoadMW(Number(e.target.value))}
            className="bg-white border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-lg w-full text-lg font-semibold transition-colors"
            min={0}
            step={0.1}
          />
          
          {/* Compact Settings Toggles */}
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDistributeEnabled}
                onChange={(e) => setAutoDistributeEnabled(e.target.checked)}
                className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
              />
              <div>
                <div className="text-gray-800">
                  <span className="font-semibold">Auto-Distribute Load</span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {autoDistributeEnabled 
                    ? '✓ Automatically recalculates when you change settings' 
                    : 'Manual mode - click "Auto Distribute" button to apply'}
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={networkedLoadbanks}
                onChange={(e) => setNetworkedLoadbanks(e.target.checked)}
                className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
              />
              <div>
                <div className="text-gray-800">
                  <span className="font-semibold">Networked Loadbanks</span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {networkedLoadbanks 
                    ? '✓ Load spreads across all subfeeds in each lineup' 
                    : 'Load isolated to each PDU\'s own subfeeds only'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Right side: Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:items-end">
          <button
            onClick={autoDistribute}
            disabled={autoDistributeEnabled}
            className={`font-semibold px-6 py-3 rounded-lg w-full sm:w-auto transition-all ${
              autoDistributeEnabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
            }`}
          >
            Auto Distribute
          </button>

          <button
            onClick={resetAll}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg w-full sm:w-auto transition-all hover:shadow-md"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Warning Messages */}
      {unassignedKW === 0 &&
        parseFloat(totalCustomKW) > totalDeratedCapacityMW &&
        parseFloat(totalCustomKW) <= parseFloat(totalAvailableCapacityMW) && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded">
            <span className="font-semibold">⚠️ Warning:</span> Load exceeds 80% derated capacity but is within full rating.
          </div>
      )}

      {(parseFloat(totalCustomKW) > parseFloat(totalAvailableCapacityMW) || evenLoadPerPDU > pduMaxKW) && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
          <span className="font-semibold">❌ Critical:</span> Load exceeds full system rated capacity!
        </div>
      )}

      {evenLoadPerPDU > pduMaxKW && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
          <span className="font-semibold">❌ Overload:</span> Current configuration will overload selected PDU!
        </div>
      )}
    </div>
  );
}

export default PlannerHeader;
