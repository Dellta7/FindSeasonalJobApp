import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { JobCard } from '../components/JobCard';

export function HomeScreen({ jobs, favoriteIds, onToggleFavorite, onSelectJob }) {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const locations = useMemo(() => {
    const uniq = new Set(jobs.map((j) => j.location).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs]);

  const categories = useMemo(() => {
    const uniq = new Set(jobs.map((j) => j.category).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (selectedLocation !== 'Tất cả' && job.location !== selectedLocation) {
        return false;
      }
      if (selectedCategory !== 'Tất cả' && job.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      const haystack = `${job.title} ${job.companyName} ${job.location} ${job.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [jobs, query, selectedLocation, selectedCategory]);

  const Chip = ({ label, selected, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.chip, selected && styles.chipSelected]}
        hitSlop={6}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
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
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.h1}>Tìm việc thời vụ</Text>
            <Text style={styles.h2}>Tìm nhanh theo khu vực và lĩnh vực</Text>

            <TextInput
              placeholder="Tìm theo từ khoá (vd: phục vụ, kho, Thủ Đức…)"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <Text style={styles.filterLabel}>Địa điểm</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {locations.map((loc) => (
                <Chip
                  key={loc}
                  label={loc}
                  selected={loc === selectedLocation}
                  onPress={() => setSelectedLocation(loc)}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Lĩnh vực</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={cat === selectedCategory}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>

            <Text style={styles.resultText}>
              {filteredJobs.length} việc phù hợp
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.empty}>Không có kết quả phù hợp.</Text>
            <Text style={styles.hint}>Thử đổi từ khoá hoặc bộ lọc.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: '700' },
  h2: { color: '#6b7280', marginTop: 4 },
  search: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterLabel: { marginTop: 12, fontWeight: '700' },
  chipsRow: { paddingTop: 10, paddingBottom: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipSelected: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  resultText: { marginTop: 10, color: '#6b7280' },
  listContent: { paddingBottom: 12 },
  empty: { color: '#6b7280', paddingTop: 24 },
  hint: { color: '#6b7280', paddingTop: 8 },
});
