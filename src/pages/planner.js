// src/pages/planner.js

import LoadDistributionPlanner from '@/components/LoadDistributionPlanner';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function PlannerPage() {
  const router = useRouter();
  const [parsedConfig, setParsedConfig] = useState(null);

  useEffect(() => {
    if (router.query.config) {
      try {
        const parsed = JSON.parse(router.query.config);
        setParsedConfig(parsed);
      } catch (err) {
        console.error('Failed to parse config:', err);
      }
    }
  }, [router.query.config]);

  if (!parsedConfig) {
    return <div>Loading Planner...</div>;
  }

  return <LoadDistributionPlanner config={parsedConfig} />;
}

export default PlannerPage;
