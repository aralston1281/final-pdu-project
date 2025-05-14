// src/components/LoadDistributionPlanner.js (Final - Derated Capacity Respects PDU Usage)

import React, { useState, useEffect } from 'react';
import { parseConfig } from '@/utils/parseConfig';
import { calculateMaxSubfeedKW, autoDistributeLoad } from '@/utils/loadMath';
import LineupSection from '@/components/LineupSection';
import PlannerHeader from '@/components/PlannerHeader';

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

  const subfeedsPerPDU = 8;
  const subfeedVoltage = config.subfeedVoltage || 415;

  const lineupMaxKW = config.lineupMaxKW || 1500;
  const numberOfPDUsPerLineup = config.pduConfigs?.[0]?.length || 2;
  const pduMaxKW = lineupMaxKW / numberOfPDUsPerLineup;

  const powerFactor = 1.0;
  const subfeedBreakerAmps = 600;
  const maxSubfeedKW = calculateMaxSubfeedKW(subfeedVoltage, subfeedBreakerAmps, false, powerFactor);

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
  const totalAvailableCapacityMW = ((totalPDUs * pduMaxKW) / 1000).toFixed(2);
  const totalCustomAssignedMW = (customDistribution.reduce((acc, val) => acc + (val || 0), 0) / 1000).toFixed(2);

  const handleCustomChange = (index, value) => {
    const updated = [...customDistribution];
    updated[index] = Number(parseFloat(value).toFixed(2));
    setCustomDistribution(updated);
  };

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
      return { ...prev, [lineup]: updated };
    });
  };

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6">{config.jobName} — Load Distribution Planner</h1>
        {showTutorial ? (
  <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-6 text-sm relative">
    <button
      onClick={() => setShowTutorial(false)}
      className="absolute top-2 right-2 text-yellow-800 hover:text-yellow-600 font-bold"
      title="Collapse tutorial"
    >
      ×
    </button>
    <strong>👋 Roman, read this carefully. Then scroll back up and read it like you actually mean it!</strong>
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li><strong>Enter Required Load:</strong> Input target load (MW) you will need.</li>
      <li><strong>Adjust Load:</strong> Manually input kW or use "Auto Distribute" to spread it evenly.</li>
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
className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded w-half"    >
      Show Help
    </button>
  </div>
)}


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
        />

        {/* Load Distribution Section */}
        {unassignedKW > 0 && (
          <div className="text-red-600 font-bold mt-6">
            ⚠️ {formatPower(unassignedKW)} could not be assigned due to selected system limits.
          </div>
        )}
        
        
        {/* Lineups and PDUs Display */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Lineups & PDUs in Use</h3>
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
            breakerSelection={breakerSelection}
            toggleSubfeed={handleSubfeedToggle}
            handleCustomChange={handleCustomChange}
            subfeedsPerPDU={subfeedsPerPDU}
            maxSubfeedKW={maxSubfeedKW}
            lineupWarnings={lineupWarnings}
            formatPower={formatPower}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadDistributionPlanner;
