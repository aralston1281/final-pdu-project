// src/components/PlannerHeader.js (Updated with Smart 3-Stage Warnings)

import React from 'react';

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
}) {
 return (
  <div className="bg-gray-200 p-4 rounded-lg mb-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Left side: Input + Help text */}
      <div>
        <label className="block font-semibold">Target Load (MW)</label>
        <p className="text-xs text-gray-600 italic mt-1">
          {autoDistributeEnabled 
            ? "Load automatically updates as you make changes."
            : "Click \"Auto Distribute\" after every change to update load distribution."}
        </p>
        <input
          type="number"
          value={targetLoadMW}
          onChange={(e) => setTargetLoadMW(Number(e.target.value))}
          className="bg-white border border-gray-300 px-3 py-2 rounded w-full mt-2"
          min={0}
          step={0.1}
        />
      </div>

      {/* Right side: Buttons, responsive layout */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:items-end">
        <button
          onClick={autoDistribute}
          disabled={autoDistributeEnabled}
          className={`font-semibold px-4 py-2 rounded w-full sm:w-auto ${
            autoDistributeEnabled 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Auto Distribute
        </button>

        <button
          onClick={resetAll}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto"
        >
          Reset
        </button>
      </div>
    </div>

      <div className="mt-4 text-sm space-y-2">
        <div><span className="font-semibold">Total PDUs:</span> {totalPDUs}</div>
        <div><span className="font-semibold">PDU Max Load:</span> {pduMaxKW.toFixed(2)} kW</div>
        <div><span className="font-semibold">Even Load / PDU:</span> {evenLoadPerPDU.toFixed(2)} kW</div>
        <div><span className="font-semibold">Total Rated System Capacity:</span> {totalAvailableCapacityMW} MW</div>
        <div><span className="font-semibold text-yellow-500">Total Derated System Capacity (80%):</span> {totalDeratedCapacityMW.toFixed(2)} MW</div>
        <div><span className="font-semibold">Total Custom Load Assigned:</span> {totalCustomKW} MW</div>

        {/* Smart Warning Messages */}
        {unassignedKW === 0 &&
  parseFloat(totalCustomKW) > totalDeratedCapacityMW &&
  parseFloat(totalCustomKW) <= parseFloat(totalAvailableCapacityMW) && (
    <div className="mt-2 text-yellow-500 font-bold">
      ⚠️ Load exceeds 80% derated capacity but is within full rating.
    </div>
)}


        {(parseFloat(totalCustomKW) > parseFloat(totalAvailableCapacityMW) || evenLoadPerPDU > pduMaxKW) && (
  <div className="mt-2 text-red-600 font-bold">
    ❌ Load exceeds full system rated capacity!
  </div>
)}


        {evenLoadPerPDU > pduMaxKW && (
          <div className="mt-2 text-red-600 font-bold">
            ❌ Current configuration will overload selected PDU!
          </div>
        )}
      </div>
    </div>
  );
}

export default PlannerHeader;
