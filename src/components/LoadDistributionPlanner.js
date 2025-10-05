// src/components/LoadDistributionPlanner.js (Final - Derated Capacity Respects PDU Usage)

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { parseConfig } from '@/utils/parseConfig';
import { calculateMaxSubfeedKW, autoDistributeLoad } from '@/utils/loadMath';
import LineupSection from '@/components/LineupSection';
import PlannerHeader from '@/components/PlannerHeader';
import CalculationSummary from '@/components/CalculationSummary';

function LoadDistributionPlanner({ config }) {
  const router = useRouter();
  const { lineups: initialLineups, pduUsage: defaultPduUsage } = parseConfig(config);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLineupSelector, setShowLineupSelector] = useState(false);
  const [showCommissioningPresets, setShowCommissioningPresets] = useState(false);
  const [targetLoadMW, setTargetLoadMW] = useState(12);
  const [selectedLineups, setSelectedLineups] = useState(initialLineups);
  const [customDistribution, setCustomDistribution] = useState([]);
  const [breakerSelection, setBreakerSelection] = useState({});
  const [customNames, setCustomNames] = useState(config.customNames || {});
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

  const subfeedsPerPDU = config.subfeedsPerPDU || 8;
  const subfeedVoltage = config.subfeedVoltage || 415;
  const subfeedBreakerAmps = config.subfeedBreakerAmps || 400;
  const pduMainVoltage = config.pduMainVoltage || 480;
  const pduMainBreakerAmps = config.pduMainBreakerAmps || 1000;

  const powerFactor = 1.0;
  const pduMaxKW = calculateMaxSubfeedKW(pduMainVoltage, pduMainBreakerAmps, false, powerFactor);
  const maxSubfeedKW = calculateMaxSubfeedKW(subfeedVoltage, subfeedBreakerAmps, false, powerFactor);
  
  const lineupMaxKW = config.lineupMaxKW || 1500;
  const numberOfPDUsPerLineup = config.pduConfigs?.[0]?.length || 2;
  const reducedCapacityLineups = config.reducedCapacityLineups || {};

  // Helper function to get max kW for a specific lineup
  const getLineupMaxKW = (lineup) => {
    return reducedCapacityLineups[lineup] || lineupMaxKW;
  };

  const getDisplayName = (id) => {
    return customNames[id] || id;
  };

  const updateCustomName = (id, newName) => {
    setCustomNames(prev => ({
      ...prev,
      [id]: newName.trim() || id
    }));
  };

  const activeLineupCapacityKW = selectedLineups.reduce((total, lineup) => {
    const activePDUs = pduUsage[lineup]?.length || 0;
    const lineupMax = getLineupMaxKW(lineup);
    const lineupCapacity = (lineupMax * (activePDUs / numberOfPDUsPerLineup));
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

      // Warn if lineup total exceeds max (use lineup-specific max)
      const currentLineupMaxKW = getLineupMaxKW(lineup);
      if (lineupTotalLoad > currentLineupMaxKW) {
        warnings[lineup] = true;
      }
    });

    setLineupWarnings(warnings);
  }, [customDistribution, selectedLineups, pduUsage, lineupMaxKW, reducedCapacityLineups]);

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
        reducedCapacityLineups,
      });

      setCustomDistribution(distributed.map((val) => parseFloat(val.toFixed(2))));
      setUnassignedKW(unassignedKW);
      setLineupWarnings(lineupWarnings);
    }
  }, [targetLoadMW, selectedLineups, pduUsage, breakerSelection, autoDistributeEnabled, subfeedsPerPDU, maxSubfeedKW, pduMaxKW, lineupMaxKW, reducedCapacityLineups]);

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
      reducedCapacityLineups,
    });

    setCustomDistribution(distributed.map((val) => parseFloat(val.toFixed(2))));
    setUnassignedKW(unassignedKW);
    setLineupWarnings(lineupWarnings);
  };

  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleSaveConfig = async () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this configuration');
      return;
    }

    const configToSave = {
      ...config,
      customNames
    };

    try {
      await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName, config: configToSave }),
      });
      alert('Configuration saved successfully!');
      setShowSaveDialog(false);
      setSaveName('');
    } catch (err) {
      console.error('Failed to save configuration', err);
      alert('Failed to save configuration');
    }
  };

  // Commissioning Test Presets
  const applySubfeedBreakerTest = () => {
    // Load each subfeed to 100% of its breaker rating
    const newDistribution = [];
    selectedLineups.forEach((lineup) => {
      const pduList = pduUsage[lineup] || [];
      pduList.forEach(() => {
        // Load PDU to full subfeed capacity
        newDistribution.push(maxSubfeedKW * subfeedsPerPDU);
      });
    });
    setCustomDistribution(newDistribution);
  };

  const applyPDUMainBreakerTest = () => {
    // Load each PDU to 100% of main breaker rating
    const newDistribution = [];
    selectedLineups.forEach((lineup) => {
      const pduList = pduUsage[lineup] || [];
      pduList.forEach(() => {
        newDistribution.push(pduMaxKW);
      });
    });
    setCustomDistribution(newDistribution);
  };

  const applyUPSBurnIn = () => {
    // Load each lineup to its configured max capacity
    const newDistribution = [];
    selectedLineups.forEach((lineup) => {
      const pduList = pduUsage[lineup] || [];
      const lineupMax = getLineupMaxKW(lineup); // Use actual lineup max (respects reduced capacity)
      const loadPerPDU = pduList.length > 0 ? lineupMax / pduList.length : 0;
      pduList.forEach(() => {
        newDistribution.push(loadPerPDU);
      });
    });
    setCustomDistribution(newDistribution);
  };

  const applyEfficientCompleteBurnIn = () => {
    // Smart burn-in: Use minimum PDUs needed to reach 100% lineup capacity
    // Most efficient - tests maximum equipment with minimum PDUs/subfeeds
    const newDistribution = [];
    const newBreakerSelection = {};
    const newPduUsage = {};
    
    initialLineups.forEach((lineup) => {
      const lineupConfigIdx = initialLineups.indexOf(lineup);
      const pduNamesInLineup = config.pduConfigs[lineupConfigIdx] || [];
      const lineupMax = getLineupMaxKW(lineup);
      const targetLineupLoad = lineupMax; // 100% of lineup capacity
      
      // Calculate how many PDUs we need at full capacity
      const pdusNeeded = Math.ceil(targetLineupLoad / pduMaxKW);
      const actualPdusToUse = Math.min(pdusNeeded, pduNamesInLineup.length);
      
      if (selectedLineups.includes(lineup)) {
        // Enable only the PDUs we need
        const activePduIndices = [];
        for (let i = 0; i < actualPdusToUse; i++) {
          activePduIndices.push(i);
        }
        newPduUsage[lineup] = activePduIndices;
        
        // Distribute load evenly across the active PDUs
        const loadPerPDU = actualPdusToUse > 0 ? targetLineupLoad / actualPdusToUse : 0;
        
        activePduIndices.forEach((pduIdx) => {
          newDistribution.push(loadPerPDU);
          
          // Enable ALL subfeeds for active PDUs
          const pduKey = pduNamesInLineup[pduIdx];
          if (pduKey) {
            for (let i = 0; i < subfeedsPerPDU; i++) {
              newBreakerSelection[`${pduKey}-S${i}`] = true;
            }
          }
        });
      } else {
        // Lineup not selected, keep original usage
        newPduUsage[lineup] = pduUsage[lineup] || [];
      }
    });
    
    setCustomDistribution(newDistribution);
    setBreakerSelection(newBreakerSelection);
    setPduUsage(newPduUsage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b-2 border-gray-200">
        <div className="px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/loadflow-pro-logo.svg" 
                alt="LoadFlow Pro" 
                className="h-10"
              />
              {config.jobName && (
                <>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <span className="text-lg font-semibold text-gray-700">{config.jobName}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600">by Andrew Ralston</span>
              <button
                onClick={() => setShowAbout(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded hover:bg-blue-50"
              >
                ℹ️ About
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Control Bar */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-white border-b-2 border-gray-200 shadow-md py-2">
        <div className="px-2 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            {/* Load Info */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">Target:</span>
                <input
                  type="number"
                  value={targetLoadMW}
                  onChange={(e) => setTargetLoadMW(Number(e.target.value))}
                  className="bg-white border-2 border-gray-300 focus:border-blue-500 px-2 py-1 rounded w-16 text-sm font-bold transition-colors"
                  min={0}
                  step={0.1}
                />
                <span className="text-xs sm:text-sm font-semibold text-gray-600">MW</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">Load:</span>
                <span className="text-sm sm:text-lg font-bold text-blue-600">{totalCustomAssignedMW} MW</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Cap:</span>
                <span className="text-sm font-bold text-gray-700">{totalAvailableCapacityMW} MW</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  // Prepare load data to pass to diagram
                  const lineupLoads = {};
                  const pduLoads = {};
                  
                  selectedLineups.forEach((lineup, lineupIndex) => {
                    const pduList = pduUsage[lineup] || [];
                    let lineupTotalLoad = 0;
                    
                    pduList.forEach((pduIdx, pj) => {
                      const globalIndex = selectedLineups
                        .slice(0, lineupIndex)
                        .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
                      const load = customDistribution[globalIndex] || 0;
                      lineupTotalLoad += load;
                      
                      // Strip "UPS-" for PDU key to match config.pduConfigs
                      const lineupForPDU = lineup.replace(/^UPS-/i, '');
                      const pduKey = `PDU-${lineupForPDU}-${pduIdx + 1}`;
                      pduLoads[pduKey] = load;
                    });
                    
                    lineupLoads[lineup] = lineupTotalLoad;
                  });
                  
                  const loadData = { lineupLoads, pduLoads };
                  
                  // Include custom names in config
                  const configWithNames = {
                    ...config,
                    customNames
                  };
                  
                  router.push({
                    pathname: '/diagram',
                    query: { 
                      config: JSON.stringify(configWithNames),
                      loadData: JSON.stringify(loadData)
                    },
                  });
                }}
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all"
              >
                Diagram
              </button>
              <button
                onClick={autoDistribute}
                disabled={autoDistributeEnabled}
                className={`text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${
                  autoDistributeEnabled 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Auto
              </button>
              <button
                onClick={resetAll}
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-6 pb-10 pt-[160px] sm:pt-[130px]">

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

        {/* Full Controls Section (Non-sticky) */}
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
          setAutoDistributeEnabled={setAutoDistributeEnabled}
          networkedLoadbanks={networkedLoadbanks}
          setNetworkedLoadbanks={setNetworkedLoadbanks}
        />

        {unassignedKW > 0 && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-6">
            <div className="flex items-start gap-3">
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
                  Tip: {networkedLoadbanks ? 'Activate more subfeeds in the lineup to distribute load' : 'Activate more subfeeds on affected PDUs'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commissioning Test Presets */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-100 overflow-hidden mb-6">
          <div 
            className="p-3 cursor-pointer hover:bg-purple-50 transition-colors flex items-center justify-between"
            onClick={() => setShowCommissioningPresets(!showCommissioningPresets)}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                Commissioning Test Presets
              </h3>
              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-bold">
                Coming Soon
              </span>
            </div>
            <span className="text-xl text-gray-600">{showCommissioningPresets ? '▼' : '▶'}</span>
          </div>

          {showCommissioningPresets && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">
                Quick load configurations for common commissioning scenarios
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="relative">
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-3 py-2 rounded-lg cursor-not-allowed opacity-70"
                  >
                    <div className="text-base mb-0.5">🔥</div>
                    <div className="text-xs">Subfeed Breaker</div>
                    <div className="text-xs opacity-80 mt-0.5">100% All Subfeeds</div>
                  </button>
                  <div className="absolute top-1 right-1">
                    <span className="text-white font-bold text-xs bg-gray-900 bg-opacity-80 px-2 py-0.5 rounded shadow">Coming Soon</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-3 py-2 rounded-lg cursor-not-allowed opacity-70"
                  >
                    <div className="text-xs">PDU Main Breaker</div>
                    <div className="text-xs opacity-80 mt-0.5">100% Each PDU</div>
                  </button>
                  <div className="absolute top-1 right-1">
                    <span className="text-white font-bold text-xs bg-gray-900 bg-opacity-80 px-2 py-0.5 rounded shadow">Coming Soon</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-3 py-2 rounded-lg cursor-not-allowed opacity-70"
                  >
                    <div className="text-xs">Efficient Complete Burn In</div>
                    <div className="text-xs opacity-80 mt-0.5">100% Min PDUs+Subfeeds</div>
                  </button>
                  <div className="absolute top-1 right-1">
                    <span className="text-white font-bold text-xs bg-gray-900 bg-opacity-80 px-2 py-0.5 rounded shadow">Coming Soon</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-3 py-2 rounded-lg cursor-not-allowed opacity-70"
                  >
                    <div className="text-base mb-0.5">🏭</div>
                    <div className="text-xs">UPS/Lineup Burn-in</div>
                    <div className="text-xs opacity-80 mt-0.5">100% Max Capacity</div>
                  </button>
                  <div className="absolute top-1 right-1">
                    <span className="text-white font-bold text-xs bg-gray-900 bg-opacity-80 px-2 py-0.5 rounded shadow">Coming Soon</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-gray-700">
                <strong>Efficient Complete Burn In</strong> will auto-select minimum PDUs needed to reach 100% lineup capacity. Tests max equipment in minimum burn cycles!
              </div>
            </div>
          )}
        </div>

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
          config={config}
        />

        <div className="mt-8 bg-white rounded-lg shadow-lg border-2 border-indigo-100 overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-between"
            onClick={() => setShowLineupSelector(!showLineupSelector)}
          >
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
              Lineups & PDUs
            </h3>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-semibold">
                {selectedLineups.length}/{initialLineups.length} lineups • {totalPDUs} PDUs
              </span>
            </div>
            <span className="text-2xl text-gray-600">{showLineupSelector ? '▼' : '▶'}</span>
          </div>

          {showLineupSelector && (
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex gap-2 w-full sm:w-auto mb-4">
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
          )}
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
            lineupMaxKW={getLineupMaxKW(lineup)}
            defaultLineupMaxKW={lineupMaxKW}
            breakerSelection={breakerSelection}
            toggleSubfeed={handleSubfeedToggle}
            handleCustomChange={handleCustomChange}
            subfeedsPerPDU={subfeedsPerPDU}
            maxSubfeedKW={maxSubfeedKW}
            lineupWarnings={lineupWarnings}
            formatPower={formatPower}
            networkedLoadbanks={networkedLoadbanks}
            getDisplayName={getDisplayName}
            updateCustomName={updateCustomName}
          />
        ))}

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

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Save Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Save your current load distribution and custom names for later use.
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter configuration name..."
              className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveConfig();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadDistributionPlanner;
