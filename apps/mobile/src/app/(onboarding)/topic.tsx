import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboarding.store';
import { useUserStore } from '../../stores/user.store';
import { updateProfile } from '../../services/api';
import { OnboardingProgress } from '../../components/OnboardingProgress';

const TOPICS = [
  { value: 'algebra', label: 'Álgebra' },
  { value: 'geometry', label: 'Geometría' },
  { value: 'calculus', label: 'Cálculo' },
  { value: 'trigonometry', label: 'Trigonometría' },
  { value: 'statistics', label: 'Estadística' },
];

export default function OnboardingTopic() {
  const router = useRouter();
  const { mathLevel, learningGoal, studyMinutesDay, preferredTopic, setPreferredTopic, reset } =
    useOnboardingStore();
  const { updateUser } = useUserStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(topic: string) {
    if (submitting) return;
    setPreferredTopic(topic);
    setSubmitting(true);
    setError(null);

    try {
      const profile = await updateProfile({
        math_level: mathLevel ?? undefined,
        learning_goal: learningGoal || undefined,
        study_minutes_day: studyMinutesDay ?? undefined,
        preferred_topic: topic,
        onboarding_completed: true,
      });

      updateUser({
        mathLevel: profile.math_level ?? undefined,
        learningGoal: profile.learning_goal ?? undefined,
        studyMinutesDay: profile.study_minutes_day ?? undefined,
        preferredTopic: profile.preferred_topic ?? undefined,
        onboardingCompleted: profile.onboarding_completed,
      });

      reset();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('[onboarding/topic] Error:', err);
      setError('No se pudo guardar tu perfil. Intenta de nuevo.');
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={styles.loadingText}>Configurando tu experiencia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OnboardingProgress step={4} total={4} />
      <View style={styles.content}>
        <Text style={styles.title}>¿Con qué tema empezamos?</Text>
        <Text style={styles.subtitle}>Puedes cambiarlo después desde tu perfil</Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.options}>
          {TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.value}
              style={[
                styles.option,
                preferredTopic === topic.value && styles.optionSelected,
              ]}
              onPress={() => handleSelect(topic.value)}
            >
              <Text style={styles.optionText}>{topic.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 14,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 18,
  },
  optionSelected: {
    borderColor: '#4F6AF5',
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
});
