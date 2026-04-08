import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MOCK_JOBS } from './data/mockJobs';
import { HomeScreen } from './screens/HomeScreen';
import { JobDetailScreen } from './screens/JobDetailScreen';

export default function AppRoot() {
  const jobs = useMemo(() => MOCK_JOBS, []);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) ?? null;
  }, [jobs, selectedJobId]);

  const toggleFavorite = (jobId) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  if (selectedJob) {
    return (
      <SafeAreaProvider>
        <JobDetailScreen
          job={selectedJob}
          isFavorite={favoriteIds.has(selectedJob.id)}
          onBack={() => setSelectedJobId(null)}
          onToggleFavorite={() => toggleFavorite(selectedJob.id)}
        />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <HomeScreen
        jobs={jobs}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onSelectJob={setSelectedJobId}
      />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
