// src/components/JobConfigPage.js (New Simpler Version — LineupMaxKW driven)

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function JobConfigPage() {
  const router = useRouter();

  const [jobName, setJobName] = useState('');
  const [rawPrefixInput, setRawPrefixInput] = useState('A');
  const [lineupsPerPrefix, setLineupsPerPrefix] = useState(2);
  const [pduPerLineup, setPduPerLineup] = useState(2);
  const [lineupMaxKW, setLineupMaxKW] = useState(1200);
  const [pduMainVoltage, setPduMainVoltage] = useState(480);
  const [subfeedVoltage, setSubfeedVoltage] = useState(415);
  const [saveName, setSaveName] = useState('');
  const [savedNames, setSavedNames] = useState([]);

  useEffect(() => {
    async function fetchConfigNames() {
      try {
        const res = await fetch('/api/list-configs');
        if (!res.ok) throw new Error('List fetch failed');
        const names = await res.json();
        setSavedNames(names);
      } catch (err) {
        console.error('Error fetching config names:', err);
      }
    }
    fetchConfigNames();
  }, []);

  const parsedPrefixes = rawPrefixInput.toUpperCase().split(',').map(x => x.trim()).filter(x => x);

  const lineupNames = parsedPrefixes.flatMap(prefix =>
    Array.from({ length: lineupsPerPrefix }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`)
  );

  const pduConfigs = lineupNames.map(lineup =>
    Array.from({ length: pduPerLineup }, (_, i) => `PDU-${lineup}-${i + 1}`)
  );

  const config = {
    jobName,
    lineupNames,
    pduConfigs,
    lineupMaxKW,
    pduMainVoltage,
    subfeedVoltage,
  };

  const handleStart = () => {
    router.push({
      pathname: '/planner',
      query: { config: JSON.stringify(config) },
    });
  };

  const handleLoad = async () => {
    if (!saveName) return;
    try {
      const loaded = await fetch(`/api/load-config?name=${encodeURIComponent(saveName)}`)
        .then(res => res.json());
      if (loaded) {
        const extractedPrefixes = loaded.lineupNames.map(name => name.replace(/\d+/g, '')).filter((v, i, a) => a.indexOf(v) === i);

        setJobName(loaded.jobName || '');
        setRawPrefixInput(extractedPrefixes.join(',') || 'A');
        setLineupsPerPrefix(loaded.lineupNames.length / extractedPrefixes.length);
        setPduPerLineup(loaded.pduConfigs?.[0]?.length || 2);
        setLineupMaxKW(loaded.lineupMaxKW || 1200);
        setPduMainVoltage(loaded.pduMainVoltage || 480);
        setSubfeedVoltage(loaded.subfeedVoltage || 415);
      }
    } catch (err) {
      console.error('Failed to load configuration', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-bold mb-6">Job Configuration</h2>

        <label className="block font-medium">Load Saved Project:</label>
        <select
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        >
          <option value="">Select...</option>
          {savedNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleLoad}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 w-full rounded mb-4"
        >
          Load Project
        </button>

        <label className="block font-medium">Job Name:</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />

        <label className="block font-medium">Lineup Prefix (comma-separated):</label>
        <input
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={rawPrefixInput}
          onChange={(e) => setRawPrefixInput(e.target.value)}
        />

        <label className="block font-medium">Lineups Per Prefix:</label>
        <input
          type="number"
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          min={1}
          value={lineupsPerPrefix}
          onChange={(e) => setLineupsPerPrefix(Number(e.target.value))}
        />

        <label className="block font-medium">PDUs per Lineup:</label>
        <input
          type="number"
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          min={1}
          value={pduPerLineup}
          onChange={(e) => setPduPerLineup(Number(e.target.value))}
        />

        <h3 className="text-lg font-semibold mt-6">Power Settings</h3>

        <label className="block font-medium">Lineup Max Load (kW):</label>
        <input
          type="number"
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={lineupMaxKW}
          onChange={(e) => setLineupMaxKW(Number(e.target.value))}
        />

        <label className="block font-medium">PDU Main Voltage (V):</label>
        <input
          type="number"
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={pduMainVoltage}
          onChange={(e) => setPduMainVoltage(Number(e.target.value))}
        />

        <label className="block font-medium">Subfeed Voltage (V):</label>
        <input
          type="number"
          className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
          value={subfeedVoltage}
          onChange={(e) => setSubfeedVoltage(Number(e.target.value))}
        />

        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 w-full rounded mt-6"
        >
          Start Planner
        </button>
      </div>
    </div>
  );
}

export default JobConfigPage;
