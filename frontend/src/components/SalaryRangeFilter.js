import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Component tìm kiếm lương theo khoảng
 * Parse "20 k/giờ" -> 20000
 * So sánh mức lương
 */
export function SalaryRangeFilter({ jobs, selectedMin, selectedMax, onChange }) {
  // Parse salary text to numeric value (in thousand VND as base unit)
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

  // Get min and max salary from all jobs
  const { minSalary, maxSalary } = useMemo(() => {
    let min = Infinity;
    let max = 0;

    jobs.forEach((job) => {
      const value = parseSalaryValue(job.salaryText);
      if (value > 0) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });

    return {
      minSalary: min === Infinity ? 0 : min,
      maxSalary: max === 0 ? 100 : max,
    };
  }, [jobs]);

  const handleMinChange = (text) => {
    const min = text ? parseInt(text) : 0;
    onChange(min, selectedMax);
  };

  const handleMaxChange = (text) => {
    const max = text ? parseInt(text) : maxSalary;
    onChange(selectedMin, max);
  };

  const salaryRangeOptions = useMemo(() => {
    const options = [
      { label: 'Tất cả', min: 0, max: maxSalary * 2 },
      { label: '< 100k', min: 0, max: 100 },
      { label: '100k - 200k', min: 100, max: 200 },
      { label: '200k - 300k', min: 200, max: 300 },
      { label: '300k - 500k', min: 300, max: 500 },
      { label: '500k - 1m', min: 500, max: 1000 },
      { label: '> 1m', min: 1000, max: maxSalary * 2 },
    ];
    return options;
  }, [maxSalary]);

  const isPresetSelected = useMemo(() => {
    return salaryRangeOptions.find(
      (opt) => opt.min === selectedMin && opt.max === selectedMax
    );
  }, [selectedMin, selectedMax, salaryRangeOptions]);

  return (
    <View style={styles.container}>
      <View style={styles.presetContainer}>
        {salaryRangeOptions.map((preset) => (
          <Pressable
            key={preset.label}
            style={[
              styles.presetBtn,
              isPresetSelected?.label === preset.label &&
                styles.presetBtnSelected,
            ]}
            onPress={() => onChange(preset.min, preset.max)}
          >
            <Text
              style={[
                styles.presetBtnText,
                isPresetSelected?.label === preset.label &&
                  styles.presetBtnTextSelected,
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.label}>Hoặc nhập khoảng lương (k = nghìn, m = triệu)</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Từ</Text>
          <TextInput
            value={selectedMin.toString()}
            onChangeText={handleMinChange}
            placeholder="0"
            style={styles.input}
            keyboardType="number-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <Text style={styles.dash}>-</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Đến</Text>
          <TextInput
            value={selectedMax.toString()}
            onChangeText={handleMaxChange}
            placeholder={maxSalary.toString()}
            style={styles.input}
            keyboardType="number-pad"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  presetBtnSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  presetBtnTextSelected: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  dash: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 10,
  },
});
