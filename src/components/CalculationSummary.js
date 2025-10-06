import React, { useState } from 'react';

function CalculationSummary({ 
  totalCustomKW, 
  totalAvailableCapacityMW,
  totalDeratedCapacityMW,
  totalPDUs,
  pduMaxKW,
  pduMainVoltage,
  pduMainBreakerAmps,
  subfeedVoltage,
  subfeedBreakerAmps,
  loadbankMaxKW,
  selectedLineups,
  powerFactor = 1.0,
  config
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total system values
  const totalLoadKW = parseFloat(totalCustomKW) * 1000;
  const totalCapacityKW = parseFloat(totalAvailableCapacityMW) * 1000;
  
  // Format power - show MW unless under 1 MW
  const formatPowerValue = (kw) => {
    const mw = kw / 1000;
    if (mw >= 1) {
      return { value: mw.toFixed(1), unit: 'MW' };
    } else {
      return { value: Math.round(kw), unit: 'kW' };
    }
  };

  // Calculate current (amps) - using 3-phase formula: I = P(watts) / (√3 × V × PF)
  // Convert kW to watts by multiplying by 1000
  const lineCurrentAmps = pduMainVoltage > 0 
    ? (totalLoadKW * 1000) / (Math.sqrt(3) * pduMainVoltage * powerFactor)
    : 0;
  
  // Current per PDU (average)
  const currentPerPDU = totalPDUs > 0 ? lineCurrentAmps / totalPDUs : 0;
  
  // System efficiency
  const efficiency = totalCapacityKW > 0 ? (totalLoadKW / totalCapacityKW) * 100 : 0;
  
  // Utilization vs derated capacity
  const derateUtilization = (totalLoadKW / (totalDeratedCapacityMW * 1000)) * 100;

  const StatRow = ({ label, value, unit, color = "text-gray-800", tooltip }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
      <span className="text-sm font-medium text-gray-600" title={tooltip}>{label}</span>
      <span className={`text-lg font-bold ${color}`}>
        {value} <span className="text-sm font-normal">{unit}</span>
      </span>
    </div>
  );

  const activeLoad = formatPowerValue(totalLoadKW);
  const totalCapacity = formatPowerValue(totalCapacityKW);
  const deratedCapacity = formatPowerValue(totalDeratedCapacityMW * 1000);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 mb-6 overflow-hidden">
      <div 
        className="p-6 cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">🧮</span>
          Electrical Calculations
        </h3>
        <span className="text-2xl text-gray-600">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (

      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Power Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-800 mb-4">
              Power Summary
            </h4>
            <div className="space-y-1">
              <StatRow 
                label="Active Load" 
                value={activeLoad.value} 
                unit={activeLoad.unit}
                color={totalLoadKW > totalCapacityKW ? "text-red-600" : "text-blue-600"}
              />
              <StatRow 
                label="Total Capacity" 
                value={totalCapacity.value} 
                unit={totalCapacity.unit}
              />
              <StatRow 
                label="Derated Capacity (80%)" 
                value={deratedCapacity.value} 
                unit={deratedCapacity.unit}
                color="text-orange-600"
              />
            </div>
          </div>

          {/* Current & Amperage */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-lg border-2 border-yellow-200">
            <h4 className="font-bold text-gray-800 mb-4">
              Current Analysis
            </h4>
            <div className="space-y-1">
              <StatRow 
                label="Total System Current" 
                value={lineCurrentAmps.toFixed(2)} 
                unit="A"
                color="text-orange-600"
                tooltip="Total 3-phase line current: I = P / (√3 × V × PF)"
              />
              <StatRow 
                label="Avg Current per PDU" 
                value={currentPerPDU.toFixed(2)} 
                unit="A"
                tooltip="Average current draw per active PDU"
              />
              <StatRow 
                label="PDU Main Voltage" 
                value={pduMainVoltage} 
                unit="V"
              />
              <StatRow 
                label="PDU Main Breaker" 
                value={pduMainBreakerAmps} 
                unit="A"
              />
            </div>
          </div>

        {/* System Metrics */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border-2 border-purple-200">
          <h4 className="font-bold text-gray-800 mb-4">
            System Metrics
          </h4>
          <div className="space-y-1">
            <StatRow 
              label="Capacity Utilization" 
              value={efficiency.toFixed(1)} 
              unit="%"
              color={efficiency > 100 ? "text-red-600" : efficiency > 80 ? "text-orange-600" : "text-green-600"}
            />
            <StatRow 
              label="Derate Utilization" 
              value={derateUtilization.toFixed(1)} 
              unit="%"
              color={derateUtilization > 100 ? "text-red-600" : derateUtilization > 80 ? "text-yellow-600" : "text-green-600"}
              tooltip="Load vs 80% derated capacity"
            />
            <StatRow 
              label="Active PDUs" 
              value={totalPDUs} 
              unit="units"
            />
            <StatRow 
              label="Active Lineups" 
              value={selectedLineups.length} 
              unit="units"
            />
            <StatRow 
              label="Avg Load per PDU" 
              value={(totalLoadKW / totalPDUs).toFixed(2)} 
              unit="kW"
            />
            <StatRow 
              label="PDU Max Rating" 
              value={pduMaxKW.toFixed(2)} 
              unit="kW"
            />
          </div>
        </div>

          {/* Subfeed Info */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-lg border-2 border-green-200">
            <h4 className="font-bold text-gray-800 mb-4">
              Subfeed Specifications
            </h4>
            <div className="space-y-1">
              <StatRow 
                label="Subfeed Voltage" 
                value={subfeedVoltage} 
                unit="V"
              />
              <StatRow 
                label="Subfeed Breaker" 
                value={subfeedBreakerAmps} 
                unit="A"
              />
              <StatRow 
                label="Subfeed Max Power" 
                value={(Math.sqrt(3) * subfeedVoltage * subfeedBreakerAmps * powerFactor / 1000).toFixed(2)} 
                unit="kW"
                tooltip="Max power per subfeed: √3 × V × I × PF / 1000"
              />
              <StatRow 
                label="Loadbank Max" 
                value={loadbankMaxKW || 0} 
                unit="kW"
                color="text-blue-600"
                tooltip="Physical loadbank capacity constraint"
              />
              <StatRow 
                label="Subfeeds per PDU" 
                value={config.subfeedsPerPDU || 8} 
                unit="circuits"
              />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default CalculationSummary;

