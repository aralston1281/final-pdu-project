// src/components/OneLineDiagram.js

import React, { useState } from 'react';
import { useRouter } from 'next/router';

function OneLineDiagram({ config, loadData }) {
  const router = useRouter();
  const [showAbout, setShowAbout] = useState(false);

  const lineupMaxKW = config.lineupMaxKW || 1500;
  const reducedCapacityLineups = config.reducedCapacityLineups || {};

  const getLineupMaxKW = (lineup) => {
    return reducedCapacityLineups[lineup] || lineupMaxKW;
  };

  const getLineupLoad = (lineup) => {
    if (!loadData || !loadData.lineupLoads) return 0;
    return loadData.lineupLoads[lineup] || 0;
  };

  const getPDULoad = (pduKey) => {
    if (!loadData || !loadData.pduLoads) return 0;
    return loadData.pduLoads[pduKey] || 0;
  };

  const getDisplayName = (id) => {
    if (config.customNames && config.customNames[id]) {
      return config.customNames[id];
    }
    return id;
  };

  const getLoadColor = (load, max) => {
    const percent = (load / max) * 100;
    if (percent > 100) return '#ef4444'; // red
    if (percent > 80) return '#f59e0b'; // orange
    if (percent > 60) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const totalSystemLoad = config.lineupNames.reduce((sum, lineup) => {
    return sum + getLineupLoad(lineup);
  }, 0);

  const goBackToPlanner = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-gray-200">
        <div className="w-full px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={goBackToPlanner}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
              >
                ← Back
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <img 
                src="/loadflow-pro-logo.svg" 
                alt="LoadFlow Pro" 
                className="h-8"
              />
              {config.jobName && (
                <>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <span className="text-lg font-semibold text-gray-700">{config.jobName}</span>
                </>
              )}
              <span className="text-gray-500 text-sm ml-2">- Single-Line Diagram</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">by Andrew Ralston</span>
              <button
                onClick={() => setShowAbout(true)}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
              >
                ℹ️ About
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-6 py-8">
        {/* System Summary */}
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 font-semibold">Total Load</div>
              <div className="text-2xl font-bold text-blue-600">{(totalSystemLoad / 1000).toFixed(1)} MW</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Active Lineups</div>
              <div className="text-2xl font-bold text-gray-800">{config.lineupNames.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Main Voltage</div>
              <div className="text-2xl font-bold text-gray-800">{config.pduMainVoltage}V</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Main Breaker</div>
              <div className="text-2xl font-bold text-gray-800">{config.pduMainBreakerAmps}A</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 font-semibold">Subfeeds/PDU</div>
              <div className="text-2xl font-bold text-gray-800">{config.subfeedsPerPDU || 8}</div>
            </div>
          </div>
        </div>

        {/* Single-Line Diagram */}
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-8 overflow-x-auto">
          <div className="min-w-max">
            {/* Main Source */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gradient-to-b from-red-600 to-red-700 text-white px-8 py-3 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-xs font-semibold mb-1">MAIN SOURCE</div>
                  <div className="text-xl font-bold">{(totalSystemLoad / 1000).toFixed(1)} MW</div>
                  <div className="text-xs mt-1 opacity-90">{config.pduMainVoltage}V • {config.pduMainBreakerAmps}A</div>
                </div>
              </div>
              <div className="w-0.5 h-8 bg-gray-800"></div>
            </div>

            {/* Main Bus Bar */}
            <div className="relative mb-6">
              <div className="h-1 bg-gray-800"></div>
              {/* Vertical drops to lineups */}
              <div className="absolute top-0 left-0 right-0 flex justify-around">
                {config.lineupNames.map((lineup) => (
                  <div key={lineup} className="w-0.5 h-1 bg-gray-800"></div>
                ))}
              </div>
            </div>

            {/* Lineups - Horizontal Layout */}
            <div className="flex justify-around gap-6">
              {config.lineupNames.map((lineup, lineupIdx) => {
                const lineupLoad = getLineupLoad(lineup);
                const lineupMax = getLineupMaxKW(lineup);
                const lineupColor = getLoadColor(lineupLoad, lineupMax);
                const pduArray = config.pduConfigs[lineupIdx] || [];
                const hasReducedCapacity = reducedCapacityLineups[lineup];

                return (
                  <div key={lineup} className="flex flex-col items-center">
                    {/* Vertical line down to lineup */}
                    <div className="w-0.5 h-6 bg-gray-800"></div>
                    
                    {/* Lineup Box */}
                    <div 
                      className="border-3 rounded-lg p-3 shadow-md min-w-[160px]"
                      style={{ 
                        borderColor: lineupColor, 
                        borderWidth: '3px',
                        backgroundColor: `${lineupColor}15` 
                      }}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <div className="font-bold text-base text-gray-800">{getDisplayName(lineup)}</div>
                          {hasReducedCapacity && (
                            <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              R
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">Max: {lineupMax} kW</div>
                        <div className="text-lg font-bold" style={{ color: lineupColor }}>
                          {lineupLoad.toFixed(0)} kW
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {((lineupLoad / lineupMax) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Vertical line to PDU group */}
                    <div className="w-0.5 h-6 bg-gray-700"></div>

                    {/* PDUs stacked vertically */}
                    <div className="flex flex-col gap-4">
                      {pduArray.map((pduName) => {
                        const pduKey = pduName;
                        const pduLoad = getPDULoad(pduKey);
                        const pduMax = (Math.sqrt(3) * config.pduMainVoltage * config.pduMainBreakerAmps) / 1000;
                        const pduColor = getLoadColor(pduLoad, pduMax);
                        const subfeedsCount = config.subfeedsPerPDU || 8;
                        const subfeedLoad = subfeedsCount > 0 ? pduLoad / subfeedsCount : 0;
                        const maxSubfeedKW = (Math.sqrt(3) * (config.subfeedVoltage || 415) * (config.subfeedBreakerAmps || 400)) / 1000;

                        return (
                          <div key={pduKey} className="flex flex-col items-center">
                            {/* PDU Box */}
                            <div 
                              className="relative border-2 rounded p-2.5 shadow bg-white min-w-[140px]"
                              style={{ borderColor: pduColor }}
                            >
                              <div className="text-center">
                                <div className="font-bold text-sm text-gray-800 mb-0.5">
                                  {getDisplayName(pduKey)}
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                  {config.pduMainVoltage}V • {config.pduMainBreakerAmps}A
                                </div>
                                <div className="font-bold text-sm" style={{ color: pduColor }}>
                                  {pduLoad.toFixed(0)} kW
                                </div>
                                <div className="text-xs text-gray-600">
                                  {((pduLoad / pduMax) * 100).toFixed(0)}%
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
                            <div className="w-0.5 h-4 bg-gray-600"></div>

                            {/* Subfeeds Grid */}
                            <div className="grid grid-cols-2 gap-1">
                              {Array.from({ length: subfeedsCount }).map((_, sfIdx) => {
                                const subfeedColor = getLoadColor(subfeedLoad, maxSubfeedKW);
                                
                                return (
                                  <div 
                                    key={sfIdx}
                                    className="p-2 rounded border text-center bg-white shadow-sm"
                                    style={{ 
                                      borderColor: subfeedColor,
                                      borderWidth: '2px'
                                    }}
                                  >
                                    <div className="text-xs font-bold text-gray-700 mb-0.5">S{sfIdx + 1}</div>
                                    <div className="text-sm font-bold text-gray-900">
                                      {pduLoad > 0 ? subfeedLoad.toFixed(0) : '0'}
                                    </div>
                                    <div className="text-xs text-gray-600">kW</div>
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
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6 mt-8">
          <h3 className="font-bold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm text-gray-700">0-60% Load</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
              <span className="text-sm text-gray-700">60-80% Load</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-sm text-gray-700">80-100% Load</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-sm text-gray-700">&gt;100% Overload</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>© 2025 Andrew Ralston | LoadFlow Pro v1.0</p>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <img 
                src="/loadflow-pro-logo.svg" 
                alt="LoadFlow Pro" 
                className="h-16 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">LoadFlow Pro</h2>
              <p className="text-sm text-gray-600">Version 1.0</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Professional Load Planning for Data Center Commissioning
              </p>
              <p className="text-sm text-gray-600">
                LoadFlow Pro streamlines PDU load distribution planning, commissioning workflows, and capacity management for data center electrical systems.
              </p>
            </div>
            <div className="border-t pt-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Developed by:</strong> Andrew Ralston
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Copyright:</strong> © 2025 Andrew Ralston
              </p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OneLineDiagram;
