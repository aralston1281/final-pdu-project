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
  const [subfeedsPerPDU, setSubfeedsPerPDU] = useState(8);
  const [loadbankMaxKW, setLoadbankMaxKW] = useState(600);
  const [saveName, setSaveName] = useState('');
  const [savedNames, setSavedNames] = useState([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [reducedCapacityKW, setReducedCapacityKW] = useState(400);
  const [selectedReducedCapacityLineups, setSelectedReducedCapacityLineups] = useState([]);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    fetchConfigNames();
  }, []);

  const fetchConfigNames = async () => {
    try {
      const res = await fetch('/api/list-configs', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error('List fetch failed');
      const names = await res.json();
      setSavedNames(names);
    } catch (err) {
      console.error('Error fetching config names:', err);
    }
  };

  // Parse lineup names - support both simple prefixes and custom full names
  const rawInput = rawPrefixInput.trim();
  const inputItems = rawInput.split(/[\n,]/).map(x => x.trim()).filter(x => x);
  
  // Detect if using custom names (contains dashes or longer names) or simple prefixes
  const isCustomMode = inputItems.some(item => item.includes('-') || item.length > 3);
  
  let lineupNames;
  if (isCustomMode) {
    // Custom mode: use the names as-is
    lineupNames = inputItems.map(name => name.toUpperCase());
  } else {
    // Simple mode: generate from prefixes
    const parsedPrefixes = inputItems.map(x => x.toUpperCase());
    lineupNames = parsedPrefixes.flatMap(prefix =>
      Array.from({ length: lineupsPerPrefix }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`)
    );
  }

  const pduConfigs = lineupNames.map(lineup => {
    // Strip "UPS-" prefix from lineup name for PDU naming
    const lineupForPDU = lineup.replace(/^UPS-/i, '');
    return Array.from({ length: pduPerLineup }, (_, i) => `PDU-${lineupForPDU}-${i + 1}`);
  });

  // Create reduced capacity mapping for selected lineups
  const reducedCapacityLineups = {};
  selectedReducedCapacityLineups.forEach(lineup => {
    reducedCapacityLineups[lineup] = reducedCapacityKW;
  });

  const config = {
    jobName,
    lineupNames,
    pduConfigs,
    lineupMaxKW,
    pduMainVoltage,
    pduMainBreakerAmps,
    subfeedVoltage,
    subfeedBreakerAmps,
    subfeedsPerPDU,
    loadbankMaxKW,
    reducedCapacityLineups,
    customNames: {},  // Will be populated when loaded
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
      const loaded = await fetch(`/api/load-config?name=${encodeURIComponent(saveName)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).then(res => res.json());
      if (loaded) {
        setJobName(loaded.jobName || '');
        
        // Restore lineup names - just use them directly
        if (loaded.lineupNames && loaded.lineupNames.length > 0) {
          // Check if they look like simple generated names (A01, B01, etc.)
          const firstLineup = loaded.lineupNames[0];
          const isSimpleMode = /^[A-Z]0\d$/.test(firstLineup);
          
          if (isSimpleMode) {
            // Extract unique prefixes for simple mode
            const extractedPrefixes = loaded.lineupNames
              .map(name => name.replace(/\d+/g, ''))
              .filter((v, i, a) => a.indexOf(v) === i);
            setRawPrefixInput(extractedPrefixes.join(',') || 'A');
            setLineupsPerPrefix(Math.max(1, Math.floor(loaded.lineupNames.length / extractedPrefixes.length)));
          } else {
            // Custom mode - just list all the lineup names
            setRawPrefixInput(loaded.lineupNames.join(', '));
            setLineupsPerPrefix(2); // Default, won't be used in custom mode
          }
        } else {
          setRawPrefixInput('A');
          setLineupsPerPrefix(2);
        }
        
        setPduPerLineup(loaded.pduConfigs?.[0]?.length || 2);
        setLineupMaxKW(loaded.lineupMaxKW || 1200);
        setPduMainVoltage(loaded.pduMainVoltage || 480);
        setPduMainBreakerAmps(loaded.pduMainBreakerAmps || 1000);
        setSubfeedVoltage(loaded.subfeedVoltage || 415);
        setSubfeedBreakerAmps(loaded.subfeedBreakerAmps || 400);
        setSubfeedsPerPDU(loaded.subfeedsPerPDU || 8);
        setLoadbankMaxKW(loaded.loadbankMaxKW || 600);
        
        // Load reduced capacity configuration
        if (loaded.reducedCapacityLineups) {
          const reducedLineups = Object.keys(loaded.reducedCapacityLineups);
          setSelectedReducedCapacityLineups(reducedLineups);
          if (reducedLineups.length > 0) {
            const firstValue = loaded.reducedCapacityLineups[reducedLineups[0]];
            setReducedCapacityKW(firstValue || 400);
          }
        } else {
          setSelectedReducedCapacityLineups([]);
          setReducedCapacityKW(400);
        }
        
        // Custom names are handled automatically when passed to config
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">by Andrew Ralston</span>
              <button
                onClick={() => router.push('/tutorial')}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors px-3 py-1.5 rounded hover:bg-purple-50"
              >
                Tutorial
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded hover:bg-blue-50"
              >
                About
              </button>
            </div>
          </div>
          <div className="text-center">
            <img 
              src="/loadflow-pro-logo.svg" 
              alt="LoadFlow Pro" 
              className="h-20 mx-auto mb-4"
            />
            <p className="text-gray-600 text-lg">Professional Load Planning for Data Center Commissioning</p>
          </div>
        </div>

        {/* Save / Load Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
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
                  Save
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
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
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
              
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Two naming modes:</strong>
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Simple:</strong> Use prefix + number (A,B,C → A01, A02, B01, B02)
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Custom:</strong> Enter exact lineup names below (UPS-1-1A, UPS-1-1B, etc.)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lineup Names
                    <span className="text-xs text-gray-500 ml-2">(comma-separated or one per line)</span>
                  </label>
                  <textarea
                    className="bg-white border-2 border-gray-300 focus:border-purple-500 text-black px-4 py-3 w-full rounded-lg transition-colors font-mono text-sm"
                    placeholder="Simple: A,B,C,D,E&#10;or Custom: UPS-1-1A, UPS-1-1B, UPS-1-1C, UPS-1-2A, UPS-1-2B"
                    value={rawPrefixInput}
                    onChange={(e) => setRawPrefixInput(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lineups Per Prefix
                    <span className="text-xs text-gray-500 ml-2">(for simple mode only)</span>
                  </label>
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
              <h4 className="font-bold text-gray-800 mb-4">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subfeeds per PDU</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-orange-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={subfeedsPerPDU}
                    onChange={(e) => setSubfeedsPerPDU(Number(e.target.value))}
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of subfeed circuits per PDU (typically 6-12)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loadbank Max kW</label>
                  <input
                    type="number"
                    className="bg-white border-2 border-gray-300 focus:border-blue-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                    value={loadbankMaxKW}
                    onChange={(e) => setLoadbankMaxKW(Number(e.target.value))}
                    min={1}
                    step={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum kW per loadbank unit (physical constraint)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reduced Capacity Configuration */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Reduced Capacity Scenarios
          </h3>
          
          {/* Info Box with Typical Values */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-gray-700 font-semibold mb-2">
              Typical Commissioning Values:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 ml-6">
              <div>
                <span className="font-bold">ATS/STS UPS Burn-in:</span>
                <div className="text-indigo-600 font-semibold">1500-2000 kW</div>
              </div>
              <div>
                <span className="font-bold">Reserve Busway:</span>
                <div className="text-indigo-600 font-semibold">500-800 kW</div>
              </div>
              <div>
                <span className="font-bold">Reduced Capacity:</span>
                <div className="text-indigo-600 font-semibold">300-500 kW</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              Tip: Adjust lineup capacity based on your commissioning scenario and equipment limitations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reduced Capacity Value Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reduced Max Load (kW)
              </label>
              <input
                type="number"
                className="bg-white border-2 border-gray-300 focus:border-red-500 text-black px-4 py-3 w-full rounded-lg transition-colors"
                value={reducedCapacityKW}
                onChange={(e) => setReducedCapacityKW(Number(e.target.value))}
                placeholder="e.g., 400"
              />
              <p className="text-xs text-gray-500 mt-1">Set the reduced capacity limit for selected lineups</p>
            </div>

            {/* Lineup Selection Counter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selected Lineups
              </label>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">
                    {selectedReducedCapacityLineups.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    of {lineupNames.length} lineups
                  </span>
                </div>
                {selectedReducedCapacityLineups.length > 0 && (
                  <div className="text-xs text-gray-600 mt-2">
                    Applied to: {selectedReducedCapacityLineups.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lineup Selector Grid */}
          {lineupNames.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Lineups for Reduced Capacity
                <span className="text-xs text-gray-500 ml-2">(click to toggle)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {lineupNames.map((lineup) => {
                  const isSelected = selectedReducedCapacityLineups.includes(lineup);
                  return (
                    <button
                      key={lineup}
                      onClick={() => {
                        setSelectedReducedCapacityLineups(prev => 
                          prev.includes(lineup)
                            ? prev.filter(l => l !== lineup)
                            : [...prev, lineup]
                        );
                      }}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                        isSelected
                          ? 'bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50'
                      }`}
                    >
                      {lineup}
                      {isSelected && <span className="ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedReducedCapacityLineups([...lineupNames])}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
                >
                  <span>✓</span> Select All
                </button>
                <button
                  onClick={() => setSelectedReducedCapacityLineups([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
                >
                  <span>✕</span> Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lineup and PDU Preview */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 p-6 mb-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setShowPreview(!showPreview)}
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Preview
            </h3>
            <div className="flex items-center gap-3">
              {isCustomMode && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-bold">
                  Custom Names
                </span>
              )}
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
                        <div key={pdu} className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 px-3 py-2 rounded-lg text-sm font-medium text-gray-800">
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
          Start Load Planner
        </button>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>© 2025 Andrew Ralston | LoadFlow Pro v1.0</p>
        </footer>

      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <img 
                src="/loadflow-pro-logo.svg" 
                alt="LoadFlow Pro" 
                className="h-16 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">LoadFlow Pro</h2>
              <p className="text-sm text-gray-600">Version 1.0</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Professional Load Planning for Data Center Commissioning
              </p>
              <p className="text-sm text-gray-600">
                LoadFlow Pro streamlines PDU load distribution planning, commissioning workflows, and capacity management for data center electrical systems.
              </p>
            </div>
            <div className="border-t pt-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Developed by:</strong> Andrew Ralston
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Copyright:</strong> © 2025 Andrew Ralston
              </p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobConfigPage;
