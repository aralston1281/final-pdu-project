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
}) {
  return (
    <div className="bg-gray-200 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Target Load (MW)</label>
          <input
            type="number"
            value={targetLoadMW}
            onChange={(e) => setTargetLoadMW(Number(e.target.value))}
            className="bg-white border border-gray-300 px-3 py-2 rounded w-full"
            min={0}
            step={0.1}
          />
        </div>
        <div className="flex items-end gap-4">
          <button
            onClick={autoDistribute}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-full"
          >
            Auto Distribute
          </button>
          <button
            onClick={resetAll}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded"
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
        <div><span className="font-semibold text-red-600">Total Derated System Capacity (80%):</span> {totalDeratedCapacityMW.toFixed(2)} MW</div>
        <div><span className="font-semibold">Total Custom Load Assigned:</span> {totalCustomKW} MW</div>

        {/* Smart Warning Messages */}
        {parseFloat(totalCustomKW) > totalDeratedCapacityMW && parseFloat(totalCustomKW) <= parseFloat(totalAvailableCapacityMW) && (
          <div className="mt-2 text-yellow-500 font-bold">
            ⚠️ Load exceeds 80% derated capacity but is within full rating.
          </div>
        )}

        {parseFloat(totalCustomKW) > parseFloat(totalAvailableCapacityMW) && (
          <div className="mt-2 text-red-600 font-bold">
            ❌ Load exceeds full system rated capacity!
          </div>
        )}

        {targetLoadMW > totalDeratedCapacityMW && (
          <div className="mt-2 text-red-600 font-bold">
            ⚠️ Target Load exceeds 80% Derated System Capacity!
          </div>
        )}
      </div>
    </div>
  );
}

export default PlannerHeader;
