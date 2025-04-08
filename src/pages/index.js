import React, { useState } from 'react';
import JobConfigPage from '@/components/JobConfigPage';
import LoadDistributionPlanner from '@/components/LoadDistributionPlanner';

function App() {
  const [jobConfig, setJobConfig] = useState(null);

  return jobConfig ? (
    <LoadDistributionPlanner config={jobConfig} />
  ) : (
    <JobConfigPage onStart={setJobConfig} />
  );
}

export default App;
