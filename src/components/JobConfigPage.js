import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trash2 } from 'lucide-react'; 

function JobConfigPage() {
  const router = useRouter();

  const [jobName, setJobName] = useState('');
  const [rawPrefixInput, setRawPrefixInput] = useState('A,B,C,D,E');
  const [lineupsPerPrefix, setLineupsPerPrefix] = useState(2);
  const [pduPerLineup, setPduPerLineup] = useState(2);
  const [lineupMaxKW, setLineupMaxKW] = useState(1500);
  const [pduMainVoltage, setPduMainVoltage] = useState(480);
  const [pduMainBreakerAmps, setPduMainBreakerAmps] = useState(1000);
  const [subfeedVoltage, setSubfeedVoltage] = useState(415);
  const [subfeedBreakerAmps, setSubfeedBreakerAmps] = useState(400);
  const [saveName, setSaveName] = useState('');
  const [savedNames, setSavedNames] = useState([]);
  const [newSaveName, setNewSaveName] = useState('');

  useEffect(() => {
    fetchConfigNames();
  }, []);

  const fetchConfigNames = async () => {
    try {
      const res = await fetch('/api/list-configs');
      if (!res.ok) throw new Error('List fetch failed');
      const names = await res.json();
      setSavedNames(names);
    } catch (err) {
      console.error('Error fetching config names:', err);
    }
  };

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
    pduMainBreakerAmps,
    subfeedVoltage,
    subfeedBreakerAmps,
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
        setPduMainBreakerAmps(loaded.pduMainBreakerAmps || 1000);
        setSubfeedVoltage(loaded.subfeedVoltage || 415);
        setSubfeedBreakerAmps(loaded.subfeedBreakerAmps || 400);
      }
    } catch (err) {
      console.error('Failed to load configuration', err);
    }
  };

  const handleSave = async () => {
    if (!newSaveName) {
      alert('Enter a Save Name');
      return;
    }
    try {
      await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSaveName, config }),
      });
      alert('Saved!');
      setNewSaveName('');
      fetchConfigNames();
    } catch (err) {
      console.error('Failed to save configuration', err);
      alert('Save failed');
    }
  };

  const handleDelete = async (nameToDelete) => {
    if (!confirm(`Are you sure you want to delete "${nameToDelete}"?`)) return;
    try {
      await fetch(`/api/delete-config?name=${encodeURIComponent(nameToDelete)}`, {
        method: 'DELETE',
      });
      alert('Deleted!');
      fetchConfigNames();
    } catch (err) {
      console.error('Failed to delete configuration', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">

        {/* Header */}
        <h2 className="text-4xl font-bold text-center mb-8">Cx Load Planner</h2>

        {/* Save / Load Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Manage Projects</h3>

          <div className="flex items-center gap-2">
            <select
              className="bg-white border border-gray-300 text-black px-3 py-2 rounded w-full"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            >
              <option value="">Select project...</option>
              {savedNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button
              onClick={handleLoad}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              Load
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="bg-white border border-gray-300 text-black px-3 py-2 rounded w-full"
              placeholder="Save as new project..."
              value={newSaveName}
              onChange={(e) => setNewSaveName(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Save
            </button>
          </div>

          {/* Delete List */}
          <div className="mt-4 space-y-2">
            {savedNames.map((name) => (
              <div key={name} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                <span>{name}</span>
                <button
                  onClick={() => handleDelete(name)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Setup Section */}
        <div className="space-y-4 mt-8">
          <h3 className="text-2xl font-semibold">Manual Setup</h3>

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

          <label className="block font-medium">PDU Main Breaker (A):</label>
          <input
            type="number"
            className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
            value={pduMainBreakerAmps}
            onChange={(e) => setPduMainBreakerAmps(Number(e.target.value))}
          />

          <label className="block font-medium">Subfeed Voltage (V):</label>
          <input
            type="number"
            className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
            value={subfeedVoltage}
            onChange={(e) => setSubfeedVoltage(Number(e.target.value))}
          />

          <label className="block font-medium">Subfeed Breaker (A):</label>
          <input
            type="number"
            className="bg-white border border-gray-300 text-black px-3 py-2 w-full rounded"
            value={subfeedBreakerAmps}
            onChange={(e) => setSubfeedBreakerAmps(Number(e.target.value))}
          />
        </div>

        {/* Lineup and PDU Preview */}
<div className="mt-8 space-y-2">
  <h3 className="text-2xl font-semibold">Preview</h3>

  <div className="bg-gray-100 p-4 rounded">
    <div className="space-y-1">
      {lineupNames.map((lineup, index) => (
        <div key={lineup} className="border-b last:border-0 pb-2">
          <div className="font-bold text-lg">{lineup}</div>
          <div className="flex flex-wrap gap-3 mt-1 ml-4 text-gray-700 text-sm">
            {pduConfigs[index]?.map((pdu) => (
              <div key={pdu} className="bg-white border border-gray-300 px-2 py-1 rounded">
                {pdu}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


        {/* Start Planner Button */}
        <button
          onClick={handleStart}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 w-full rounded mt-6"
        >
          Start Planner
        </button>

      </div>
    </div>
  );
}

export default JobConfigPage;
