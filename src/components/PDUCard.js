import React from 'react';

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
}) {
  const selectedFeeds = Array.from({ length: subfeedsPerPDU }).filter(
    (_, i) => breakerSelection[`${pduKey}-S${i}`]
  );

  return (
    <div
      className={`${
        pduListLength === 1 ? 'flex-1' : 'flex-[0_1_calc(50%-0.5rem)]'
      } bg-gray-50 p-4 border border-gray-300 rounded-lg`}
    >
      <div className="mb-2 font-semibold">
        <strong>{pduKey}</strong> — Load:
        <input
          type="number"
          value={load}
          onChange={(e) => onChangeLoad(index, e.target.value)}
          className="ml-2 w-24 border border-gray-300 rounded px-2 py-1"
        />
        <span className={`ml-4 ${load > maxKW ? 'text-red-600' : 'text-green-600'}`}>
          {load > maxKW
            ? `Overloaded (>${formatPower(maxKW)})`
            : `OK (<${formatPower(maxKW)})`}
        </span>
      </div>

      <div className="mt-2">
        <label className="font-semibold block mb-1">Subfeeds:</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: subfeedsPerPDU }).map((_, i) => {
            const key = `${pduKey}-S${i}`;
            const isSelected = !!breakerSelection[key];
            const feedLoad =
              isSelected && selectedFeeds.length > 0 ? load / selectedFeeds.length : 0;
            const overLimit = feedLoad > maxSubfeedKW;

            return (
              <label
                key={key}
                className="flex flex-col items-center w-16 text-xs text-center"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSubfeed(pduKey, i)}
                />
                S{i + 1}
                <span className={overLimit ? 'text-red-600' : 'text-gray-500'}>
                  {isSelected ? `${feedLoad.toFixed(2)} kW / ${formatPower(maxSubfeedKW)}` : ''}
                  {overLimit ? ' ⚠️' : ''}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PDUCard;