import { useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Giống Google Time Picker - Chọn giờ:phút
 * @param {boolean} visible - Hiển thị modal
 * @param {string} initialTime - Thời gian ban đầu (VD: "14:30")
 * @param {function} onSelect - Callback khi chọn (nhận {hours, minutes, display})
 * @param {function} onClose - Callback khi đóng
 */
export function TimePicker({ visible, initialTime, onSelect, onClose }) {
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 0, minutes: 0 };
    const [h, m] = timeStr.split(':').map(Number);
    return { hours: h || 0, minutes: m || 0 };
  };

  const initial = parseTime(initialTime);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);

  const hoursList = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutesList = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const handleSelect = () => {
    const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onSelect({ hours, minutes, display });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chọn thời gian</Text>
        </View>

        <View style={styles.pickerRow}>
          {/* Hours */}
          <ScrollView
            style={styles.column}
            snapToInterval={60}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / 60);
              const validIdx = Math.max(0, Math.min(23, idx));
              setHours(hoursList[validIdx]);
            }}
          >
            {hoursList.map((h) => (
              <Pressable
                key={h}
                style={styles.item}
                onPress={() => setHours(h)}
              >
                <Text
                  style={[
                    styles.itemText,
                    h === hours && styles.itemTextSelected,
                  ]}
                >
                  {String(h).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.separator}>:</Text>

          {/* Minutes */}
          <ScrollView
            style={styles.column}
            snapToInterval={60}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.y / 60);
              const validIdx = Math.max(0, Math.min(59, idx));
              setMinutes(minutesList[validIdx]);
            }}
          >
            {minutesList.map((m) => (
              <Pressable
                key={m}
                style={styles.item}
                onPress={() => setMinutes(m)}
              >
                <Text
                  style={[
                    styles.itemText,
                    m === minutes && styles.itemTextSelected,
                  ]}
                >
                  {String(m).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.btn, styles.btnCancel]}
            onPress={onClose}
          >
            <Text style={styles.btnCancelText}>Hủy</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnConfirm]}
            onPress={handleSelect}
          >
            <Text style={styles.btnConfirmText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    height: 240,
  },
  column: {
    flex: 1,
    height: 180,
  },
  item: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 28,
    color: '#94a3b8',
    fontWeight: '400',
  },
  itemTextSelected: {
    fontSize: 32,
    color: '#2563eb',
    fontWeight: '700',
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#f1f5f9',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  btnConfirm: {
    backgroundColor: '#2563eb',
  },
  btnConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
