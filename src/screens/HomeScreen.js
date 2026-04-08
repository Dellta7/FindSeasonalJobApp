import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { JobCard } from '../components/JobCard';

export function HomeScreen({ jobs, favoriteIds, onToggleFavorite, onSelectJob }) {
  const [query, setQuery] = useState('');

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.companyName} ${job.location} ${job.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [jobs, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Tìm việc thời vụ</Text>

        <TextInput
          placeholder="Tìm theo từ khoá (vd: phục vụ, kho, Thủ Đức…)"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              isFavorite={favoriteIds.has(item.id)}
              onToggleFavorite={onToggleFavorite}
              onPress={() => onSelectJob(item.id)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có kết quả phù hợp.</Text>
          }
          contentContainerStyle={styles.listContent}
        />

        <Text style={styles.hint}>
          Mẹo: nhấn vào job để xem chi tiết; dùng ☆/★ để lưu.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: '700' },
  search: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  listContent: { paddingTop: 12, paddingBottom: 12 },
  empty: { color: '#6b7280', paddingTop: 24 },
  hint: { color: '#6b7280', paddingTop: 8 },
});
