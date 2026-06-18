import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SALARY_UNITS = ['k', 'triệu'];
const TIME_UNITS = ['giờ', 'ngày', 'tuần'];

/**
 * Component nhập lương với format: "số + đơn vị + thời gian"
 * VD: "20 k/giờ", "5 triệu/ngày"
 */
export function SalaryInput({
  value = '',
  onChange,
  placeholder = 'Ví dụ: 20 k/giờ',
  style,
}) {
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editField, setEditField] = useState(null); // 'amount' | 'salaryUnit' | 'timeUnit'

  // Parse: "20 k/giờ" -> {amount: "20", salaryUnit: "k", timeUnit: "giờ"}
  const parseValue = (v) => {
    if (!v) return { amount: '', salaryUnit: 'k', timeUnit: 'giờ' };
    const match = v.match(/^(\d+)\s*([a-z\u00E1-\u1EFF]+)\/(\S+)$/i);
    if (!match) return { amount: '', salaryUnit: 'k', timeUnit: 'giờ' };
    return {
      amount: match[1],
      salaryUnit: match[2],
      timeUnit: match[3],
    };
  };

  const parsed = parseValue(value);

  const handleAmountChange = (text) => {
    const amount = text.replace(/\D/g, ''); // Chỉ lấy số
    const newValue = amount
      ? `${amount} ${parsed.salaryUnit}/${parsed.timeUnit}`
      : '';
    onChange(newValue);
  };

  const handleUnitSelect = (unit) => {
    let newValue;
    if (editField === 'salaryUnit') {
      newValue = parsed.amount
        ? `${parsed.amount} ${unit}/${parsed.timeUnit}`
        : '';
    } else if (editField === 'timeUnit') {
      newValue = parsed.amount
        ? `${parsed.amount} ${parsed.salaryUnit}/${unit}`
        : '';
    }
    onChange(newValue);
    setShowUnitModal(false);
    setEditField(null);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Số tiền"
          value={parsed.amount}
          onChangeText={handleAmountChange}
          style={styles.amountInput}
          keyboardType="number-pad"
          placeholderTextColor="#94a3b8"
        />

        <Pressable
          style={styles.unitBtn}
          onPress={() => {
            setEditField('salaryUnit');
            setShowUnitModal(true);
          }}
        >
          <Text style={styles.unitText}>{parsed.salaryUnit}</Text>
          <MaterialIcons name="expand-more" size={20} color="#64748b" />
        </Pressable>

        <Text style={styles.slash}>/</Text>

        <Pressable
          style={styles.unitBtn}
          onPress={() => {
            setEditField('timeUnit');
            setShowUnitModal(true);
          }}
        >
          <Text style={styles.unitText}>{parsed.timeUnit}</Text>
          <MaterialIcons name="expand-more" size={20} color="#64748b" />
        </Pressable>
      </View>

      <Text style={styles.example}>{placeholder}</Text>

      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowUnitModal(false)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Chọn {editField === 'salaryUnit' ? 'đơn vị lương' : 'đơn vị thời gian'}
            </Text>
            <Pressable
              onPress={() => setShowUnitModal(false)}
              style={styles.modalCloseBtn}
            >
              <MaterialIcons name="close" size={24} color="#475569" />
            </Pressable>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {(editField === 'salaryUnit' ? SALARY_UNITS : TIME_UNITS).map(
              (unit) => (
                <Pressable
                  key={unit}
                  style={[
                    styles.modalItem,
                    (editField === 'salaryUnit'
                      ? unit === parsed.salaryUnit
                      : unit === parsed.timeUnit)
                      ? styles.modalItemSelected
                      : null,
                  ]}
                  onPress={() => handleUnitSelect(unit)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      (editField === 'salaryUnit'
                        ? unit === parsed.salaryUnit
                        : unit === parsed.timeUnit)
                        ? styles.modalItemTextSelected
                        : null,
                    ]}
                  >
                    {unit === 'k' && 'k (Ngàn)'}
                    {unit === 'triệu' && 'm (Triệu)'}
                    {unit === 'giờ' && 'Giờ'}
                    {unit === 'ngày' && 'Ngày'}
                    {unit === 'tuần' && 'Tuần'}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 4,
    height: 50,
    gap: 4,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  unitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 70,
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  slash: {
    fontSize: 18,
    color: '#94a3b8',
    marginHorizontal: 2,
  },
  example: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalList: {
    paddingVertical: 8,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 15,
    color: '#1e293b',
  },
  modalItemTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
