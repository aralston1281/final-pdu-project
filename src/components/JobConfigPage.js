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

  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <span className="text-6xl">⚡</span>
            Cx Load Planner
          </h1>
          <p className="text-gray-600 text-lg">Configure your PDU load distribution system</p>
        </div>

        {/* Save / Load Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💾</span>
            Manage Projects
          </h3>

          <div className="space-y-4">
            {/* Load Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Load Existing Project</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-white border-2 border-gray-300 focus:border-green-500 text-black px-4 py-3 rounded-lg transition-colors font-medium"
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
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
                >
                  <span>📂</span> Load
                </button>
              </div>
            </div>

            {/* Save New Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Save Current Configuration</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white border-2 border-gray-300 focus:border-blue-500 text-black px-4 py-3 rounded-lg transition-colors"
                  placeholder="Enter project name..."
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
                >
                  <span>💾</span> Save
                </button>
              </div>
            </div>

            {/* Saved Projects Grid */}
            {savedNames.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Saved Projects ({savedNames.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedNames.map((name) => (
                    <div 
                      key={name} 
                      className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all group"
                    >
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        {name}
                      </span>
                      <button
                        onClick={() => handleDelete(name)}
                        className="text-red-500 hover:text-red-700 opacity-60 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Delete project"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Setup Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚙️</span>
            Configuration Settings
          </h3>

          <div className="space-y-6">
            {/* Job Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Project Information
              </h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Name</label>
                <input
                  className="bg-white border-2 border-gray-300 focus:border-blue-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                  placeholder="Enter job name..."
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </div>
            </div>

            {/* Lineup Configuration */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Lineup Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lineup Prefix
                    <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                  </label>
                  <input
                    className="bg-white border-2 border-gray-300 focus:border-purple-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    placeholder="e.g., A,B,C"
                    value={rawPrefixInput}
                    onChange={(e) => setRawPrefixInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lineups Per Prefix</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-purple-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    min={1}
                    value={lineupsPerPrefix}
                    onChange={(e) => setLineupsPerPrefix(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PDUs per Lineup</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-purple-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    min={1}
                    value={pduPerLineup}
                    onChange={(e) => setPduPerLineup(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lineup Max Load (kW)</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-purple-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={lineupMaxKW}
                    onChange={(e) => setLineupMaxKW(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Electrical Configuration */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Electrical Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PDU Main Voltage (V)</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-orange-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={pduMainVoltage}
                    onChange={(e) => setPduMainVoltage(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">PDU Main Breaker (A)</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-orange-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={pduMainBreakerAmps}
                    onChange={(e) => setPduMainBreakerAmps(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subfeed Voltage (V)</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-orange-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={subfeedVoltage}
                    onChange={(e) => setSubfeedVoltage(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subfeed Breaker (A)</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-orange-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={subfeedBreakerAmps}
                    onChange={(e) => setSubfeedBreakerAmps(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lineup and PDU Preview */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 p-6 mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setShowPreview(!showPreview)}
          >
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Preview
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">
                {lineupNames.length} Lineups • {lineupNames.length * pduPerLineup} PDUs
              </span>
              <span className="text-2xl">{showPreview ? '▼' : '▶'}</span>
            </div>
          </div>

          {showPreview && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {lineupNames.map((lineup, index) => (
                  <div key={lineup} className="bg-white p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all">
                    <div className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      {lineup}
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {pduConfigs[index]?.map((pdu) => (
                        <div key={pdu} className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 flex items-center gap-1">
                          <span className="text-base">🔌</span>
                          {pdu}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Planner Button */}
        <button
          onClick={handleStart}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xl px-8 py-5 w-full rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
        >
          <span className="text-3xl">🚀</span>
          Start Load Planner
          <span className="text-3xl">⚡</span>
        </button>

      </div>
    </div>
  );
}

export default JobConfigPage;
