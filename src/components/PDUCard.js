import React, { useState } from 'react';
import ProgressBar from '@/components/ProgressBar';

function PDUCard({
  lineup,
  pduIndex,
  pduKey,
  load,
  maxKW,
  index,
  onChangeLoad,
  breakerSelection,
  toggleSubfeed,
  subfeedsPerPDU,
  maxSubfeedKW,
  formatPower,
  pduListLength = 2,
  networkedLoadbanks = true,
  lineupTotalLoad = 0,
  lineupSubfeedCount = 0,
  getDisplayName,
  updateCustomName,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const selectedFeeds = Array.from({ length: subfeedsPerPDU }).filter(
    (_, i) => breakerSelection[`${pduKey}-S${i}`]
  );
  
  const pduSelectedCount = selectedFeeds.length;
  const utilizationPercent = maxKW > 0 ? (load / maxKW) * 100 : 0;

  let statusIcon = '✓';
  let statusColor = 'text-green-600';
  let cardBorder = 'border-green-300';
  
  if (load > maxKW) {
    statusIcon = '❌';
    statusColor = 'text-red-600';
    cardBorder = 'border-red-400';
  } else if (utilizationPercent >= 80) {
    statusIcon = '⚠️';
    statusColor = 'text-orange-600';
    cardBorder = 'border-orange-300';
  } else if (utilizationPercent >= 70) {
    statusIcon = '⚡';
    statusColor = 'text-yellow-600';
    cardBorder = 'border-yellow-300';
  }

  return (
    <div
      className={`w-full sm:${pduListLength === 1 ? 'w-full' : 'w-1/2'} bg-white p-5 border-2 ${cardBorder} rounded-lg shadow-sm hover:shadow-md transition-all`}
    >
      {/* PDU Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span>🔌</span>
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={() => {
                  if (editedName.trim()) {
                    updateCustomName(pduKey, editedName);
                  }
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editedName.trim()) {
                      updateCustomName(pduKey, editedName);
                    }
                    setIsEditingName(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                  }
                }}
                className="font-bold text-lg text-gray-800 border-2 border-blue-500 rounded px-2 py-1 flex-1"
                autoFocus
              />
            ) : (
              <>
                <h4 className="font-bold text-lg text-gray-800">
                  {getDisplayName ? getDisplayName(pduKey) : pduKey}
                </h4>
                {updateCustomName && (
                  <button
                    onClick={() => {
                      setEditedName(getDisplayName ? getDisplayName(pduKey) : pduKey);
                      setIsEditingName(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                    title="Edit PDU name"
                  >
                    ✏️
                  </button>
                )}
              </>
            )}
          </div>
          <span className={`text-2xl ${statusColor}`}>
            {statusIcon}
          </span>
        </div>
        
        {/* Load Input */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-600 block mb-1">Load (kW):</label>
          <input
            type="number"
            value={load}
            onChange={(e) => onChangeLoad(index, e.target.value)}
            className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg px-3 py-2 text-lg font-semibold transition-colors"
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          current={load} 
          max={maxKW}
          label={`${formatPower(load)} / ${formatPower(maxKW)}`}
          height="h-2"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="font-semibold block mb-2 text-gray-700">Subfeeds:</label>
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: subfeedsPerPDU }).map((_, i) => {
            const key = `${pduKey}-S${i}`;
            const isSelected = !!breakerSelection[key];
            
            // Calculate feed load based on mode
            let feedLoad = 0;
            if (isSelected) {
              if (networkedLoadbanks) {
                // Networked: divide lineup total across all lineup subfeeds
                feedLoad = lineupSubfeedCount > 0 ? lineupTotalLoad / lineupSubfeedCount : 0;
              } else {
                // Per-PDU: divide PDU load across this PDU's subfeeds
                feedLoad = pduSelectedCount > 0 ? load / pduSelectedCount : 0;
              }
            }
            
            const overLimit = feedLoad > maxSubfeedKW;
            const utilizationPercent = maxSubfeedKW > 0 ? (feedLoad / maxSubfeedKW) * 100 : 0;
            
            let subfeedBg = 'bg-gray-100 border-gray-300';
            if (isSelected) {
              if (overLimit) subfeedBg = 'bg-red-50 border-red-400';
              else if (utilizationPercent >= 80) subfeedBg = 'bg-orange-50 border-orange-300';
              else if (utilizationPercent >= 70) subfeedBg = 'bg-yellow-50 border-yellow-300';
              else subfeedBg = 'bg-green-50 border-green-300';
            }

            return (
              <label
                key={key}
                className={`flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${subfeedBg} ${
                  isSelected ? 'ring-2 ring-blue-300' : ''
                }`}
                style={{ minWidth: '80px' }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSubfeed(pduKey, i)}
                  className="w-5 h-5 mb-1 cursor-pointer"
                />
                <span className="font-bold text-sm">S{i + 1}</span>
                {isSelected && (
                  <div className="text-xs mt-1 text-center">
                    <div className={`font-semibold ${overLimit ? 'text-red-700' : 'text-gray-700'}`}>
                      {feedLoad.toFixed(1)} kW
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      / {maxSubfeedKW.toFixed(0)}
                    </div>
                    {overLimit && <span className="text-red-600">⚠️</span>}
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PDUCard;
