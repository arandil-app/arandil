import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../stores/user.store';
import { getPracticeStats, type PracticeStats } from '../../services/api';

const TOPIC_LABELS: Record<string, string> = {
  algebra: 'Álgebra',
  geometry: 'Geometría',
  calculus: 'Cálculo',
  trigonometry: 'Trigonometría',
  statistics: 'Estadística',
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUserStore();
  const [stats, setStats] = useState<PracticeStats | null>(null);

  useEffect(() => {
    getPracticeStats()
      .then(setStats)
      .catch((err) => console.error('[dashboard] Failed to load stats:', err));
  }, []);

  const topicLabel = user?.preferredTopic ? TOPIC_LABELS[user.preferredTopic] : null;
  const ctaLabel = topicLabel ? `Practicar ${topicLabel}` : 'Comenzar práctica';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          Hola{user?.name ? `, ${user.name}` : ''}! 👋
        </Text>
        <Text style={styles.subtitle}>¿Listo para practicar hoy?</Text>

        {/* Racha */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Racha de estudio</Text>
          <Text style={styles.streakNumber}>{stats?.streak_days ?? 0} días</Text>
          <Text style={styles.cardSubtitle}>
            {stats?.streak_days ? 'Sigue así, no rompas la racha' : '¡Comienza hoy tu racha!'}
          </Text>
        </View>

        {/* Preferred topic (from onboarding) */}
        {topicLabel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Enfoque actual</Text>
            <Text style={styles.focusText}>{topicLabel}</Text>
            {user?.studyMinutesDay && (
              <Text style={styles.cardSubtitle}>
                Meta: {user.studyMinutesDay} min/día
              </Text>
            )}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
        </TouchableOpacity>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.total_cards ?? 0}</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.accuracy_percent ?? 0}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.cards_due_today ?? 0}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  focusText: {
    fontSize: 18,
    color: '#4F6AF5',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4F6AF5',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
});
