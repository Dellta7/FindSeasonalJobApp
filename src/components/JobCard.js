import { Pressable, StyleSheet, Text, View } from 'react-native';

export function JobCard({ job, onPress, isFavorite, onToggleFavorite }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {job.title}
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite?.(job.id);
          }}
          hitSlop={8}
        >
          <Text style={styles.badge}>
            {isFavorite ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sub} numberOfLines={1}>
        {job.companyName} • {job.location}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta} numberOfLines={1}>
          {job.salaryText}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {job.workTimeText}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  badge: {
    fontSize: 16,
  },
  sub: {
    color: '#6b7280',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: {
    color: '#111827',
  },
});
