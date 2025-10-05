// src/pages/diagram.js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OneLineDiagram from '@/components/OneLineDiagram';

function DiagramPage() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [loadData, setLoadData] = useState(null);

  useEffect(() => {
    if (router.query.config) {
      try {
        const parsed = JSON.parse(router.query.config);
        setConfig(parsed);
      } catch (err) {
        console.error('Failed to parse config:', err);
      }
    }
    
    if (router.query.loadData) {
      try {
        const parsed = JSON.parse(router.query.loadData);
        setLoadData(parsed);
      } catch (err) {
        console.error('Failed to parse load data:', err);
      }
    }
  }, [router.query.config, router.query.loadData]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading diagram...</p>
          <p className="text-sm text-gray-500 mt-2">No configuration data found</p>
        </div>
      </div>
    );
  }

  return <OneLineDiagram config={config} loadData={loadData} />;
}

export default DiagramPage;
