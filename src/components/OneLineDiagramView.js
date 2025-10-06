// src/components/OneLineDiagramView.js

import React from 'react';

function OneLineDiagramView({ 
  config, 
  selectedLineups, 
  pduUsage, 
  customDistribution, 
  getDisplayName,
  reducedCapacityLineups = {},
  breakerSelection = {},
  networkedLoadbanks = true,
  handleCustomChange,
  toggleSubfeed
}) {
  const [zoom, setZoom] = React.useState(1.0);
  const [isDesktop, setIsDesktop] = React.useState(false);
  
  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  const lineupMaxKW = config.lineupMaxKW || 1500;

  const getLineupMaxKW = (lineup) => {
    return reducedCapacityLineups[lineup] || lineupMaxKW;
  };

  const getLineupLoad = (lineup, lineupIndex) => {
    const pduList = pduUsage[lineup] || [];
    let total = 0;
    pduList.forEach((pduIdx, pj) => {
      const globalIndex = selectedLineups
        .slice(0, lineupIndex)
        .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
      total += customDistribution[globalIndex] || 0;
    });
    return total;
  };

  const getPDULoad = (lineup, lineupIndex, pduIdx) => {
    const pduList = pduUsage[lineup] || [];
    const pj = pduList.indexOf(pduIdx);
    if (pj === -1) return 0;
    
    const globalIndex = selectedLineups
      .slice(0, lineupIndex)
      .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
    return customDistribution[globalIndex] || 0;
  };

  const getLoadColor = (load, max) => {
    const percent = (load / max) * 100;
    if (percent > 100) return '#ef4444'; // red
    if (percent > 80) return '#f59e0b'; // orange
    if (percent > 60) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const totalSystemLoad = selectedLineups.reduce((sum, lineup, idx) => {
    return sum + getLineupLoad(lineup, idx);
  }, 0);

  const pduMaxKW = (Math.sqrt(3) * config.pduMainVoltage * config.pduMainBreakerAmps) / 1000;
  const subfeedsPerPDU = config.subfeedsPerPDU || 8;

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 sm:p-8">
      {/* Zoom Controls - Desktop Only */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <div>
          {(handleCustomChange || toggleSubfeed) && (
            <div className="text-sm text-blue-800">
              <span className="font-semibold">Interactive:</span> Click to edit
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="bg-white hover:bg-gray-200 border-2 border-gray-300 px-3 py-1 rounded font-bold transition-colors"
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
            className="bg-white hover:bg-gray-200 border-2 border-gray-300 px-3 py-1 rounded font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors ml-1"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Mobile Hint */}
      {(handleCustomChange || toggleSubfeed) && (
        <div className="md:hidden bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Interactive:</span> Click to edit. Pinch to zoom.
          </p>
        </div>
      )}
      
      {/* System Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 text-center">
          <div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Total Load</div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{(totalSystemLoad / 1000).toFixed(2)} MW</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Active Lineups</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{selectedLineups.length}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Main Voltage</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{config.pduMainVoltage}V</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Main Breaker</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{config.pduMainBreakerAmps}A</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-600 font-semibold">Subfeeds/PDU</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{subfeedsPerPDU}</div>
          </div>
        </div>
      </div>

      {/* Single-Line Diagram */}
      <div className="overflow-x-auto overflow-y-auto border-2 border-gray-300 rounded-lg bg-gray-50" style={{ maxHeight: '80vh', touchAction: 'pan-x pan-y pinch-zoom' }}>
        <div 
          className="min-w-max p-4 md:p-8"
          style={{ 
            transform: isDesktop ? `scale(${zoom})` : 'none',
            transformOrigin: 'top left',
            width: 'fit-content'
          }}
        >
          {/* Main Source */}
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-b from-red-600 to-red-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-xs font-semibold mb-1">MAIN SOURCE</div>
                <div className="text-lg sm:text-xl font-bold">{(totalSystemLoad / 1000).toFixed(2)} MW</div>
                <div className="text-xs mt-1 opacity-90">{config.pduMainVoltage}V • {config.pduMainBreakerAmps}A</div>
              </div>
            </div>
            <div className="w-0.5 h-6 sm:h-8 bg-gray-800"></div>
          </div>

          {/* Main Bus Bar */}
          <div className="relative mb-4 sm:mb-6">
            <div className="h-1 bg-gray-800"></div>
            {/* Vertical drops to lineups */}
            <div className="absolute top-0 left-0 right-0 flex justify-around">
              {selectedLineups.map((lineup) => (
                <div key={lineup} className="w-0.5 h-1 bg-gray-800"></div>
              ))}
            </div>
          </div>

          {/* Lineups - Horizontal Layout */}
          <div className="flex justify-around gap-3 sm:gap-6">
            {selectedLineups.map((lineup, lineupIdx) => {
              const lineupLoad = getLineupLoad(lineup, lineupIdx);
              const lineupMax = getLineupMaxKW(lineup);
              const lineupColor = getLoadColor(lineupLoad, lineupMax);
              const pduArray = pduUsage[lineup] || [];
              const hasReducedCapacity = reducedCapacityLineups[lineup];

              return (
                <div key={lineup} className="flex flex-col items-center">
                  {/* Vertical line down to lineup */}
                  <div className="w-0.5 h-4 sm:h-6 bg-gray-800"></div>
                  
                  {/* Lineup Box */}
                  <div 
                    className="border-3 rounded-lg p-2 sm:p-3 shadow-md min-w-[120px] sm:min-w-[160px]"
                    style={{ 
                      borderColor: lineupColor, 
                      borderWidth: '3px',
                      backgroundColor: `${lineupColor}15` 
                    }}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="font-bold text-sm sm:text-base text-gray-800">{getDisplayName(lineup)}</div>
                        {hasReducedCapacity && (
                          <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                            R
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">Max: {lineupMax} kW</div>
                      <div className="text-base sm:text-lg font-bold" style={{ color: lineupColor }}>
                        {lineupLoad.toFixed(0)} kW
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {((lineupLoad / lineupMax) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Vertical line to PDU group */}
                  <div className="w-0.5 h-4 sm:h-6 bg-gray-700"></div>

                  {/* PDUs stacked vertically */}
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {pduArray.map((pduIdx) => {
                      const pduLoad = getPDULoad(lineup, lineupIdx, pduIdx);
                      const pduColor = getLoadColor(pduLoad, pduMaxKW);
                      const subfeedLoad = subfeedsPerPDU > 0 ? pduLoad / subfeedsPerPDU : 0;
                      const maxSubfeedKW = (Math.sqrt(3) * (config.subfeedVoltage || 415) * (config.subfeedBreakerAmps || 400)) / 1000;
                      const pduKey = `PDU-${lineup}-${pduIdx + 1}`;

                      return (
                        <div key={pduKey} className="flex flex-col items-center">
                          {/* PDU Box */}
                          <div 
                            className="relative border-2 rounded p-2 sm:p-2.5 shadow bg-white min-w-[110px] sm:min-w-[140px]"
                            style={{ borderColor: pduColor }}
                          >
                            <div className="text-center">
                              <div className="font-bold text-xs sm:text-sm text-gray-800 mb-0.5">
                                {getDisplayName(pduKey)}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                {config.pduMainVoltage}V • {config.pduMainBreakerAmps}A
                              </div>
                              {handleCustomChange ? (
                                <input
                                  type="number"
                                  value={pduLoad.toFixed(0)}
                                  onChange={(e) => {
                                    const globalIndex = selectedLineups
                                      .slice(0, lineupIdx)
                                      .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pduArray.indexOf(pduIdx);
                                    handleCustomChange(globalIndex, e.target.value);
                                  }}
                                  className="w-20 text-center font-bold text-sm border-2 border-gray-300 focus:border-blue-500 rounded px-1 py-0.5 transition-colors"
                                  style={{ color: pduColor }}
                                  min={0}
                                  step={10}
                                />
                              ) : (
                                <div className="font-bold text-sm" style={{ color: pduColor }}>
                                  {pduLoad.toFixed(0)} kW
                                </div>
                              )}
                              <div className="text-xs text-gray-600 mt-1">
                                {((pduLoad / pduMaxKW) * 100).toFixed(0)}%
                              </div>
                            </div>
                            
                            {/* Diagonal line (electrical symbol) */}
                            <div className="absolute inset-0 pointer-events-none">
                              <svg className="w-full h-full">
                                <line x1="10%" y1="90%" x2="90%" y2="10%" stroke={pduColor} strokeWidth="2" opacity="0.4" />
                              </svg>
                            </div>
                          </div>

                          {/* Vertical line to subfeeds */}
                          <div className="w-0.5 h-3 sm:h-4 bg-gray-600"></div>

                          {/* Subfeeds Grid */}
                          <div className="grid grid-cols-2 gap-1">
                            {Array.from({ length: subfeedsPerPDU }).map((_, sfIdx) => {
                              const subfeedKey = `${pduKey}-S${sfIdx}`;
                              const isSelected = breakerSelection[subfeedKey];
                              
                              // Calculate subfeed load based on networking mode
                              let calculatedSubfeedLoad = 0;
                              if (isSelected) {
                                if (networkedLoadbanks) {
                                  // Lineup-wide networking: distribute lineup load across all selected subfeeds in lineup
                                  const lineupTotalLoad = getLineupLoad(lineup, lineupIdx);
                                  const lineupSubfeedCount = pduArray.reduce((count, pdu) => {
                                    const pk = `PDU-${lineup}-${pdu + 1}`;
                                    return count + Array.from({ length: subfeedsPerPDU }).filter(
                                      (_, j) => breakerSelection[`${pk}-S${j}`]
                                    ).length;
                                  }, 0);
                                  calculatedSubfeedLoad = lineupSubfeedCount > 0 ? lineupTotalLoad / lineupSubfeedCount : 0;
                                } else {
                                  // Per-PDU mode: distribute PDU load across selected subfeeds on this PDU
                                  const selectedCount = Array.from({ length: subfeedsPerPDU }).filter(
                                    (_, j) => breakerSelection[`${pduKey}-S${j}`]
                                  ).length;
                                  calculatedSubfeedLoad = selectedCount > 0 ? pduLoad / selectedCount : 0;
                                }
                              }
                              
                              const subfeedColor = isSelected ? getLoadColor(calculatedSubfeedLoad, maxSubfeedKW) : '#d1d5db';
                              
                              return (
                                <div 
                                  key={sfIdx}
                                  onClick={toggleSubfeed ? () => toggleSubfeed(pduKey, sfIdx) : undefined}
                                  className={`p-1.5 sm:p-2 rounded border text-center shadow-sm ${
                                    isSelected ? 'bg-white' : 'bg-gray-50'
                                  } ${
                                    toggleSubfeed ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                                  }`}
                                  style={{ 
                                    borderColor: subfeedColor,
                                    borderWidth: '2px',
                                    opacity: isSelected ? 1 : 0.5
                                  }}
                                  title={toggleSubfeed ? (isSelected ? 'Click to deselect' : 'Click to select') : ''}
                                >
                                  <div className="text-xs font-bold text-gray-700 mb-0.5">S{sfIdx + 1}</div>
                                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                                    {isSelected && calculatedSubfeedLoad > 0 ? calculatedSubfeedLoad.toFixed(0) : '-'}
                                  </div>
                                  <div className="text-xs text-gray-600">{isSelected ? 'kW' : 'off'}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-xs sm:text-sm text-gray-700">0-60% Load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
            <span className="text-xs sm:text-sm text-gray-700">60-80% Load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-xs sm:text-sm text-gray-700">80-100% Load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-xs sm:text-sm text-gray-700">&gt;100% Overload</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OneLineDiagramView;

