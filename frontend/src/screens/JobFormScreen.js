import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

function trimOrNull(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

export function JobFormScreen({
  mode, // 'create' | 'edit'
  initialJob,
  categories = [],
  onCancel,
  onSubmit,
  submitting,
}) {
  const [title, setTitle] = useState(initialJob?.title ?? '');
  const [companyName, setCompanyName] = useState(initialJob?.companyName ?? '');
  const [location, setLocation] = useState(initialJob?.location ?? '');
  const [category, setCategory] = useState(initialJob?.category ?? '');
  const [salaryText, setSalaryText] = useState(initialJob?.salaryText ?? '');
  const [workTimeText, setWorkTimeText] = useState(
    initialJob?.workTimeText ?? ''
  );
  const [region, setRegion] = useState(initialJob?.region ?? '');
  const [district, setDistrict] = useState(initialJob?.district ?? '');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalStage, setLocationModalStage] = useState('region');
  const [locationSearch, setLocationSearch] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [description, setDescription] = useState(initialJob?.description ?? '');
  const [contactPhone, setContactPhone] = useState(
    initialJob?.contactPhone ?? ''
  );

  const regions = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 'Cần Thơ', 'Hải Phòng', 'Khánh Hòa', 'Quảng Ninh'];
  const districtMap = {
    'TP.HCM': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức', 'Bình Thạnh', 'Phú Nhuận', 'Gò Vấp', 'Tân Bình', 'Tân Phú', 'Bình Tân', 'Củ Chi', 'Hóc Môn', 'Bình Chánh', 'Nhà Bè', 'Cần Giờ'],
    'Hà Nội': ['Hoàn Kiếm', 'Ba Đình', 'Tây Hồ', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Cầu Giấy', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Long Biên', 'Hà Đông', 'Thanh Trì', 'Thanh Oai', 'Hoài Đức', 'Sóc Sơn', 'Đan Phượng', 'Đông Anh', 'Gia Lâm', 'Thường Tín', 'Mê Linh', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Thạch Thất', 'Chương Mỹ'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'],
    'Bình Dương': ['Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Bến Cát', 'Tân Uyên', 'Bắc Tân Uyên', 'Dầu Tiếng', 'Phú Giáo', 'Bàu Bàng', 'Hớn Quản'],
    'Đồng Nai': ['Biên Hòa', 'Long Khánh', 'Trảng Bom', 'Vĩnh Cửu', 'Nhơn Trạch', 'Long Thành', 'Cẩm Mỹ', 'Định Quán', 'Xuân Lộc', 'Tân Phú', 'Thống Nhất', 'Xuân Lộc'],
    'Cần Thơ': ['Ninh Kiều', 'Cái Răng', 'Ô Môn', 'Bình Thủy', 'Cờ Đỏ', 'Phong Điền', 'Thốt Nốt', 'Vĩnh Thạnh', 'Thới Lai'],
    'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Dương Kinh', 'An Dương', 'An Lão', 'Kiến Thụy', 'Tiên Lãng', 'Vĩnh Bảo', 'Thủy Nguyên', 'Cát Hải', 'Bạch Long Vĩ'],
    'Khánh Hòa': ['Nha Trang', 'Cam Ranh', 'Cam Lâm', 'Diên Khánh', 'Khánh Vĩnh', 'Khánh Sơn', 'Trường Sa'],
    'Quảng Ninh': ['Hạ Long', 'Móng Cái', 'Cẩm Phả', 'Uông Bí', 'Bình Liêu', 'Đầm Hà', 'Hải Hà', 'Tiên Yên', 'Ba Chẽ', 'Cô Tô'],
  };

  const filteredLocationItems = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    const items = locationModalStage === 'region'
      ? regions
      : districtMap[region] || [];
    if (!query) return items;
    return items.filter((item) => item.toLowerCase().includes(query));
  }, [locationModalStage, locationSearch, region]);
  const [status, setStatus] = useState(initialJob?.status ?? 'open');

  const availableCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((cat) => cat.name).filter(Boolean);
    }
    return [];
  }, [categories]);

  const filteredCategoryItems = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!availableCategories.length) return [];
    if (!query) return availableCategories;
    return availableCategories.filter((item) => item.toLowerCase().includes(query));
  }, [availableCategories, locationSearch]);

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      title.trim().length > 0 &&
      companyName.trim().length > 0 &&
      region.trim().length > 0 &&
      district.trim().length > 0 &&
      category.trim().length > 0
    );
  }, [submitting, title, companyName, region, district, category]);

  const submit = async () => {
    if (!canSubmit) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập tiêu đề, công ty, địa điểm và lĩnh vực.'
      );
      return;
    }

    const payload = {
      title: title.trim(),
      companyName: companyName.trim(),
      location: `${district.trim()}, ${region.trim()}`,
      region: region.trim(),
      district: district.trim(),
      detailAddress: trimOrNull(location),
      category: category.trim(),
      salaryText: trimOrNull(salaryText),
      workTimeText: trimOrNull(workTimeText),
      description: trimOrNull(description),
      contactPhone: trimOrNull(contactPhone),
      status: trimOrNull(status) ?? 'open',
    };

    await onSubmit(payload);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <Pressable onPress={onCancel} style={styles.backBtn} hitSlop={12}>
            <MaterialIcons name="close" size={24} color="#64748b" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {mode === 'edit' ? 'Chỉnh sửa tin' : 'Đăng tin mới'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info-outline" size={20} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề công việc *</Text>
              <TextInput
                placeholder="Ví dụ: Phục vụ quán cà phê"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên công ty / Cửa hàng *</Text>
              <TextInput
                placeholder="Ví dụ: The Coffee House"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Khu vực *</Text>
              <Pressable style={styles.selectInput} onPress={() => {
                setLocationModalStage('region');
                setLocationSearch('');
                setShowLocationModal(true);
              }}>
                <Text style={[styles.selectText, !region ? styles.placeholderText : null]}>
                  {region || 'Chọn tỉnh/thành'}
                </Text>
                <MaterialIcons name="keyboard-arrow-right" size={22} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quận / Huyện *</Text>
              <Pressable style={styles.selectInput} onPress={() => {
                if (!region) {
                  Alert.alert('Chọn khu vực trước', 'Vui lòng chọn tỉnh/thành trước khi chọn quận/huyện.');
                  return;
                }
                setLocationModalStage('district');
                setLocationSearch('');
                setShowLocationModal(true);
              }}>
                <Text style={[styles.selectText, !district ? styles.placeholderText : null]}>
                  {district || 'Chọn quận/huyện'}
                </Text>
                <MaterialIcons name="keyboard-arrow-right" size={22} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ chi tiết</Text>
              <TextInput
                placeholder="Ví dụ: 123 Nguyễn Huệ"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lĩnh vực *</Text>
              {availableCategories.length > 0 ? (
                <Pressable
                  style={styles.selectInput}
                  onPress={() => {
                    setLocationModalStage('category');
                    setLocationSearch('');
                    setShowCategoryModal(true);
                  }}
                >
                  <Text style={[styles.selectText, !category ? styles.placeholderText : null]}>
                    {category || 'Chọn lĩnh vực'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-right" size={22} color="#64748b" />
                </Pressable>
              ) : (
                <TextInput
                  placeholder="Ví dụ: F&B, Bán lẻ, Kho vận"
                  value={category}
                  onChangeText={setCategory}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="list-alt" size={20} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Chi tiết công việc</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mức lương</Text>
              <TextInput
                placeholder="Ví dụ: 25.000đ/giờ"
                value={salaryText}
                onChangeText={setSalaryText}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thời gian làm việc</Text>
              <TextInput
                placeholder="Ví dụ: 17:00 - 22:00"
                value={workTimeText}
                onChangeText={setWorkTimeText}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả công việc</Text>
              <TextInput
                placeholder="Các yêu cầu công việc, quyền lợi..."
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.inputMultiline]}
                multiline
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại liên hệ</Text>
              <TextInput
                placeholder="09xx xxx xxx"
                value={contactPhone}
                onChangeText={setContactPhone}
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          >
            <Text style={styles.submitBtnText}>
              {submitting
                ? 'Đang xử lý...'
                : mode === 'edit'
                  ? 'Cập nhật thay đổi'
                  : 'Đăng tin tuyển dụng'}
            </Text>
          </Pressable>
        </ScrollView>

        <Modal
          visible={showLocationModal || showCategoryModal}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setShowLocationModal(false);
            setShowCategoryModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>
                  {showCategoryModal
                    ? 'Chọn lĩnh vực'
                    : locationModalStage === 'region'
                      ? 'Chọn tỉnh/thành'
                      : 'Chọn quận/huyện'}
                </Text>
                <Pressable onPress={() => {
                  setShowLocationModal(false);
                  setShowCategoryModal(false);
                }} style={styles.modalCloseBtn}>
                  <MaterialIcons name="close" size={24} color="#475569" />
                </Pressable>
              </View>

              <View style={styles.modalSearchBox}>
                <MaterialIcons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
                <TextInput
                  value={locationSearch}
                  onChangeText={setLocationSearch}
                  placeholder={showCategoryModal ? 'Tìm lĩnh vực' : locationModalStage === 'region' ? 'Tìm tỉnh/thành' : 'Tìm quận/huyện'}
                  style={styles.modalSearchInput}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {(showCategoryModal ? filteredCategoryItems : filteredLocationItems).map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.modalItem,
                      (showCategoryModal && item === category) ||
                      (!showCategoryModal && locationModalStage === 'region' && item === region) ||
                      (!showCategoryModal && locationModalStage === 'district' && item === district)
                        ? styles.modalItemSelected
                        : null,
                    ]}
                    onPress={() => {
                      if (showCategoryModal) {
                        setCategory(item);
                        setShowCategoryModal(false);
                      } else if (locationModalStage === 'region') {
                        setRegion(item);
                        setDistrict('');
                        setShowLocationModal(false);
                      } else {
                        setDistrict(item);
                        setShowLocationModal(false);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        (showCategoryModal && item === category) ||
                        (!showCategoryModal && locationModalStage === 'region' && item === region) ||
                        (!showCategoryModal && locationModalStage === 'district' && item === district)
                          ? styles.modalItemTextSelected
                          : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectText: {
    fontSize: 15,
    color: '#1e293b',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  container: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f8fafc',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    margin: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  modalSearchBox: {
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
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  modalList: {
    maxHeight: '80%',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  modalItemText: {
    fontSize: 15,
    color: '#1e293b',
  },
  modalItemTextSelected: {
    fontWeight: '700',
    color: '#2563eb',
  },
});
