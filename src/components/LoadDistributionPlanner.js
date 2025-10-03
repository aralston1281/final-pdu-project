// src/components/LoadDistributionPlanner.js (Final - Derated Capacity Respects PDU Usage)

import React, { useState, useEffect } from 'react';
import { parseConfig } from '@/utils/parseConfig';
import { calculateMaxSubfeedKW, autoDistributeLoad } from '@/utils/loadMath';
import LineupSection from '@/components/LineupSection';
import PlannerHeader from '@/components/PlannerHeader';
import CalculationSummary from '@/components/CalculationSummary';

function LoadDistributionPlanner({ config }) {
  const { lineups: initialLineups, pduUsage: defaultPduUsage } = parseConfig(config);
  const [showTutorial, setShowTutorial] = useState(true);
  const [targetLoadMW, setTargetLoadMW] = useState(12);
  const [selectedLineups, setSelectedLineups] = useState(initialLineups);
  const [customDistribution, setCustomDistribution] = useState([]);
  const [breakerSelection, setBreakerSelection] = useState({});
  const [pduUsage, setPduUsage] = useState(() => {
    const usage = {};
    initialLineups.forEach((lineup, idx) => {
      usage[lineup] = (config.pduConfigs[idx] || []).map((_, i) => i);
    });
    return usage;
  });
  const [lineupWarnings, setLineupWarnings] = useState({});
  const [unassignedKW, setUnassignedKW] = useState(0);
  const [networkedLoadbanks, setNetworkedLoadbanks] = useState(true);
  const [autoDistributeEnabled, setAutoDistributeEnabled] = useState(true);

  const subfeedsPerPDU = 8;
  const subfeedVoltage = config.subfeedVoltage || 415;
  const subfeedBreakerAmps = config.subfeedBreakerAmps || 400;
  const pduMainVoltage = config.pduMainVoltage || 480;
  const pduMainBreakerAmps = config.pduMainBreakerAmps || 1000;

  const powerFactor = 1.0;
  const pduMaxKW = calculateMaxSubfeedKW(pduMainVoltage, pduMainBreakerAmps, false, powerFactor);
  const maxSubfeedKW = calculateMaxSubfeedKW(subfeedVoltage, subfeedBreakerAmps, false, powerFactor);
  
  const lineupMaxKW = config.lineupMaxKW || 1500;
  const numberOfPDUsPerLineup = config.pduConfigs?.[0]?.length || 2;

  const activeLineupCapacityKW = selectedLineups.reduce((total, lineup) => {
    const activePDUs = pduUsage[lineup]?.length || 0;
    const lineupCapacity = (lineupMaxKW * (activePDUs / numberOfPDUsPerLineup));
    return total + lineupCapacity;
  }, 0);

  const totalDeratedCapacityMW = (activeLineupCapacityKW * 0.8) / 1000;

  const formatPower = (valueKW) => (valueKW >= 1000 ? `${(valueKW / 1000).toFixed(2)} MW` : `${valueKW.toFixed(2)} kW`);

  const getDefaultBreakerSelection = () => {
    const defaults = {};
    initialLineups.forEach((lineup, lineupIdx) => {
      const pdus = config.pduConfigs?.[lineupIdx] || [];
      pdus.forEach((_, pduIdx) => {
        for (let i = 0; i < 3; i++) {
          defaults[`PDU-${lineup}-${pduIdx + 1}-S${i}`] = true;
        }
      });
    });
    return defaults;
  };

  const resetAll = () => {
    setCustomDistribution([]);
    setBreakerSelection(getDefaultBreakerSelection());
    setPduUsage(() => {
      const usage = {};
      initialLineups.forEach((lineup, idx) => {
        usage[lineup] = (config.pduConfigs[idx] || []).map((_, i) => i);
      });
      return usage;
    });
    setUnassignedKW(0);
  };

  useEffect(() => {
    setBreakerSelection(getDefaultBreakerSelection());
  }, [selectedLineups, pduUsage]);

  const totalPDUs = selectedLineups.reduce(
    (acc, lineup) => acc + (pduUsage[lineup]?.length || 0),
    0
  );
  const evenLoadPerPDU = totalPDUs > 0 ? (targetLoadMW * 1000) / totalPDUs : 0;
  const totalAvailableCapacityMW = ((selectedLineups.length * lineupMaxKW) / 1000).toFixed(2);
  const totalCustomAssignedMW = (customDistribution.reduce((acc, val) => acc + (val || 0), 0) / 1000).toFixed(2);

  // Find overloaded PDUs
  const overloadedPDUs = [];
  selectedLineups.forEach((lineup, lineupIndex) => {
    const pduList = pduUsage[lineup] || [];
    pduList.forEach((pduIdx, pj) => {
      const index = selectedLineups
        .slice(0, lineupIndex)
        .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
      const load = customDistribution[index] || 0;
      if (load > pduMaxKW) {
        overloadedPDUs.push({
          name: `PDU-${lineup}-${pduIdx + 1}`,
          load: load,
          max: pduMaxKW,
          excess: load - pduMaxKW
        });
      }
    });
  });

  // Find overloaded subfeeds
  const overloadedSubfeeds = [];
  selectedLineups.forEach((lineup) => {
    const pduList = pduUsage[lineup] || [];
    pduList.forEach((pduIdx) => {
      const pduKey = `PDU-${lineup}-${pduIdx + 1}`;
      for (let i = 0; i < subfeedsPerPDU; i++) {
        const key = `${pduKey}-S${i}`;
        if (breakerSelection[key]) {
          // Calculate subfeed load based on networking mode
          let subfeedLoad = 0;
          if (networkedLoadbanks) {
            const lineupTotalLoad = (pduUsage[lineup] || []).reduce((total, pdu, pj) => {
              const lineupIndex = selectedLineups.indexOf(lineup);
              const index = selectedLineups
                .slice(0, lineupIndex)
                .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
              return total + (customDistribution[index] || 0);
            }, 0);
            const lineupSubfeedCount = pduList.reduce((count, pdu) => {
              const pk = `PDU-${lineup}-${pdu + 1}`;
              return count + Array.from({ length: subfeedsPerPDU }).filter(
                (_, j) => breakerSelection[`${pk}-S${j}`]
              ).length;
            }, 0);
            subfeedLoad = lineupSubfeedCount > 0 ? lineupTotalLoad / lineupSubfeedCount : 0;
          } else {
            // Per-PDU mode
            const lineupIndex = selectedLineups.indexOf(lineup);
            const pj = pduList.indexOf(pduIdx);
            const index = selectedLineups
              .slice(0, lineupIndex)
              .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
            const pduLoad = customDistribution[index] || 0;
            const selectedCount = Array.from({ length: subfeedsPerPDU }).filter(
              (_, j) => breakerSelection[`${pduKey}-S${j}`]
            ).length;
            subfeedLoad = selectedCount > 0 ? pduLoad / selectedCount : 0;
          }

          if (subfeedLoad > maxSubfeedKW) {
            overloadedSubfeeds.push({
              name: `${pduKey}-S${i + 1}`,
              load: subfeedLoad,
              max: maxSubfeedKW,
              excess: subfeedLoad - maxSubfeedKW
            });
          }
        }
      }
    });
  });

  const handleCustomChange = (index, value) => {
    const updated = [...customDistribution];
    const num = parseFloat(value);
    updated[index] = isNaN(num) ? 0 : Number(num.toFixed(2));
    setCustomDistribution(updated);
  };

  // Check for lineup overload warnings
  useEffect(() => {
    const warnings = {};
    const lineupLoads = {};

    // Calculate total load per lineup
    selectedLineups.forEach((lineup, lineupIndex) => {
      const pduList = pduUsage[lineup] || [];
      let lineupTotalLoad = 0;

      pduList.forEach((pduIdx) => {
        const globalIndex = selectedLineups
          .slice(0, lineupIndex)
          .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pduList.indexOf(pduIdx);
        lineupTotalLoad += customDistribution[globalIndex] || 0;
      });

      lineupLoads[lineup] = lineupTotalLoad;

      // Warn if lineup total exceeds max
      if (lineupTotalLoad > lineupMaxKW) {
        warnings[lineup] = true;
      }
    });

    setLineupWarnings(warnings);
  }, [customDistribution, selectedLineups, pduUsage, lineupMaxKW]);

  const handleSubfeedToggle = (pduKey, subfeedIndex) => {
    setBreakerSelection((prev) => {
      const key = `${pduKey}-S${subfeedIndex}`;
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const toggleLineup = (lineup) => {
    setSelectedLineups((prev) =>
      prev.includes(lineup) ? prev.filter((l) => l !== lineup) : [...prev, lineup]
    );
  };

  const togglePdu = (lineup, pduIndex) => {
    setPduUsage((prev) => {
      const current = prev[lineup] || [];
      const updated = current.includes(pduIndex)
        ? current.filter((p) => p !== pduIndex)
        : [...current, pduIndex].sort();

      const pduKey = `PDU-${lineup}-${pduIndex + 1}`;
      setBreakerSelection((prevBreakers) => {
        const updatedBreakers = { ...prevBreakers };
        for (let i = 0; i < subfeedsPerPDU; i++) {
          delete updatedBreakers[`${pduKey}-S${i}`];
        }
        return updatedBreakers;
      });

      return { ...prev, [lineup]: updated };
    });
  };

  // Auto-distribute when relevant parameters change
  useEffect(() => {
    if (autoDistributeEnabled) {
      const { distributed, unassignedKW, lineupWarnings } = autoDistributeLoad({
        selectedLineups,
        pduUsage,
        breakerSelection,
        subfeedsPerPDU,
        maxSubfeedKW,
        pduMaxKW,
        targetLoadMW,
        lineupMaxKW,
      });

      setCustomDistribution(distributed.map((val) => parseFloat(val.toFixed(2))));
      setUnassignedKW(unassignedKW);
      setLineupWarnings(lineupWarnings);
    }
  }, [targetLoadMW, selectedLineups, pduUsage, breakerSelection, autoDistributeEnabled, subfeedsPerPDU, maxSubfeedKW, pduMaxKW, lineupMaxKW]);

  const autoDistribute = () => {
    const { distributed, unassignedKW, lineupWarnings } = autoDistributeLoad({
      selectedLineups,
      pduUsage,
      breakerSelection,
      subfeedsPerPDU,
      maxSubfeedKW,
      pduMaxKW,
      targetLoadMW,
      lineupMaxKW,
    });

    setCustomDistribution(distributed.map((val) => parseFloat(val.toFixed(2))));
    setUnassignedKW(unassignedKW);
    setLineupWarnings(lineupWarnings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            {config.jobName || 'Load Distribution Planner'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {showTutorial ? (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-6 text-sm relative">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-2 right-2 text-yellow-800 hover:text-yellow-600 font-bold"
              title="Collapse tutorial"
            >
              ×
            </button>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Enter Required Load:</strong> Input target load (MW) you will need.</li>
              <li><strong>Adjust Load:</strong> Manually input kW or use &quot;Auto Distribute&quot; to spread it evenly.</li>
              <li><strong>Select Lineups:</strong> Use the blue/red buttons to toggle lineups.</li>
              <li><strong>Select PDUs:</strong> Use the PDU buttons to enable/disable specific PDUs.</li>
              <li><strong>Adjust Subfeeds:</strong> Check or uncheck the subfeed breakers under each PDU.</li>
              <li><strong>Review Warnings:</strong> Watch for overload or capacity alerts in red/yellow.</li>
              <li><strong>Reset:</strong> Click &quot;Reset&quot; to clear and start over.</li>
            </ul>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setShowTutorial(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-half"
            >
              Show Help
            </button>
          </div>
        )}

        {/* Settings Toggles */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-all">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={autoDistributeEnabled}
                onChange={(e) => setAutoDistributeEnabled(e.target.checked)}
                className="w-6 h-6 mr-4 mt-1 cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔄</span>
                  <span className="font-bold text-lg text-gray-800">Auto-Distribute Load</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {autoDistributeEnabled 
                    ? "✓ Load automatically redistributes when you change settings" 
                    : "Manual mode: Use 'Auto Distribute' button to apply changes"}
                </p>
              </div>
            </label>
          </div>

          <div className="p-5 bg-white rounded-lg border-2 border-purple-200 shadow-sm hover:shadow-md transition-all">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={networkedLoadbanks}
                onChange={(e) => setNetworkedLoadbanks(e.target.checked)}
                className="w-6 h-6 mr-4 mt-1 cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🔗</span>
                  <span className="font-bold text-lg text-gray-800">Networked Loadbanks</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {networkedLoadbanks 
                    ? "✓ Load distributes evenly across ALL subfeeds in each lineup" 
                    : "Per-PDU mode: Load distributes only across each PDU's own subfeeds"}
                </p>
              </div>
            </label>
          </div>
        </div>

        <PlannerHeader
          targetLoadMW={targetLoadMW}
          setTargetLoadMW={setTargetLoadMW}
          autoDistribute={autoDistribute}
          resetAll={resetAll}
          totalPDUs={totalPDUs}
          evenLoadPerPDU={evenLoadPerPDU}
          pduMaxKW={pduMaxKW}
          totalAvailableCapacityMW={totalAvailableCapacityMW}
          totalCustomKW={totalCustomAssignedMW}
          totalDeratedCapacityMW={totalDeratedCapacityMW}
          unassignedKW={unassignedKW}
          autoDistributeEnabled={autoDistributeEnabled}
        />

        {unassignedKW > 0 && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-800">Unassigned Load</p>
                <p className="text-red-700 text-sm mt-1">
                  {formatPower(unassignedKW)} could not be assigned. 
                  <span className="font-semibold"> Suggestions:</span>
                </p>
                <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                  <li>Enable more lineups or PDUs</li>
                  <li>Activate more subfeeds to increase capacity</li>
                  <li>Reduce target load to {((parseFloat(totalCustomAssignedMW) * 1000 - unassignedKW) / 1000).toFixed(2)} MW</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Validation Messages */}
        {parseFloat(totalCustomAssignedMW) > parseFloat(totalAvailableCapacityMW) && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-bold text-red-800">System Overload</p>
                <p className="text-red-700 text-sm mt-1">
                  Load exceeds total system capacity by {((parseFloat(totalCustomAssignedMW) - parseFloat(totalAvailableCapacityMW)) * 1000).toFixed(2)} kW.
                  <span className="font-semibold"> Required action:</span>
                </p>
                <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                  <li>Add {Math.ceil((parseFloat(totalCustomAssignedMW) - parseFloat(totalAvailableCapacityMW)) * 1000 / pduMaxKW)} more PDU(s)</li>
                  <li>Or reduce load to {totalAvailableCapacityMW} MW or less</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Overloaded PDUs Warning */}
        {overloadedPDUs.length > 0 && (
          <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔌</span>
              <div>
                <p className="font-bold text-orange-800">PDU Overload Detected ({overloadedPDUs.length})</p>
                <p className="text-orange-700 text-sm mt-1">
                  The following PDUs exceed their rated capacity:
                </p>
                <div className="mt-2 space-y-1">
                  {overloadedPDUs.slice(0, 5).map((pdu) => (
                    <div key={pdu.name} className="text-sm text-orange-700 ml-4">
                      • <span className="font-semibold">{pdu.name}</span>: {pdu.load.toFixed(2)} kW / {pdu.max.toFixed(2)} kW 
                      <span className="text-red-700 font-bold"> (+{pdu.excess.toFixed(2)} kW over)</span>
                    </div>
                  ))}
                  {overloadedPDUs.length > 5 && (
                    <div className="text-sm text-orange-700 ml-4 italic">
                      ...and {overloadedPDUs.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overloaded Subfeeds Warning */}
        {overloadedSubfeeds.length > 0 && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-yellow-800">Subfeed Breaker Overload ({overloadedSubfeeds.length})</p>
                <p className="text-yellow-700 text-sm mt-1">
                  The following subfeeds exceed their breaker rating:
                </p>
                <div className="mt-2 space-y-1">
                  {overloadedSubfeeds.slice(0, 5).map((subfeed) => (
                    <div key={subfeed.name} className="text-sm text-yellow-700 ml-4">
                      • <span className="font-semibold">{subfeed.name}</span>: {subfeed.load.toFixed(2)} kW / {subfeed.max.toFixed(2)} kW
                      <span className="text-red-700 font-bold"> (+{subfeed.excess.toFixed(2)} kW over)</span>
                    </div>
                  ))}
                  {overloadedSubfeeds.length > 5 && (
                    <div className="text-sm text-yellow-700 ml-4 italic">
                      ...and {overloadedSubfeeds.length - 5} more
                    </div>
                  )}
                </div>
                <p className="text-yellow-700 text-sm mt-2 font-semibold">
                  💡 Tip: {networkedLoadbanks ? 'Activate more subfeeds in the lineup to distribute load' : 'Activate more subfeeds on affected PDUs'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Summary */}
        <CalculationSummary
          totalCustomKW={totalCustomAssignedMW}
          totalAvailableCapacityMW={totalAvailableCapacityMW}
          totalDeratedCapacityMW={totalDeratedCapacityMW}
          totalPDUs={totalPDUs}
          pduMaxKW={pduMaxKW}
          pduMainVoltage={pduMainVoltage}
          pduMainBreakerAmps={pduMainBreakerAmps}
          subfeedVoltage={subfeedVoltage}
          subfeedBreakerAmps={subfeedBreakerAmps}
          selectedLineups={selectedLineups}
          powerFactor={powerFactor}
        />

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📋</span>
              Lineups & PDUs
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedLineups([...initialLineups])}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <span>✓</span> Select All
              </button>
              <button
                onClick={() => setSelectedLineups([])}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <span>✕</span> Deselect All
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {initialLineups.map((lineup) => {
              const lineupIdx = initialLineups.indexOf(lineup);
              const pduArray = config?.pduConfigs?.[lineupIdx] || [];

              return (
                <div key={lineup} className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLineup(lineup)}
                    className={`px-3 py-2 rounded border ${selectedLineups.includes(lineup) ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {lineup}
                  </button>

                  {selectedLineups.includes(lineup) && (
                    <div className="flex gap-2 flex-wrap">
                      {pduArray.map((_, idx) => {
                        const active = pduUsage[lineup]?.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => togglePdu(lineup, idx)}
                            className={`px-2 py-1 rounded border ${active ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}
                          >
                            PDU-{lineup}-{idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedLineups.map((lineup, li) => (
          <LineupSection
            key={lineup}
            lineup={lineup}
            pduList={pduUsage[lineup] || []}
            lineupIndex={li}
            pduUsage={pduUsage}
            selectedLineups={selectedLineups}
            customDistribution={customDistribution}
            pduMaxKW={pduMaxKW}
            lineupMaxKW={lineupMaxKW}
            breakerSelection={breakerSelection}
            toggleSubfeed={handleSubfeedToggle}
            handleCustomChange={handleCustomChange}
            subfeedsPerPDU={subfeedsPerPDU}
            maxSubfeedKW={maxSubfeedKW}
            lineupWarnings={lineupWarnings}
            formatPower={formatPower}
            networkedLoadbanks={networkedLoadbanks}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadDistributionPlanner;
