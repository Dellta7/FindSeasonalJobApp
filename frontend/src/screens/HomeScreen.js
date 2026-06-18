import { useMemo, useState, useEffect } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { JobCard } from '../components/JobCard';
import { SalaryRangeFilter } from '../components/SalaryRangeFilter';

export function HomeScreen({
  jobs,
  favoriteIds,
  onToggleFavorite,
  onSelectJob,
  onAddJob,
  categories: apiCategories = [],
  isFavoritesOnly = false,
}) {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedMinSalary, setSelectedMinSalary] = useState(0);
  const [selectedMaxSalary, setSelectedMaxSalary] = useState(1000);
  const [selectedWorkTime, setSelectedWorkTime] = useState('Tất cả');
  const [activeFilterPanel, setActiveFilterPanel] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');

  const locations = useMemo(() => {
    const uniq = new Set(jobs.map((j) => j.location).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs]);

  const categories = useMemo(() => {
    if (apiCategories.length > 0) {
      return ['Tất cả', ...apiCategories.map(c => c.name)];
    }
    const uniq = new Set(jobs.map((j) => j.category).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs, apiCategories]);

  const salaryOptions = useMemo(() => {
    const uniq = new Set(jobs.map((j) => j.salaryText).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs]);

  // Parse salary text to numeric value (in thousand VND)
  const parseSalaryValue = (salaryText) => {
    if (!salaryText) return 0;
    const match = salaryText.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)/i);
    if (!match) return 0;

    let [, amount, unit] = match;
    amount = parseFloat(amount);

    if (unit.toLowerCase() === 'triệu') {
      return amount * 1000; // Triệu -> ngàn
    }
    return amount; // Mặc định là k (ngàn)
  };

  const workTimeOptions = useMemo(() => {
    const uniq = new Set(jobs.map((j) => j.workTimeText).filter(Boolean));
    return ['Tất cả', ...Array.from(uniq)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = jobs.filter((job) => {
      if (selectedLocation !== 'Tất cả' && job.location !== selectedLocation) {
        return false;
      }
      if (selectedCategory !== 'Tất cả' && job.category !== selectedCategory) {
        return false;
      }
      // Filter by salary range
      const salaryValue = parseSalaryValue(job.salaryText);
      if (salaryValue > 0) {
        if (salaryValue < selectedMinSalary || salaryValue > selectedMaxSalary) {
          return false;
        }
      }

      if (selectedWorkTime !== 'Tất cả' && job.workTimeText !== selectedWorkTime) {
        return false;
      }
      if (!q) return true;

      const haystack = `${job.title} ${job.companyName} ${job.location} ${job.category}`.toLowerCase();
      return haystack.includes(q);
    });
    
    // Smooth transition for list updates
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    return result;
  }, [jobs, query, selectedLocation, selectedCategory, selectedMinSalary, selectedMaxSalary, selectedWorkTime, parseSalaryValue]);

  const handleClearFilters = () => {
    setSelectedLocation('Tất cả');
    setSelectedCategory('Tất cả');
    setSelectedMinSalary(0);
    setSelectedMaxSalary(1000);
    setSelectedWorkTime('Tất cả');
    setQuery('');
    setFilterSearch('');
    setActiveFilterPanel(null);
  };

  const locationOptions = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return locations.filter((loc) => loc.toLowerCase().includes(q));
  }, [locations, filterSearch]);

  const categoryOptions = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return categories.filter((cat) => cat.toLowerCase().includes(q));
  }, [categories, filterSearch]);

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

  const sectionedJobs = useMemo(() => {
    const groups = {};
    filteredJobs.forEach((job) => {
      const cat = job.category || 'Khác';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(job);
    });

    return Object.keys(groups).sort().map((cat) => ({
      title: cat,
      data: groups[cat],
    }));
  }, [filteredJobs]);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <SectionList
        sections={sectionedJobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={onToggleFavorite}
            onPress={() => onSelectJob(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.greeting}>
                    {isFavoritesOnly ? 'Danh sách của bạn' : 'Chào mừng bạn'}
                  </Text>
                  {!isFavoritesOnly && (
                    <MaterialIcons name="waving-hand" size={16} color="#f59e0b" style={{ marginLeft: 6, marginBottom: 4 }} />
                  )}
                </View>
                <Text style={styles.h1}>
                  {isFavoritesOnly ? 'Việc làm yêu thích' : 'Tìm việc làm mới'}
                </Text>
              </View>
              {typeof onAddJob === 'function' && (
                <Pressable onPress={onAddJob} style={styles.addBtn} hitSlop={6}>
                  <MaterialIcons name="add" size={20} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.addBtnText}>Đăng tin</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={22} color="#94a3b8" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Vị trí, công ty hoặc từ khoá..."
                  value={query}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.filters}>
              <ScrollView
                style={styles.filterScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterButtonsContent}
              >
                <Pressable
                  style={styles.filterMainButton}
                  onPress={() => {
                    setActiveFilterPanel('location');
                    setFilterSearch('');
                  }}
                >
                  <MaterialIcons name="place" size={18} color="#2563eb" style={{ marginRight: 8 }} />
                  <Text style={styles.filterMainButtonText}>Khu vực</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.filterButton,
                    selectedCategory !== 'Tất cả' && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    setActiveFilterPanel('category');
                    setFilterSearch('');
                  }}
                >
                  <MaterialIcons name="work-outline" size={18} color={selectedCategory !== 'Tất cả' ? '#fff' : '#475569'} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterButtonText, selectedCategory !== 'Tất cả' && styles.filterButtonTextActive]}>
                    Lĩnh vực
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterButton,
                    (selectedMinSalary !== 0 || selectedMaxSalary !== 1000) && styles.filterButtonActive,
                  ]}
                  onPress={() => setActiveFilterPanel('salary')}
                >
                  <MaterialIcons name="attach-money" size={18} color={(selectedMinSalary !== 0 || selectedMaxSalary !== 1000) ? '#fff' : '#475569'} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterButtonText, (selectedMinSalary !== 0 || selectedMaxSalary !== 1000) && styles.filterButtonTextActive]}>
                    Lương
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterButton,
                    selectedWorkTime !== 'Tất cả' && styles.filterButtonActive,
                  ]}
                  onPress={() => setActiveFilterPanel('workTime')}
                >
                  <MaterialIcons name="schedule" size={18} color={selectedWorkTime !== 'Tất cả' ? '#fff' : '#475569'} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterButtonText, selectedWorkTime !== 'Tất cả' && styles.filterButtonTextActive]}>
                    Thời gian
                  </Text>
                </Pressable>
              </ScrollView>
              {(selectedLocation !== 'Tất cả' || selectedCategory !== 'Tất cả' || selectedMinSalary !== 0 || selectedMaxSalary !== 1000 || selectedWorkTime !== 'Tất cả') && (
                <View style={styles.activeFiltersRow}>
                  {[
                    selectedLocation !== 'Tất cả' ? `Khu vực: ${selectedLocation}` : null,
                    selectedCategory !== 'Tất cả' ? `Ngành: ${selectedCategory}` : null,
                    (selectedMinSalary !== 0 || selectedMaxSalary !== 1000) ? `Lương: ${selectedMinSalary}k - ${selectedMaxSalary}k` : null,
                    selectedWorkTime !== 'Tất cả' ? `Loại: ${selectedWorkTime}` : null,
                  ]
                    .filter(Boolean)
                    .map((label) => (
                      <View key={label} style={styles.activeFilterBadge}>
                        <Text style={styles.activeFilterText}>{label}</Text>
                      </View>
                    ))}
                  <Pressable onPress={handleClearFilters} style={styles.clearFiltersBtn}>
                    <Text style={styles.clearFiltersText}>Xóa lọc</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptySub}>Hãy thử thay đổi từ khoá hoặc bộ lọc để tìm thấy nhiều việc hơn.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={activeFilterPanel !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveFilterPanel(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {activeFilterPanel === 'location' && 'Khu vực'}
                {activeFilterPanel === 'category' && 'Lĩnh vực'}
                {activeFilterPanel === 'salary' && 'Lương'}
                {activeFilterPanel === 'workTime' && 'Loại công việc'}
              </Text>
              <Pressable onPress={() => setActiveFilterPanel(null)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={24} color="#475569" />
              </Pressable>
            </View>
            {(activeFilterPanel === 'location' || activeFilterPanel === 'category') && (
              <View style={styles.locationSearchBox}>
                <MaterialIcons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
                <TextInput
                  value={filterSearch}
                  onChangeText={setFilterSearch}
                  placeholder={activeFilterPanel === 'location' ? 'Tìm khu vực' : 'Tìm Lĩnh vực'}
                  style={styles.locationSearchInput}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            )}
            {activeFilterPanel === 'salary' && (
              <SalaryRangeFilter
                jobs={jobs}
                selectedMin={selectedMinSalary}
                selectedMax={selectedMaxSalary}
                onChange={(min, max) => {
                  setSelectedMinSalary(min);
                  setSelectedMaxSalary(max);
                  setActiveFilterPanel(null);
                }}
              />
            )}
            {(activeFilterPanel === 'location' || activeFilterPanel === 'category' || activeFilterPanel === 'workTime') && (
              <ScrollView style={styles.locationList}>
                {(
                  activeFilterPanel === 'location' ? locationOptions :
                  activeFilterPanel === 'category' ? categoryOptions :
                  activeFilterPanel === 'workTime' ? workTimeOptions :
                  []
                ).map((value) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.locationOption,
                      (activeFilterPanel === 'location' && value === selectedLocation) ||
                      (activeFilterPanel === 'category' && value === selectedCategory) ||
                      (activeFilterPanel === 'workTime' && value === selectedWorkTime)
                        ? styles.locationOptionSelected
                        : null,
                    ]}
                    onPress={() => {
                      if (activeFilterPanel === 'location') {
                        setSelectedLocation(value);
                        setLocationSearch('');
                      } else if (activeFilterPanel === 'category') {
                        setSelectedCategory(value);
                        setLocationSearch('');
                      } else if (activeFilterPanel === 'workTime') {
                        setSelectedWorkTime(value);
                      }
                      setActiveFilterPanel(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.locationOptionText,
                        ((activeFilterPanel === 'location' && value === selectedLocation) ||
                        (activeFilterPanel === 'category' && value === selectedCategory) ||
                        (activeFilterPanel === 'workTime' && value === selectedWorkTime)) &&
                          styles.locationOptionTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    height: '100%',
  },
  filters: {
    marginBottom: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButtonsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    marginRight: 8,
  },
  filterMainButtonText: {
    fontWeight: '700',
    color: '#2563eb',
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  activeFilterBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilterText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  chipsRow: {
    paddingLeft: 20,
    paddingRight: 12,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#64748b',
  },
  chipTextSelected: {
    color: '#fff',
  },
  filterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationButtonLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationButtonValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationValue: {
    fontSize: 14,
    color: '#475569',
    marginRight: 6,
  },
  clearFiltersBtn: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  clearFiltersText: {
    color: '#475569',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  locationModal: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalCloseBtn: {
    padding: 8,
  },
  locationSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  locationList: {
    maxHeight: '80%',
  },
  locationOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  locationOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  locationOptionText: {
    fontSize: 15,
    color: '#1e293b',
  },
  locationOptionTextSelected: {
    fontWeight: '700',
    color: '#2563eb',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
