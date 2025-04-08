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
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Lineup {lineup}{' '}
        {lineupWarnings[lineup] && (
          <span className="text-red-600">⚠️ Max capacity reached</span>
        )}
      </h3>
      <div className={`flex flex-wrap gap-4 ${pduList.length === 1 ? 'justify-center' : 'justify-start'}`}>
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
            />
          );
        })}
      </div>
    </div>
  );
}

export default LineupSection;