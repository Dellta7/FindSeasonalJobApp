import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { createJobInquiry } from '../api/jobsApi';

export function JobDetailScreen({
  job,
  user,
  isFavorite,
  onBack,
  onToggleFavorite,
  onEdit,
  onDelete,
}) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.id === job.userId;

  const canSubmit = useMemo(() => {
    return (
      !isOwner &&
      fullName.trim().length > 0 && 
      phone.trim().length > 0 && 
      !submitting
    );
  }, [isOwner, fullName, phone, submitting]);

  const submit = async () => {
    if (submitting) return;
    if (fullName.trim().length === 0 || phone.trim().length === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và số điện thoại.');
      return;
    }

    setSubmitting(true);
    try {
      await createJobInquiry(job.id, {
        fullName,
        phone,
        note,
        userId: user?.id || null,
      });

      Alert.alert(
        'Đã ghi nhận',
        'Yêu cầu đăng ký quan tâm của bạn đã được ghi nhận.'
      );
      // Reset form but keep profile info if it was pre-filled
      setFullName(user?.fullName || '');
      setPhone(user?.phone || '');
      setNote('');
    } catch (err) {
      Alert.alert('Lỗi', 'Không gửi được đăng ký. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={onToggleFavorite} style={styles.actionBtn} hitSlop={12}>
              <MaterialIcons 
                name={isFavorite ? 'star' : 'star-outline'} 
                size={24} 
                color={isFavorite ? '#f59e0b' : '#94a3b8'} 
              />
            </Pressable>
            {(typeof onEdit === 'function' || typeof onDelete === 'function') && (
              <View style={styles.adminActions}>
                {typeof onEdit === 'function' && (
                  <Pressable onPress={onEdit} style={styles.actionBtn} hitSlop={12}>
                    <MaterialIcons name="edit" size={20} color="#334155" />
                  </Pressable>
                )}
                {typeof onDelete === 'function' && (
                  <Pressable
                    onPress={() => {
                      Alert.alert('Xoá việc', 'Bạn chắc chắn muốn xoá việc này?', [
                        { text: 'Huỷ', style: 'cancel' },
                        {
                          text: 'Xoá',
                          style: 'destructive',
                          onPress: () => {
                            Promise.resolve(onDelete()).catch(() => {
                              Alert.alert('Lỗi', 'Không xoá được việc. Vui lòng thử lại.');
                            });
                          },
                        },
                      ]);
                    }}
                    style={styles.actionBtn}
                    hitSlop={12}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.companyAvatar}>
              <Text style={styles.companyLetter}>{job.companyName?.[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.companyName}>{job.companyName}</Text>
            
            <View style={styles.quickInfo}>
              <View style={styles.infoPill}>
                <MaterialIcons name="place" size={14} color="#475569" style={styles.pillIcon} />
                <Text style={styles.infoPillText}>{job.location}</Text>
              </View>
              <View style={styles.infoPill}>
                <MaterialIcons name="work-outline" size={14} color="#475569" style={styles.pillIcon} />
                <Text style={styles.infoPillText}>{job.category}</Text>
              </View>
              {job.salaryText ? (
                <View style={[styles.infoPill, styles.salaryPill]}>
                  <MaterialIcons name="payments" size={14} color="#059669" style={styles.pillIcon} />
                  <Text style={styles.salaryPillText}>{job.salaryText}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả công việc</Text>
            <Text style={styles.bodyText}>{job.description || 'Chưa có mô tả chi tiết.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <MaterialIcons name="phone" size={20} color="#64748b" style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactLabel}>Số điện thoại:</Text>
                  <Text style={styles.contactValue}>{job.contactPhone || 'Liên hệ qua form bên dưới'}</Text>
                </View>
              </View>
              {job.workTimeText ? (
                <View style={[styles.contactItem, { marginTop: 16 }]}>
                  <MaterialIcons name="access-time" size={20} color="#64748b" style={styles.contactIcon} />
                  <View>
                    <Text style={styles.contactLabel}>Thời gian làm việc:</Text>
                    <Text style={styles.contactValue}>{job.workTimeText}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {isOwner ? (
            <View style={styles.ownerMessage}>
              <MaterialIcons name="info-outline" size={20} color="#475569" style={{ marginBottom: 4 }} />
              <Text style={styles.ownerMessageText}>Đây là tin tuyển dụng của bạn.</Text>
            </View>
          ) : (
            <View style={styles.applySection}>
              <Text style={styles.applyTitle}>Ứng tuyển ngay</Text>
              <Text style={styles.applySub}>Nhập thông tin để nhà tuyển dụng liên hệ với bạn.</Text>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên *</Text>
                  <TextInput
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChangeText={setFullName}
                    style={styles.input}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại *</Text>
                  <TextInput
                    placeholder="09xx xxx xxx"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
                  <TextInput
                    placeholder="Kinh nghiệm của bạn, thời gian có thể đi làm..."
                    value={note}
                    onChangeText={setNote}
                    style={[styles.input, styles.inputMultiline]}
                    multiline
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <Pressable
                  onPress={submit}
                  disabled={!canSubmit}
                  style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Đang gửi...' : 'Gửi thông tin ứng tuyển'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  adminActions: {
    flexDirection: 'row',
  },
  container: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  companyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  companyLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 20,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: '#f1f5f9',
  },
  pillIcon: {
    marginRight: 4,
  },
  infoPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  salaryPill: {
    backgroundColor: '#ecfdf5',
  },
  salaryPillText: {
    color: '#059669',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 8,
    borderTopColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  contactCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    marginRight: 12,
  },
  contactLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '700',
  },
  applySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderTopWidth: 8,
    borderTopColor: '#f8fafc',
  },
  applyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  applySub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ownerMessage: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  ownerMessageText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
});
