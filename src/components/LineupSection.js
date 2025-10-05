import React, { useState } from 'react';
import PDUCard from '@/components/PDUCard';
import ProgressBar from '@/components/ProgressBar';

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
  defaultLineupMaxKW = 1500,
  getDisplayName,
  updateCustomName,
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

  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Check if any PDU in this lineup is overloaded
  const hasOverloadedPDU = pduList.some((pdu, pj) => {
    const index = selectedLineups
      .slice(0, lineupIndex)
      .reduce((acc, l) => acc + (pduUsage[l]?.length || 0), 0) + pj;
    const load = customDistribution[index] || 0;
    return load > pduMaxKW;
  });

  // Determine overall lineup status
  const isOverloaded = lineupWarnings[lineup] || hasOverloadedPDU;
  const isHighLoad = !isOverloaded && lineupTotalLoad > lineupMaxKW * 0.8;
  const hasReducedCapacity = lineupMaxKW < defaultLineupMaxKW;

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 mb-6 overflow-hidden transition-all hover:shadow-lg">
      {/* Lineup Header - Always Visible */}
      <div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {isExpanded ? '▼' : '▶'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => {
                      if (editedName.trim()) {
                        updateCustomName(lineup, editedName);
                      }
                      setIsEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editedName.trim()) {
                          updateCustomName(lineup, editedName);
                        }
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xl font-bold text-gray-800 border-2 border-blue-500 rounded px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getDisplayName ? getDisplayName(lineup) : lineup}
                    </h3>
                    {updateCustomName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditedName(getDisplayName ? getDisplayName(lineup) : lineup);
                          setIsEditingName(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit lineup name"
                      >
                        ✏️
                      </button>
                    )}
                  </>
                )}
                {hasReducedCapacity && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <span>🔧</span> Reduced
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {pduList.length} PDU{pduList.length !== 1 ? 's' : ''} • {lineupSubfeedCount} Active Subfeeds
                {hasReducedCapacity && (
                  <span className="text-orange-600 font-semibold ml-2">
                    • Max: {formatPower(lineupMaxKW)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
            isOverloaded
              ? 'bg-red-100 text-red-800 border-2 border-red-300' 
              : isHighLoad
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
              : 'bg-green-100 text-green-800 border-2 border-green-300'
          }`}>
            {isOverloaded ? '⚠️ OVERLOAD' : isHighLoad ? '⚡ High Load' : '✓ OK'}
          </div>
        </div>
        
        {/* Progress Bar in Header */}
        <div className="mt-3">
          <ProgressBar 
            current={lineupTotalLoad} 
            max={lineupMaxKW}
            label={`${formatPower(lineupTotalLoad)} / ${formatPower(lineupMaxKW)}`}
            height="h-3"
          />
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 bg-white">
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
                  getDisplayName={getDisplayName}
                  updateCustomName={updateCustomName}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineupSection;
