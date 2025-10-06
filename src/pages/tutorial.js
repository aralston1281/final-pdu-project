import React, { useState } from 'react';
import { useRouter } from 'next/router';

function TutorialPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'job-config', title: 'Job Configuration' },
    { id: 'planner', title: 'Load Planner' },
    { id: 'networking', title: 'Loadbank Networking' },
    { id: 'diagram', title: 'Diagram View' },
    { id: 'warnings', title: 'Warnings & Limits' },
    { id: 'tips', title: 'Tips & Best Practices' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/loadflow-pro-logo.svg" 
                alt="LoadFlow Pro" 
                className="h-8 sm:h-10"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">LoadFlow Pro Tutorial</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Complete Guide to Load Planning</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base"
            >
              ← <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Mobile Dropdown Navigation */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4">
            <label className="font-bold text-gray-800 mb-2 block">Jump to Section:</label>
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-3">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-800 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 sm:p-6 lg:p-8">
              
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to LoadFlow Pro</h2>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <p className="text-yellow-800 font-bold">
                      WORK IN PROGRESS: This tool is under active development. Features and calculations should be verified by qualified personnel.
                    </p>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    LoadFlow Pro is a professional load planning tool for data center commissioning and electrical testing. 
                    It helps you plan PDU load distribution, manage loadbank capacity, and ensure safe electrical operations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-blue-900 mb-2">Key Features</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Real-time load distribution planning</li>
                        <li>• Electrical calculations & validations</li>
                        <li>• Loadbank capacity tracking</li>
                        <li>• Visual one-line diagrams</li>
                        <li>• Save & load configurations</li>
                        <li>• Commissioning test presets</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-bold text-green-900 mb-2">What You&apos;ll Learn</h3>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Setting up job configurations</li>
                        <li>• Planning load distribution</li>
                        <li>• Understanding loadbank networking</li>
                        <li>• Reading warnings & alerts</li>
                        <li>• Using the diagram view</li>
                        <li>• Best practices for testing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <p className="text-yellow-800">
                      <span className="font-bold">Important:</span> This tool is for planning purposes. 
                      Always follow proper electrical safety procedures and verify calculations with qualified personnel.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3 text-lg">Quick Start</h3>
                    <div className="space-y-2 text-purple-800">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                        <div>Configure your job (lineups, PDUs, voltages)</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                        <div>Set target load and select active equipment</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                        <div>Distribute load across PDUs and subfeeds</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                        <div>Review warnings and adjust as needed</div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                        <div>Save configuration and view diagram</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Getting Started Section */}
              {activeSection === 'getting-started' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Getting Started</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Step 1: Home Screen</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-4">
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-2">🏠</div>
                        <p className="text-gray-600">LoadFlow Pro Home Screen</p>
                      </div>
                      <div className="space-y-2 text-gray-700">
                        <p>• <span className="font-semibold">New Configuration:</span> Start from scratch</p>
                        <p>• <span className="font-semibold">Load Saved Config:</span> Continue previous work</p>
                        <p>• <span className="font-semibold">Tutorial:</span> Access this guide</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Step 2: Understanding the Interface</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">Top Bar (Always Visible)</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <strong>Diagram Button:</strong> Toggle view</li>
                          <li>• <strong>Save Button:</strong> Save your work</li>
                          <li>• <strong>Auto Button:</strong> Auto-distribute load</li>
                          <li>• <strong>Reset Button:</strong> Clear all</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-2">Main Area</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• <strong>Lineup Sections:</strong> Expandable cards</li>
                          <li>• <strong>PDU Cards:</strong> Individual PDU controls</li>
                          <li>• <strong>Subfeeds:</strong> Checkbox selection</li>
                          <li>• <strong>Warnings:</strong> Alert boxes</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3">Pro Tip</h3>
                    <p className="text-indigo-800">
                      Use the <strong>Auto Distribute</strong> feature first to get a baseline, 
                      then manually adjust individual PDU loads as needed. This saves time and ensures even distribution.
                    </p>
                  </div>
                </div>
              )}

              {/* Job Configuration Section */}
              {activeSection === 'job-config' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Job Configuration</h2>
                  
                  <p className="text-gray-700 mb-6">
                    The job configuration defines your electrical system layout and equipment specifications.
                  </p>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Basic Information</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Job Name</div>
                          <p className="text-sm text-gray-600">Example: &quot;Datacenter A - Floor 1 - UPS Test&quot;</p>
                          <p className="text-xs text-gray-500 mt-1">Used to identify saved configurations</p>
                        </div>
                        
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Lineup Names</div>
                          <p className="text-sm text-gray-600">Enter: <code className="bg-gray-200 px-2 py-1 rounded">UPS-1-1A, UPS-1-1B, UPS-1-1C</code></p>
                          <p className="text-xs text-gray-500 mt-1">Can be simple prefixes (A,B,C) or full names</p>
                        </div>
                        
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">PDUs per Lineup</div>
                          <p className="text-sm text-gray-600">Typical: 2-4 PDUs per lineup</p>
                          <p className="text-xs text-gray-500 mt-1">Determines how many PDUs feed each lineup</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Electrical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                        <h4 className="font-bold text-red-900 mb-3">PDU Main</h4>
                        <div className="space-y-2 text-sm text-red-800">
                          <div>
                            <strong>Voltage:</strong> 480V (typical)
                            <p className="text-xs text-red-700">3-phase line-to-line voltage</p>
                          </div>
                          <div>
                            <strong>Breaker:</strong> 800-1000A
                            <p className="text-xs text-red-700">Main breaker rating</p>
                          </div>
                          <div className="bg-red-100 p-2 rounded mt-2">
                            <strong>Max Power:</strong>
                            <p className="text-xs">P = √3 × V × I / 1000</p>
                            <p className="text-xs">= √3 × 480 × 1000 / 1000</p>
                            <p className="font-bold">≈ 831 kW</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <h4 className="font-bold text-green-900 mb-3">Subfeeds</h4>
                        <div className="space-y-2 text-sm text-green-800">
                          <div>
                            <strong>Voltage:</strong> 415V (typical)
                            <p className="text-xs text-green-700">Subfeed circuit voltage</p>
                          </div>
                          <div>
                            <strong>Breaker:</strong> 400-600A
                            <p className="text-xs text-green-700">Per subfeed breaker rating</p>
                          </div>
                          <div className="bg-green-100 p-2 rounded mt-2">
                            <strong>Max Power:</strong>
                            <p className="text-xs">P = √3 × 415 × 600 / 1000</p>
                            <p className="font-bold">≈ 431 kW</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Loadbank Configuration</h3>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="font-semibold text-blue-900 mb-2">Loadbank Max kW</div>
                        <p className="text-sm text-blue-800 mb-3">
                          Physical capacity of each loadbank unit (default: 600 kW, commonly 200 kW)
                        </p>
                      </div>
                      
                      <div className="bg-blue-100 p-4 rounded">
                        <p className="text-sm text-blue-900 font-semibold mb-2">Why this matters:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Your subfeed might support 288 kW (breaker limit)</li>
                          <li>• But your loadbank only has 200 kW capacity</li>
                          <li>• System warns when you need additional loadbanks</li>
                          <li>• Helps plan equipment requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                    <p className="text-orange-800">
                      <span className="font-bold">Important:</span> All electrical values must match your actual 
                      equipment specifications. Verify with electrical drawings and nameplates.
                    </p>
                  </div>
                </div>
              )}

              {/* Planner Section */}
              {activeSection === 'planner' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Load Planner</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Setting Target Load</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold">10</div>
                          <div className="text-sm">MW</div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 mb-2">
                            Enter your desired test load in the <strong>Target Load</strong> field
                          </p>
                          <p className="text-sm text-gray-600">
                            The system will distribute this load across your selected PDUs and subfeeds
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded border border-blue-300">
                        <p className="font-semibold text-blue-900 mb-2">Auto-Distribute Options:</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            <span>Auto-distribute enabled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked readOnly className="w-4 h-4" />
                            <span>Networked loadbanks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Working with PDUs</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-4">
                      <div className="text-center mb-4">
                        <div className="inline-block bg-white border-2 border-green-300 rounded-lg p-4 shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">PDU-1-1A-1</span>
                            <span className="text-2xl text-green-600">✓</span>
                          </div>
                          <div className="mb-2">
                            <label className="text-sm text-gray-600">Load (kW):</label>
                            <div className="bg-gray-100 border-2 border-gray-300 rounded px-3 py-2 text-lg font-bold">
                              250
                            </div>
                          </div>
                          <div className="bg-green-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{width: '30%'}}></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">250 kW / 831 kW</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Edit Load</p>
                          <p className="text-gray-600">Click the kW input and type new value</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Progress Bar</p>
                          <p className="text-gray-600">Visual indicator of capacity usage</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Status Icon</p>
                          <p className="text-gray-600">Green=OK, Yellow=High, Red=Overload</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Edit Name</p>
                          <p className="text-gray-600">Click &quot;Edit&quot; to customize PDU name</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Subfeed Selection</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                      <div className="mb-4">
                        <p className="text-gray-700 mb-4">
                          Each PDU has multiple subfeed circuits. Select which ones to use for testing:
                        </p>
                        
                        <div className="flex gap-2 justify-center mb-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <div key={num} className={`p-2 border-2 rounded ${num <= 3 ? 'bg-green-50 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                              <input type="checkbox" checked={num <= 3} readOnly className="mb-1" />
                              <div className="text-xs font-bold">S{num}</div>
                              {num <= 3 && <div className="text-xs text-green-700">83 kW</div>}
                              {num > 3 && <div className="text-xs text-gray-500">off</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>How it works:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• <strong>Checked:</strong> Subfeed is active and carrying load</li>
                          <li>• <strong>Unchecked:</strong> Subfeed is off (no load)</li>
                          <li>• <strong>Load shown:</strong> kW on that subfeed</li>
                          <li>• <strong>Color:</strong> Green=OK, Yellow/Orange=Warning, Red=Overload</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">Quick Tips</h3>
                    <div className="space-y-2 text-purple-800">
                      <p>• Use <strong>Auto Distribute</strong> for even load spreading</p>
                      <p>• Toggle <strong>Auto-distribute enabled</strong> to manually edit without recalculation</p>
                      <p>• Select more subfeeds to reduce load per subfeed</p>
                      <p>• Collapse lineups you&apos;re not working on to reduce clutter</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Networking Section */}
              {activeSection === 'networking' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Loadbank Networking</h2>
                  
                  <p className="text-gray-700 mb-6">
                    Understanding how loadbanks distribute power is crucial for proper test planning.
                  </p>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Networked Mode (Default)</h3>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" checked readOnly className="w-5 h-5" />
                        <span className="font-semibold text-blue-900">Networked Loadbanks</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded border-2 border-blue-300 mb-4">
                        <div className="text-center mb-3">
                          <div className="font-bold text-blue-900 mb-2">UPS-1-1A Lineup</div>
                          <div className="text-sm text-blue-700">Total: 1200 kW</div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="bg-blue-100 p-2 rounded text-center border border-blue-300">
                              <div className="text-xs font-bold">PDU {num}</div>
                              <div className="text-xs">3 subfeeds</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 text-center">
                          <div className="inline-block bg-green-100 px-4 py-2 rounded border border-green-300">
                            <div className="text-sm font-semibold text-green-900">
                              1200 kW ÷ 12 subfeeds = 100 kW each
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-100 p-4 rounded">
                        <p className="font-semibold text-blue-900 mb-2">How it works:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Load distributes across <strong>ALL active subfeeds in the lineup</strong></li>
                          <li>• Adding a subfeed <strong>reduces load on all others</strong></li>
                          <li>• Typical for networked loadbank systems</li>
                          <li>• More flexible load distribution</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Per-PDU Mode</h3>
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" readOnly className="w-5 h-5" />
                        <span className="font-semibold text-orange-900">Networked Loadbanks (unchecked)</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded border-2 border-orange-300 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-orange-100 p-3 rounded border border-orange-300">
                            <div className="font-bold text-orange-900 mb-2">PDU-1-1A-1</div>
                            <div className="text-sm text-orange-800">Load: 250 kW</div>
                            <div className="text-sm text-orange-800">1 subfeed active</div>
                            <div className="mt-2 bg-green-100 p-2 rounded">
                              <div className="text-sm font-semibold">250 ÷ 1 = 250 kW</div>
                            </div>
                          </div>
                          
                          <div className="bg-orange-100 p-3 rounded border border-orange-300">
                            <div className="font-bold text-orange-900 mb-2">PDU-1-1A-2</div>
                            <div className="text-sm text-orange-800">Load: 400 kW</div>
                            <div className="text-sm text-orange-800">2 subfeeds active</div>
                            <div className="mt-2 bg-yellow-100 p-2 rounded">
                              <div className="text-sm font-semibold">400 ÷ 2 = 200 kW each</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-100 p-4 rounded">
                        <p className="font-semibold text-orange-900 mb-2">How it works:</p>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Load distributes only within <strong>that specific PDU</strong></li>
                          <li>• Each PDU operates independently</li>
                          <li>• Used for isolated loadbank testing</li>
                          <li>• More precise control per PDU</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">Which Mode to Use?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-purple-900 mb-2">Use Networked When:</div>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Loadbanks are networked/linked</li>
                          <li>• Testing full lineup capacity</li>
                          <li>• Want even distribution</li>
                          <li>• Typical commissioning scenario</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-900 mb-2">Use Per-PDU When:</div>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Testing individual PDUs</li>
                          <li>• Loadbanks are isolated</li>
                          <li>• Need specific PDU loads</li>
                          <li>• Troubleshooting specific circuits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagram Section */}
              {activeSection === 'diagram' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Diagram View</h2>
                  
                  <p className="text-gray-700 mb-6">
                    The diagram view provides a visual one-line representation of your electrical distribution system.
                  </p>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Accessing Diagram View</h3>
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <button className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg">
                          Diagram
                        </button>
                        <p className="text-gray-700">Click the Diagram button in the top control bar</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Toggle between Planner view and Diagram view anytime
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Diagram Components</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <div className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-bold">
                            MAIN SOURCE
                            <div className="text-2xl">10.0 MW</div>
                          </div>
                          <div className="w-1 h-8 bg-gray-800 mx-auto"></div>
                          <div className="h-1 bg-gray-800 w-full"></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {['1-1A', '1-1B', '1-1C'].map((lineup) => (
                            <div key={lineup} className="text-center">
                              <div className="w-1 h-6 bg-gray-800 mx-auto"></div>
                              <div className="bg-green-100 border-2 border-green-400 rounded p-2">
                                <div className="font-bold">UPS {lineup}</div>
                                <div className="text-sm">600 kW</div>
                                <div className="text-xs text-gray-600">40%</div>
                              </div>
                              <div className="w-1 h-4 bg-gray-700 mx-auto"></div>
                              <div className="space-y-2">
                                {[1, 2].map((pdu) => (
                                  <div key={pdu}>
                                    <div className="bg-white border-2 border-blue-400 rounded p-1">
                                      <div className="text-xs font-bold">PDU-{lineup}-{pdu}</div>
                                      <div className="text-xs">300 kW</div>
                                    </div>
                                    <div className="w-1 h-2 bg-gray-600 mx-auto"></div>
                                    <div className="grid grid-cols-3 gap-1">
                                      {[1, 2, 3].map((sf) => (
                                        <div key={sf} className="bg-green-50 border border-green-300 rounded p-1">
                                          <div className="text-xs font-bold">S{sf}</div>
                                          <div className="text-xs">100</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Color Coding</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-100 border-2 border-green-400 p-4 rounded-lg text-center">
                        <div className="font-bold text-green-900">Green</div>
                        <div className="text-sm text-green-800">0-60% Load</div>
                        <div className="text-xs text-gray-600">Normal Operation</div>
                      </div>
                      <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg text-center">
                        <div className="font-bold text-yellow-900">Yellow</div>
                        <div className="text-sm text-yellow-800">60-80% Load</div>
                        <div className="text-xs text-gray-600">Moderate Load</div>
                      </div>
                      <div className="bg-orange-100 border-2 border-orange-400 p-4 rounded-lg text-center">
                        <div className="font-bold text-orange-900">Orange</div>
                        <div className="text-sm text-orange-800">80-100% Load</div>
                        <div className="text-xs text-gray-600">High Load</div>
                      </div>
                      <div className="bg-red-100 border-2 border-red-400 p-4 rounded-lg text-center">
                        <div className="font-bold text-red-900">Red</div>
                        <div className="text-sm text-red-800">&gt;100% Load</div>
                        <div className="text-xs text-gray-600">Overload!</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">Interactive Diagram</h3>
                    <p className="text-blue-800 mb-3">
                      The diagram view is fully interactive! You can edit loads and toggle subfeeds directly on the diagram.
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Click PDU load values to edit</li>
                      <li>• Click subfeeds to toggle on/off</li>
                      <li>• Changes sync with planner view</li>
                      <li>• Use for quick visual adjustments</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Warnings Section */}
              {activeSection === 'warnings' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Warnings & Limits</h2>
                  
                  <p className="text-gray-700 mb-6">
                    The system provides real-time warnings to help prevent electrical overloads and equipment limitations.
                  </p>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Types of Warnings</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl text-red-600">●</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-red-800 mb-2">PDU Main Breaker Overload</h4>
                            <p className="text-sm text-red-700 mb-2">
                              PDU load exceeds its main breaker rating (electrical limit)
                            </p>
                            <div className="bg-red-100 p-3 rounded">
                              <div className="text-sm text-red-800">
                                <strong>Example:</strong> PDU rated 831 kW, currently loaded to 900 kW
                              </div>
                              <div className="text-sm text-red-900 font-bold mt-1">
                                Risk: Circuit breaker trip or equipment damage
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-red-800">
                              <strong>Solution:</strong> Reduce load or activate more PDUs
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl text-yellow-600">●</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-yellow-800 mb-2">Subfeed Breaker Overload</h4>
                            <p className="text-sm text-yellow-700 mb-2">
                              Individual subfeed exceeds its breaker rating
                            </p>
                            <div className="bg-yellow-100 p-3 rounded">
                              <div className="text-sm text-yellow-800">
                                <strong>Example:</strong> Subfeed rated 288 kW, currently loaded to 320 kW
                              </div>
                              <div className="text-sm text-yellow-900 font-bold mt-1">
                                Risk: Subfeed breaker trip
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-yellow-800">
                              <strong>Solution:</strong> Activate more subfeeds to distribute load
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl text-orange-600">●</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-orange-800 mb-2">Loadbank Capacity Exceeded</h4>
                            <p className="text-sm text-orange-700 mb-2">
                              Subfeed load exceeds available loadbank capacity (equipment limitation)
                            </p>
                            <div className="bg-orange-100 p-3 rounded">
                              <div className="text-sm text-orange-800 mb-2">
                                <strong>Networked Mode Example:</strong>
                              </div>
                              <div className="text-sm text-orange-700">
                                Lineup: 1000 kW total load<br/>
                                Current: 4 active subfeeds (250 kW each)<br/>
                                Loadbank capacity: 200 kW per unit<br/>
                                <span className="font-bold">Need 1 additional loadbank → 5 total → 200 kW each</span>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-orange-800">
                              <strong>Solution:</strong> Add loadbank units or activate more subfeeds
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl text-purple-600">●</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-purple-800 mb-2">Lineup Capacity Warning</h4>
                            <p className="text-sm text-purple-700 mb-2">
                              Total lineup load exceeds configured maximum capacity
                            </p>
                            <div className="bg-purple-100 p-3 rounded">
                              <div className="text-sm text-purple-800">
                                <strong>Example:</strong> Lineup max 1500 kW, currently loaded to 1600 kW
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-purple-800">
                              <strong>Solution:</strong> Reduce load or mark as reduced capacity scenario
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Understanding Limits</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Electrical Limits (Safety)</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">•</span>
                              <div>
                                <strong>Breaker Rating:</strong> Maximum safe current
                                <p className="text-xs text-gray-600">Cannot exceed without tripping</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">•</span>
                              <div>
                                <strong>Voltage Rating:</strong> System voltage level
                                <p className="text-xs text-gray-600">Must match equipment specs</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">•</span>
                              <div>
                                <strong>Power Formula:</strong> P = √3 × V × I / 1000
                                <p className="text-xs text-gray-600">3-phase power calculation</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Equipment Limits (Physical)</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-orange-600 font-bold">•</span>
                              <div>
                                <strong>Loadbank Capacity:</strong> Physical unit size
                                <p className="text-xs text-gray-600">e.g., 200 kW per loadbank</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-orange-600 font-bold">•</span>
                              <div>
                                <strong>Available Units:</strong> Equipment on hand
                                <p className="text-xs text-gray-600">May need to rent/source more</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-orange-600 font-bold">•</span>
                              <div>
                                <strong>Connection Points:</strong> Subfeed availability
                                <p className="text-xs text-gray-600">Limited by panel design</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3">Priority Order</h3>
                    <p className="text-indigo-800 mb-3">Address warnings in this order:</p>
                    <ol className="space-y-2 text-indigo-800">
                      <li><strong>1. Red Breaker Overloads</strong> - Safety critical, must fix immediately</li>
                      <li><strong>2. Yellow Breaker Overloads</strong> - Will trip during test</li>
                      <li><strong>3. Orange Loadbank Capacity</strong> - Plan equipment needs</li>
                      <li><strong>4. Other Warnings</strong> - Optimize as needed</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              {activeSection === 'tips' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Tips & Best Practices</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Planning Your Test</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <h4 className="font-bold text-blue-900 mb-2">Before You Start</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Verify all electrical specifications with drawings</li>
                          <li>• Count available loadbank units and capacity</li>
                          <li>• Identify which lineups/PDUs will be tested</li>
                          <li>• Determine target load requirements</li>
                          <li>• Check for any reduced capacity scenarios</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <h4 className="font-bold text-green-900 mb-2">During Planning</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Start with auto-distribute for baseline</li>
                          <li>• Check all warnings before finalizing</li>
                          <li>• Verify loadbank quantities needed</li>
                          <li>• Save your configuration frequently</li>
                          <li>• Use diagram view to verify layout</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <h4 className="font-bold text-purple-900 mb-2">Quality Checks</h4>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• No red or yellow breaker warnings</li>
                          <li>• Orange loadbank warnings addressed</li>
                          <li>• Even load distribution across lineups</li>
                          <li>• All subfeed loads within limits</li>
                          <li>• Configuration saved with descriptive name</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Common Scenarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">UPS Burn-In Test</h4>
                        <p className="text-sm text-gray-700 mb-2">Load lineup to maximum capacity</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• Set target to lineup max (e.g., 1500 kW)</p>
                          <p>• Activate all PDUs in lineup</p>
                          <p>• Use auto-distribute</p>
                          <p>• Verify no overloads</p>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">Subfeed Breaker Test</h4>
                        <p className="text-sm text-gray-700 mb-2">Test each subfeed individually</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• Disable auto-distribute</p>
                          <p>• Select one subfeed at a time</p>
                          <p>• Load to 100% breaker rating</p>
                          <p>• Document results for each</p>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">PDU Main Breaker Test</h4>
                        <p className="text-sm text-gray-700 mb-2">Load PDU to main breaker capacity</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• Activate all subfeeds on PDU</p>
                          <p>• Set load to PDU max (e.g., 831 kW)</p>
                          <p>• Use per-PDU mode</p>
                          <p>• Monitor subfeed distribution</p>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 mb-2">Efficiency Test</h4>
                        <p className="text-sm text-gray-700 mb-2">Minimum PDUs for target load</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• Calculate PDUs needed</p>
                          <p>• Activate minimum required</p>
                          <p>• Load each to ~80%</p>
                          <p>• Reduces testing time/cost</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Keyboard Shortcuts</h3>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Tab</div>
                          <p className="text-gray-600">Navigate between input fields</p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Enter</div>
                          <p className="text-gray-600">Save input and move to next</p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Escape</div>
                          <p className="text-gray-600">Cancel editing</p>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Ctrl + S</div>
                          <p className="text-gray-600">Quick save (browser default)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-3">Safety Reminders</h3>
                    <ul className="text-red-800 space-y-2">
                      <li>• This is a planning tool only - not a substitute for engineering review</li>
                      <li>• Always follow proper lockout/tagout procedures</li>
                      <li>• Verify all calculations with qualified electrical personnel</li>
                      <li>• Use appropriate PPE during live electrical work</li>
                      <li>• Follow site-specific safety procedures and regulations</li>
                      <li>• Double-check all connections before energizing</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="mt-8 bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 sm:p-6 text-center">
              <p className="text-gray-700 mb-4">
                Need more help? Contact support or visit the documentation site.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                >
                  ← Back to App
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                © 2025 Andrew Ralston | LoadFlow Pro v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialPage;

