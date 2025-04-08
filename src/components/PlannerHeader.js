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
}) {
  const formatPower = (valueKW) => {
    return valueKW >= 1000
      ? `${(valueKW / 1000).toFixed(2)} MW`
      : `${valueKW.toFixed(2)} kW`;
  };

  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow font-sans">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          Target Load (MW):
          <input
            type="number"
            value={targetLoadMW}
            onChange={(e) => setTargetLoadMW(Number(e.target.value))}
            className="bg-white text-black border border-gray-300 rounded px-3 py-2 w-24"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={autoDistribute}
            disabled={totalPDUs === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
          >
            Equally Distribute
          </button>
          <button
            onClick={resetAll}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <p>Total PDUs in use: <strong>{totalPDUs}</strong></p>
        <p>Required Even Load per PDU: <strong>{formatPower(evenLoadPerPDU)}</strong></p>
        <p>Max Capacity per Selected PDU: <strong>{formatPower(pduMaxKW)}</strong></p>
        <p>Total Available System Capacity: <strong>{totalAvailableCapacityMW} MW</strong></p>
        <p>Total Custom Load: <strong>{formatPower(totalCustomKW)}</strong></p>
      </div>
    </div>
  );
}

export default PlannerHeader;