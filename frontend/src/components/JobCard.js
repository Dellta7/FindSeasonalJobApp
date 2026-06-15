import { Pressable, StyleSheet, Text, View, Animated as RNAnimated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function JobCard({ job, onPress, isFavorite, onToggleFavorite, onDelete }) {
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Pressable
          style={[styles.actionButton, styles.favoriteAction]}
          onPress={() => onToggleFavorite(job.id)}
        >
          <RNAnimated.View style={{ transform: [{ scale: trans }] }}>
            <MaterialIcons
              name={isFavorite ? 'star' : 'star-outline'}
              size={24}
              color="#fff"
            />
          </RNAnimated.View>
        </Pressable>
        {onDelete && (
          <Pressable
            style={[styles.actionButton, styles.deleteAction]}
            onPress={() => onDelete(job.id)}
          >
            <RNAnimated.View style={{ transform: [{ scale: trans }] }}>
              <MaterialIcons name="delete-outline" size={24} color="#fff" />
            </RNAnimated.View>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Swipeable renderRightActions={renderRightActions} friction={2}>
        <Pressable onPress={onPress} style={styles.card}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {job.title}
                </Text>
                <Text style={styles.company} numberOfLines={1}>
                  {job.companyName}
                </Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  onToggleFavorite?.(job.id);
                }}
                style={styles.favoriteButton}
                hitSlop={12}
              >
                <MaterialIcons 
                  name={isFavorite ? 'star' : 'star-outline'} 
                  size={22} 
                  color={isFavorite ? '#f59e0b' : '#94a3b8'} 
                />
              </Pressable>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="place" size={16} color="#64748b" style={styles.icon} />
                <Text style={styles.detailText}>{job.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="access-time" size={16} color="#64748b" style={styles.icon} />
                <Text style={styles.detailText}>{job.workTimeText || 'Linh hoạt'}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{job.category}</Text>
              </View>
              <View style={styles.salaryRow}>
                <MaterialIcons name="payments" size={18} color="#059669" style={styles.icon} />
                <Text style={styles.salaryText}>{job.salaryText || 'Thoả thuận'}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteAction: {
    backgroundColor: '#f59e0b',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
  },
});
