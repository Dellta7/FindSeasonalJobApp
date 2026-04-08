import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export function JobDetailScreen({ job, isFavorite, onBack, onToggleFavorite }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const canSubmit = useMemo(() => {
    return fullName.trim().length > 0 && phone.trim().length > 0;
  }, [fullName, phone]);

  const submit = () => {
    if (!canSubmit) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và số điện thoại.');
      return;
    }

    Alert.alert(
      'Đã ghi nhận',
      'Yêu cầu đăng ký quan tâm của bạn đã được ghi nhận (demo).'
    );
    setFullName('');
    setPhone('');
    setNote('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>← Quay lại</Text>
          </Pressable>

          <Pressable onPress={onToggleFavorite} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>
              {isFavorite ? '★ Đã lưu' : '☆ Lưu'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.sub}>
          {job.companyName} • {job.location}
        </Text>

        <View style={styles.pillsRow}>
          <Text style={styles.pill}>{job.category}</Text>
          <Text style={styles.pill}>{job.salaryText}</Text>
          <Text style={styles.pill}>{job.workTimeText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.body}>{job.description}</Text>

        <Text style={styles.sectionTitle}>Liên hệ</Text>
        <Text style={styles.body}>SĐT: {job.contactPhone}</Text>

        <Text style={styles.sectionTitle}>Đăng ký quan tâm</Text>
        <TextInput
          placeholder="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        <TextInput
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Ghi chú (tuỳ chọn)"
          value={note}
          onChangeText={setNote}
          style={[styles.input, styles.inputMultiline]}
          multiline
        />

        <Pressable
          onPress={submit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
        >
          <Text style={styles.primaryBtnText}>Gửi đăng ký</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  headerBtnText: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  sub: { color: '#6b7280', marginTop: 4 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16 },
  body: { marginTop: 6, lineHeight: 20 },
  input: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  primaryBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});
