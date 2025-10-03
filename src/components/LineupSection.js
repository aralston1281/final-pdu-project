import React from 'react';
import PDUCard from '@/components/PDUCard';

function LineupSection({
  lineup,
  pduList,
  lineupIndex,
  pduUsage,
  selectedLineups,
  customDistribution,
  pduMaxKW,
  breakerSelection,
  toggleSubfeed,
  handleCustomChange,
  subfeedsPerPDU,
  maxSubfeedKW,
  lineupWarnings,
  formatPower,
  lineupMaxKW,
  networkedLoadbanks,
}) {
  // Calculate total lineup load
  const lineupTotalLoad = pduList.reduce((total, pdu, pj) => {
    const index = selectedLineups
      .slice(0, lineupIndex)
      .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
    return total + (customDistribution[index] || 0);
  }, 0);
  
  // Calculate total number of selected subfeeds in this lineup
  const lineupSubfeedCount = pduList.reduce((count, pdu) => {
    const pduKey = `PDU-${lineup}-${pdu + 1}`;
    const selectedInThisPDU = Array.from({ length: subfeedsPerPDU }).filter(
      (_, i) => breakerSelection[`${pduKey}-S${i}`]
    ).length;
    return count + selectedInThisPDU;
  }, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Lineup {lineup}
        </h3>
        <div className="text-sm mt-1">
          <span className={lineupWarnings[lineup] ? 'text-red-600 font-bold' : 'text-gray-600'}>
            Total Load: {formatPower(lineupTotalLoad)} / {formatPower(lineupMaxKW)}
            {lineupWarnings[lineup] && ' ⚠️ OVERLOAD!'}
          </span>
        </div>
      </div>
    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        {pduList.map((pdu, pj) => {
          const index =
            selectedLineups
              .slice(0, lineupIndex)
              .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
          const pduKey = `PDU-${lineup}-${pdu + 1}`;
          const load = customDistribution[index] || 0;

          return (
            <PDUCard
              key={pduKey}
              lineup={lineup}
              pduIndex={pdu}
              pduKey={pduKey}
              load={load}
              maxKW={pduMaxKW}
              index={index}
              onChangeLoad={handleCustomChange}
              breakerSelection={breakerSelection}
              toggleSubfeed={toggleSubfeed}
              subfeedsPerPDU={subfeedsPerPDU}
              maxSubfeedKW={maxSubfeedKW}
              formatPower={formatPower}
              pduListLength={pduList.length}
              networkedLoadbanks={networkedLoadbanks}
              lineupTotalLoad={lineupTotalLoad}
              lineupSubfeedCount={lineupSubfeedCount}
            />
          );
        })}
      </div>
    </div>
  );
}

export default LineupSection;
