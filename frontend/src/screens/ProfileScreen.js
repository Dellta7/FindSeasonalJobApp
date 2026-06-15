import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { JobCard } from '../components/JobCard';
import { getUserJobs, updateProfile, deleteUserAccount, getInquiriesByUserId, getInquiriesByApplicantId, updateInquiryStatus } from '../api/jobsApi';

const DEFAULT_AVATARS = [
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Nam
  'https://cdn-icons-png.flaticon.com/512/3135/3135768.png', // Nữ
];

export function ProfileScreen({
  user,
  jobs,
  favorites = [],
  favoriteIds,
  onToggleFavorite,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onUpdateUser,
  onLogout,
}) {
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posted'); // 'posted' | 'applied'
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Applicant modal
  const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
  const [applicants, setApplicants] = useState([]);
  
  // My Applications
  const [myApplications, setMyApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
          const [fetchedJobs, fetchedApplications] = await Promise.all([
            getUserJobs(user.id),
            getInquiriesByApplicantId(user.id)
          ]);
          if (!cancelled) {
            setUserJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
            setMyApplications(Array.isArray(fetchedApplications) ? fetchedApplications : []);
          }
        } catch (err) {
          if (!cancelled) {
            console.error('Lỗi tải dữ liệu:', err);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchData();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const postedJobs = userJobs;
  
  let displayJobs = userJobs;
  if (activeTab === 'applied') displayJobs = myApplications;

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Lỗi', 'Họ tên và Email không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProfile(user.id, {
        fullName: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        avatarUrl: editAvatarUrl,
      });
      onUpdateUser(updated);
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật');
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setEditAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
    }
  };

  const openApplicants = async () => {
    setLoading(true);
    try {
      const allInquiries = await getInquiriesByUserId(user.id);
      setApplicants(allInquiries);
      setApplicantsModalVisible(true);
    } catch (err) {
      console.error('Failed to load applicants:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách ứng tuyển: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      setApplicants((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
      );
      Alert.alert('Thành công', newStatus === 'confirmed' ? 'Đã xác nhận ứng viên' : 'Đã từ chối ứng viên');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái: ' + err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bài',
          style: 'destructive',
          onPress: () => {
            onDeleteJob(jobId);
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu bài đăng và ứng tuyển của bạn sẽ bị ảnh hưởng. Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUserAccount(user.id);
              Alert.alert('Thành công', 'Tài khoản của bạn đã được xóa.');
              onLogout();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa tài khoản: ' + err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openApplicationDetail = (application) => {
    setSelectedApplication(application);
    setApplicationModalVisible(true);
  };

  const closeApplicationDetail = () => {
    setSelectedApplication(null);
    setApplicationModalVisible(false);
  };

  const renderAvatar = (url, size = 64) => {
    if (url) {
      return (
        <View style={[styles.avatarWrapper, { width: size, height: size }]}>
          <Image 
            source={{ uri: url }} 
            style={{ width: size, height: size, borderRadius: size / 2 }} 
          />
        </View>
      );
    }
    return (
      <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size / 2.5 }]}>
          {user?.fullName?.[0]?.toUpperCase() || 'U'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {renderAvatar(user?.avatarUrl)}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.editProfileBtn} 
            onPress={() => {
              setEditName(user?.fullName || '');
              setEditEmail(user?.email || '');
              setEditPhone(user?.phone || '');
              setEditAddress(user?.address || '');
              setEditAvatarUrl(user?.avatarUrl || '');
              setEditModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={16} color="#475569" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Sửa hồ sơ</Text>
          </Pressable>
          <Pressable style={styles.logoutButton} onPress={onLogout} hitSlop={8}>
            <MaterialIcons name="logout" size={16} color="#ef4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
          <Pressable 
            style={[styles.logoutButton, { borderColor: '#e2e8f0' }]} 
            onPress={handleDeleteAccount} 
            hitSlop={8}
          >
            <MaterialIcons name="person-remove" size={16} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={[styles.logoutText, { color: '#64748b' }]}>Xóa tài khoản</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelGroup}>
            <MaterialIcons name="notifications-active" size={20} color="#64748b" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.settingTitle}>Sẵn sàng làm việc</Text>
              <Text style={styles.settingSub}>Nhận thông báo khi có việc mới phù hợp</Text>
            </View>
          </View>
          <Switch
            value={isReady}
            onValueChange={setIsReady}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={isReady ? '#2563eb' : '#f8fafc'}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'posted' && styles.activeTab]}
          onPress={() => setActiveTab('posted')}
        >
          <MaterialIcons 
            name="post-add" 
            size={20} 
            color={activeTab === 'posted' ? '#2563eb' : '#64748b'} 
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.tabText, activeTab === 'posted' && styles.activeTabText]}>Bài đăng ({postedJobs.length})</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
          onPress={() => setActiveTab('applied')}
        >
          <MaterialIcons 
            name="assignment-turned-in" 
            size={20} 
            color={activeTab === 'applied' ? '#2563eb' : '#64748b'} 
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.tabText, activeTab === 'applied' && styles.activeTabText]}>Đã nộp ({myApplications.length})</Text>
        </Pressable>
      </View>

      {activeTab === 'applied' ? (
        <FlatList
          data={myApplications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.applicationCard, pressed && styles.pressedCard]}
              onPress={() => openApplicationDetail(item)}
            >
              <View style={styles.applicantItem}>
                <View style={styles.applicantHeader}>
                  <Text style={styles.applicantJob}>{item.jobTitle}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'confirmed' ? styles.statusConfirmed : 
                    item.status === 'rejected' ? styles.statusRejected : styles.statusPending
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.status === 'confirmed' ? styles.statusTextConfirmed :
                      item.status === 'rejected' ? styles.statusTextRejected : styles.statusTextPending
                    ]}>
                      {item.status === 'confirmed' ? 'Đã xác nhận' : 
                       item.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}
                    </Text>
                  </View>
                </View>
                <View style={styles.appliedMeta}>
                  <MaterialIcons name="person" size={16} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.applicantCompany}>{item.fullName || 'Bạn'}</Text>
                </View>
                <View style={styles.appliedMeta}>
                  <MaterialIcons name="business" size={16} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.applicantCompany}>{item.companyName}</Text>
                </View>
                <View style={styles.appliedMeta}>
                  <MaterialIcons name="event" size={16} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.applicantPhone}>Ngày nộp: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa ứng tuyển công việc nào</Text>}
        />
      ) : (
        <FlatList
          data={displayJobs}
          keyExtractor={(job) => String(job.id)}
          ListHeaderComponent={activeTab === 'posted' && (
            <Pressable style={styles.viewApplicantsBtn} onPress={openApplicants}>
              <MaterialIcons name="people" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.viewApplicantsBtnText}>Xem danh sách người ứng tuyển</Text>
            </Pressable>
          )}
          renderItem={({ item }) => (
            <View style={styles.jobItemContainer}>
              <JobCard
                job={item}
                isFavorite={favoriteIds.has(item.id)}
                onPress={() => onSelectJob(item.id)}
                onToggleFavorite={() => onToggleFavorite(item.id)}
              />
              {activeTab === 'posted' && (
                <View style={styles.jobActions}>
                  <Pressable
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => onEditJob(item)}
                  >
                    <MaterialIcons name="edit" size={18} color="#16a34a" style={{ marginRight: 4 }} />
                    <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteJob(item.id)}
                  >
                    <MaterialIcons name="delete" size={18} color="#dc2626" style={{ marginRight: 4 }} />
                    <Text style={styles.deleteBtnText}>Xóa</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons 
                name={activeTab === 'posted' ? 'edit-note' : 'star-outline'} 
                size={64} 
                color="#cbd5e1" 
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyText}>Bạn chưa đăng tin tuyển dụng nào</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            const refetchData = async () => {
              if (!user?.id) return;
              try {
                const [fetchedJobs, fetchedApplications] = await Promise.all([
                  getUserJobs(user.id),
                  getInquiriesByApplicantId(user.id)
                ]);
                setUserJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
                setMyApplications(Array.isArray(fetchedApplications) ? fetchedApplications : []);
              } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
              } finally {
                setLoading(false);
              }
            };
            refetchData();
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Hủy</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Sửa hồ sơ</Text>
            <Pressable 
              onPress={handleUpdateProfile} 
              disabled={submitting}
              style={[styles.modalSaveBtn, submitting && { opacity: 0.5 }]}
            >
              <Text style={styles.modalSaveText}>{submitting ? 'Lưu...' : 'Lưu'}</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarPickerSection}>
              <View style={styles.currentAvatarWrapper}>
                {renderAvatar(editAvatarUrl, 100)}
                <Pressable style={styles.cameraIconBtn} onPress={pickImage}>
                  <MaterialIcons name="camera-alt" size={18} color="#1e293b" />
                </Pressable>
              </View>
              
              <Text style={styles.pickerLabel}>Chọn ảnh đại diện</Text>
              <View style={styles.defaultAvatarsRow}>
                {DEFAULT_AVATARS.map((url, idx) => (
                  <Pressable 
                    key={idx} 
                    onPress={() => setEditAvatarUrl(url)}
                    style={[
                      styles.defaultAvatarOption,
                      editAvatarUrl === url && styles.activeAvatarOption
                    ]}
                  >
                    <Image source={{ uri: url }} style={styles.defaultAvatarImg} />
                  </Pressable>
                ))}
                <Pressable 
                  onPress={pickImage}
                  style={[
                    styles.defaultAvatarOption,
                    styles.uploadOption,
                    !DEFAULT_AVATARS.includes(editAvatarUrl) && editAvatarUrl !== '' && styles.activeAvatarOption
                  ]}
                >
                  <MaterialIcons name="photo-library" size={24} color="#64748b" />
                  <Text style={styles.uploadText}>Thư viện</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Họ và tên"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="09xx xxx xxx"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={applicationModalVisible}
        animationType="slide"
        onRequestClose={closeApplicationDetail}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeApplicationDetail} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Chi tiết hồ sơ</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Người nộp</Text>
            <Text style={styles.detailValue}>{selectedApplication?.fullName || 'Bạn'}</Text>

            <Text style={styles.detailLabel}>Công việc</Text>
            <Text style={styles.detailValue}>{selectedApplication?.jobTitle || '-'}</Text>

            <Text style={styles.detailLabel}>Công ty</Text>
            <Text style={styles.detailValue}>{selectedApplication?.companyName || '-'}</Text>

            <Text style={styles.detailLabel}>Trạng thái</Text>
            <Text style={styles.detailValue}>{selectedApplication?.status === 'confirmed' ? 'Đã xác nhận' : selectedApplication?.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}</Text>

            <Text style={styles.detailLabel}>Ngày nộp</Text>
            <Text style={styles.detailValue}>{selectedApplication?.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString('vi-VN') : '-'}</Text>

            <Text style={styles.detailLabel}>Số điện thoại</Text>
            <Text style={styles.detailValue}>{selectedApplication?.phone || '-'}</Text>

            <Text style={styles.detailLabel}>Ghi chú</Text>
            <Text style={styles.detailValue}>{selectedApplication?.note || 'Không có ghi chú'}</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Applicants Modal */}
      <Modal
        visible={applicantsModalVisible}
        animationType="slide"
        onRequestClose={() => setApplicantsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setApplicantsModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Danh sách ứng tuyển</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={applicants}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.formSection}
            renderItem={({ item }) => (
              <View style={styles.applicantItem}>
                <View style={styles.applicantHeader}>
                  <Text style={styles.applicantJob}>{item.jobTitle}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'confirmed' ? styles.statusConfirmed : 
                    item.status === 'rejected' ? styles.statusRejected : styles.statusPending
                  ]}>
                    <Text style={[
                      styles.statusText,
                      item.status === 'confirmed' ? styles.statusTextConfirmed :
                      item.status === 'rejected' ? styles.statusTextRejected : styles.statusTextPending
                    ]}>
                      {item.status === 'confirmed' ? 'Đã xác nhận' : 
                       item.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.applicantName}>{item.fullName}</Text>
                <View style={styles.appliedMeta}>
                  <MaterialIcons name="phone" size={16} color="#475569" style={{ marginRight: 6 }} />
                  <Text style={styles.applicantPhone}>{item.phone}</Text>
                </View>
                {item.note && (
                  <View style={styles.appliedMeta}>
                    <MaterialIcons name="chat-bubble-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.applicantNote}>{item.note}</Text>
                  </View>
                )}
                
                {item.status === 'pending' && (
                  <View style={styles.applicantActions}>
                    <Pressable
                      style={[styles.confirmBtn, { flex: 1, marginTop: 0 }]}
                      onPress={() => handleUpdateInquiryStatus(item.id, 'confirmed')}
                    >
                      <MaterialIcons name="check" size={18} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.confirmBtnText}>Xác nhận</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.rejectBtn, { flex: 1 }]}
                      onPress={() => handleUpdateInquiryStatus(item.id, 'rejected')}
                    >
                      <MaterialIcons name="close" size={18} color="#ef4444" style={{ marginRight: 4 }} />
                      <Text style={styles.rejectBtnText}>Từ chối</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có ai ứng tuyển vào bài đăng nào của bạn</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarWrapper: {
    marginRight: 20,
  },
  avatarContainer: {
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontWeight: '800',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  applicationCard: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pressedCard: {
    opacity: 0.8,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 18,
  },
  detailValue: {
    fontSize: 16,
    color: '#0f172a',
    marginTop: 6,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  modalCloseBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },

  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
  },
  settingsSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 16,
  },
  jobItemContainer: {
    marginBottom: 8,
  },
  jobActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: -4,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  editBtnText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 99,
    backgroundColor: '#f1f5f9',
  },
  emptyBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  viewApplicantsBtn: {
    flexDirection: 'row',
    margin: 20,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewApplicantsBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalCloseText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  avatarPickerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
  },
  currentAvatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
  },
  defaultAvatarsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  defaultAvatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  activeAvatarOption: {
    borderColor: '#2563eb',
  },
  defaultAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  uploadOption: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  uploadText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  formSection: {
    padding: 20,
    gap: 20,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  applicantItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  applicantJob: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  applicantPhone: {
    fontSize: 14,
    color: '#475569',
  },
  applicantNote: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  applicantCompany: {
    fontSize: 14,
    color: '#475569',
  },
  appliedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#d97706',
  },
  statusTextConfirmed: {
    color: '#16a34a',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusTextRejected: {
    color: '#dc2626',
  },
  applicantActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  rejectBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
  },
});
