import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboarding.store';
import { OnboardingProgress } from '../../components/OnboardingProgress';

const OPTIONS = [15, 30, 45, 60];

export default function OnboardingTime() {
  const router = useRouter();
  const { studyMinutesDay, setStudyMinutesDay } = useOnboardingStore();

  function handleSelect(minutes: number) {
    setStudyMinutesDay(minutes);
    router.push('/(onboarding)/topic');
  }

  return (
    <View style={styles.container}>
      <OnboardingProgress step={3} total={4} />
      <View style={styles.content}>
        <Text style={styles.title}>¿Cuánto tiempo tienes al día?</Text>
        <Text style={styles.subtitle}>Ajustamos tus sesiones a tu disponibilidad</Text>

        <View style={styles.options}>
          {OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.option,
                studyMinutesDay === minutes && styles.optionSelected,
              ]}
              onPress={() => handleSelect(minutes)}
            >
              <Text
                style={[
                  styles.optionText,
                  studyMinutesDay === minutes && styles.optionTextSelected,
                ]}
              >
                {minutes} min
              </Text>
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
    marginBottom: 32,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#4F6AF5',
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionTextSelected: {
    color: '#4F6AF5',
  },
});
