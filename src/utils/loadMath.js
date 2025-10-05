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
  reducedCapacityLineups = {},
}) {
  // Build PDU list with lineup association
  const pduListWithLineup = selectedLineups.flatMap((lineup) =>
    (pduUsage[lineup] || []).map((pduIndex) => {
      // Strip "UPS-" prefix if present for PDU naming
      const lineupForPDU = lineup.replace(/^UPS-/i, '');
      return {
        pduKey: `PDU-${lineupForPDU}-${pduIndex + 1}`,
        lineup: lineup  // Keep original lineup name for tracking
      };
    })
  );

  const distributed = Array(pduListWithLineup.length).fill(0);
  let remainingLoad = targetLoadMW * 1000;
  const lineupUsedKW = {};

  // Helper to get lineup-specific max
  const getLineupMaxKW = (lineup) => {
    return reducedCapacityLineups[lineup] || lineupMaxKW;
  };

  const pduCapacities = pduListWithLineup.map(({ pduKey, lineup }) => {
    const activeFeeds = Array.from({ length: subfeedsPerPDU })
      .map((_, i) => `${pduKey}-S${i}`)
      .filter((k) => breakerSelection[k]);
    const feedCount = activeFeeds.length;
    const cap = feedCount > 0 ? feedCount * maxSubfeedKW : pduMaxKW;
    if (!lineupUsedKW[lineup]) lineupUsedKW[lineup] = 0;
    return cap;
  });

  while (remainingLoad > 0) {
    let anyAllocated = false;
    for (let i = 0; i < distributed.length; i++) {
      const { lineup } = pduListWithLineup[i];
      const cap = pduCapacities[i];
      const maxPerLineup = getLineupMaxKW(lineup);
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
    const maxPerLineup = getLineupMaxKW(lineup);
    if (lineupUsedKW[lineup] >= maxPerLineup) warnings[lineup] = true;
  });

  return {
    distributed,
    unassignedKW: remainingLoad,
    lineupWarnings: warnings,
  };
}
