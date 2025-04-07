import React, { useState, useEffect } from 'react';

async function saveToDatabase(name, config) {
  try {
    const res = await fetch("/api/save-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data: config }),
    });

    const result = await res.json();
    console.log("Saved!", result);
    alert("Configuration saved!");
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save config.");
  }
}

async function loadConfigByName(name) {
  try {
    const res = await fetch(`/api/load-config?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Not found");
    const config = await res.json();
    return config;
  } catch (err) {
    console.error("Load failed:", err);
    alert("Failed to load configuration.");
    return null;
  }
}

async function fetchConfigNames() {
  try {
    const res = await fetch("/api/list-configs");
    if (!res.ok) throw new Error("List fetch failed");
    return await res.json();
  } catch (err) {
    console.error("Error fetching config names:", err);
    return [];
  }
}

function JobConfigPage({ onStart }) {
  const [jobName, setJobName] = useState('');
  const [rawPrefixInput, setRawPrefixInput] = useState('A');
  const [lineupsPerPrefix, setLineupsPerPrefix] = useState(2);
  const [pduPerLineup, setPduPerLineup] = useState(2);
  const [lineupTripSetting, setLineupTripSetting] = useState(1200);
  const [pduMainBreakerTrip, setPduMainBreakerTrip] = useState(996);
  const [pduMainVoltage, setPduMainVoltage] = useState(480);
  const [subfeedBreakerTrip, setSubfeedBreakerTrip] = useState(600);
  const [subfeedVoltage, setSubfeedVoltage] = useState(415);
  const [saveName, setSaveName] = useState("");
  const [savedNames, setSavedNames] = useState([]);

  useEffect(() => {
    fetchConfigNames().then(setSavedNames);
  }, []);

  const parsedPrefixes = rawPrefixInput
    .toUpperCase()
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x);

  const lineupNames = parsedPrefixes.flatMap((prefix) =>
    Array.from({ length: lineupsPerPrefix }, (_, i) =>
      `${prefix}${String(i + 1).padStart(2, '0')}`
    )
  );

  const pduConfigs = lineupNames.map((lineup) =>
    Array.from({ length: pduPerLineup }, (_, i) => `PDU-${lineup}-${i + 1}`)
  );

  const config = {
    jobName,
    lineupNames,
    pduConfigs,
    lineupTripSetting,
    pduMainBreakerTrip,
    pduMainVoltage,
    subfeedBreakerTrip,
    subfeedVoltage
  };

  const handleStart = () => {
    onStart(config);
  };

  const handleLoad = async (selected) => {
    const loaded = await loadConfigByName(selected);
    console.log("Loaded config:", loaded);
    if (loaded) {
      const extractedPrefixes = loaded.lineupNames
        .map(name => name.replace(/\d+/g, ''))
        .filter((v, i, a) => a.indexOf(v) === i);

      setJobName(loaded.jobName || "");
      setRawPrefixInput(extractedPrefixes.join(",") || "A");
      setLineupsPerPrefix(loaded.lineupNames.length / extractedPrefixes.length);
      setPduPerLineup(loaded.pduConfigs?.[0]?.length || 2);
      setLineupTripSetting(loaded.lineupTripSetting);
      setPduMainBreakerTrip(loaded.pduMainBreakerTrip);
      setPduMainVoltage(loaded.pduMainVoltage);
      setSubfeedBreakerTrip(loaded.subfeedBreakerTrip);
      setSubfeedVoltage(loaded.subfeedVoltage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Power Distribution Setup</h2>

        <label className="block mb-1 font-medium">Load Saved Config:</label>
        <select
          onChange={(e) => handleLoad(e.target.value)}
          className="mb-6 w-full bg-white border border-gray-300 text-black px-3 py-2 rounded"
        >
          <option value="">Select config...</option>
          {savedNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <label className="block mb-1 font-medium">Job Name:</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />

        <label className="block mb-1 font-medium">Lineup Prefix (comma separated):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          value={rawPrefixInput}
          onChange={(e) => setRawPrefixInput(e.target.value)}
        />

        <label className="block mb-1 font-medium">Lineups Per Prefix:</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-2"
          type="number"
          min={1}
          value={lineupsPerPrefix}
          onChange={(e) => setLineupsPerPrefix(Number(e.target.value))}
        />
        <div className="text-sm text-gray-600 mb-4">
          Preview: {lineupNames.join(', ')}
        </div>

        <label className="block mb-1 font-medium">PDUs per lineup:</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-2"
          type="number"
          min={1}
          value={pduPerLineup}
          onChange={(e) => setPduPerLineup(Number(e.target.value))}
        />
        <div className="text-sm text-gray-600 mb-4">
          Preview PDUs: {pduConfigs.flat().join(', ')}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Breaker & Voltage Settings</h3>

        <label className="block mb-1">Lineup Trip Setting (A):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          type="number"
          value={lineupTripSetting}
          onChange={(e) => setLineupTripSetting(Number(e.target.value))}
        />

        <label className="block mb-1">PDU Main Breaker Trip (A):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          type="number"
          value={pduMainBreakerTrip}
          onChange={(e) => setPduMainBreakerTrip(Number(e.target.value))}
        />

        <label className="block mb-1">PDU Main Voltage (V):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          type="number"
          value={pduMainVoltage}
          onChange={(e) => setPduMainVoltage(Number(e.target.value))}
        />

        <label className="block mb-1">Subfeed Breaker Trip (A):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-4"
          type="number"
          value={subfeedBreakerTrip}
          onChange={(e) => setSubfeedBreakerTrip(Number(e.target.value))}
        />

        <label className="block mb-1">Subfeed Voltage (V):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded mb-6"
          type="number"
          value={subfeedVoltage}
          onChange={(e) => setSubfeedVoltage(Number(e.target.value))}
        />

        <button
          onClick={handleStart}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
        >
          Start Planner
        </button>

        <div>
          <input
            type="text"
            placeholder="Config name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="bg-white text-black border px-3 py-2 rounded w-full mb-2"
          />
          <button
            onClick={() => saveToDatabase(saveName, config)}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Save Config
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobConfigPage;
