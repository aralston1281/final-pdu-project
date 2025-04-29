// src/utils/loadMath.js (Final version with Lineup 80% derate applied)

export function calculateMaxSubfeedKW(voltage, breakerAmps, derate = false, powerFactor = 1.0) {
  const rawKW = (Math.sqrt(3) * voltage * breakerAmps * powerFactor) / 1000;
  return derate ? rawKW * 0.8 : rawKW;
}

export function autoDistributeLoad({
  selectedLineups,
  pduUsage,
  breakerSelection,
  subfeedsPerPDU,
  maxSubfeedKW,
  pduMaxKW,
  targetLoadMW,
  lineupMaxKW,
}) {
  const pduList = selectedLineups.flatMap((lineup) =>
    (pduUsage[lineup] || []).map((pduIndex) => `PDU-${lineup}-${pduIndex + 1}`)
  );

  const distributed = Array(pduList.length).fill(0);
  let remainingLoad = targetLoadMW * 1000;
  const lineupUsedKW = {};

  const pduCapacities = pduList.map((pduKey) => {
    const activeFeeds = Array.from({ length: subfeedsPerPDU })
      .map((_, i) => `${pduKey}-S${i}`)
      .filter((k) => breakerSelection[k]);
    const feedCount = activeFeeds.length;
    const cap = feedCount > 0 ? feedCount * maxSubfeedKW : pduMaxKW;
    const lineup = pduKey.split('-')[1];
    if (!lineupUsedKW[lineup]) lineupUsedKW[lineup] = 0;
    return cap;
  });

  const maxPerLineup = lineupMaxKW ; // Always derate Lineup to 80%

  while (remainingLoad > 0) {
    let anyAllocated = false;
    for (let i = 0; i < distributed.length; i++) {
      const pduKey = pduList[i];
      const cap = pduCapacities[i];
      const lineup = pduKey.split('-')[1];
      const current = distributed[i];
      const totalLineupLoad = lineupUsedKW[lineup] || 0;
      if (current >= cap || totalLineupLoad >= maxPerLineup) continue;

      const available = Math.min(cap - current, maxPerLineup - totalLineupLoad, 10);
      distributed[i] += available;
      lineupUsedKW[lineup] = totalLineupLoad + available;
      remainingLoad -= available;
      anyAllocated = true;
      if (remainingLoad <= 0) break;
    }
    if (!anyAllocated) break;
  }

  const warnings = {};
  Object.keys(lineupUsedKW).forEach((lineup) => {
    if (lineupUsedKW[lineup] >= maxPerLineup) warnings[lineup] = true;
  });

  return {
    distributed,
    unassignedKW: remainingLoad,
    lineupWarnings: warnings,
  };
}
