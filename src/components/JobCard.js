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

      <Text style={styles.company} numberOfLines={1}>
        {job.companyName}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.muted} numberOfLines={1}>
          {job.location}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          {job.workTimeText}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.tag} numberOfLines={1}>
          {job.category}
        </Text>
        <Text style={styles.salary} numberOfLines={1}>
          {job.salaryText}
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
  company: {
    color: '#111827',
    marginTop: 6,
    fontWeight: '600',
  },
  infoRow: {
    marginTop: 6,
    gap: 4,
  },
  muted: {
    color: '#6b7280',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  salary: {
    fontWeight: '700',
    color: '#111827',
  },
});
