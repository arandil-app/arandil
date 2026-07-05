import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboarding.store';
import type { MathLevel } from '../../stores/user.store';
import { OnboardingProgress } from '../../components/OnboardingProgress';

const LEVELS: { value: MathLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Principiante', description: 'Estoy empezando con matemáticas' },
  { value: 'intermediate', label: 'Intermedio', description: 'Manejo lo básico, quiero reforzar' },
  { value: 'advanced', label: 'Avanzado', description: 'Busco retos y práctica constante' },
];

export default function OnboardingLevel() {
  const router = useRouter();
  const { mathLevel, setMathLevel } = useOnboardingStore();

  function handleSelect(level: MathLevel) {
    setMathLevel(level);
    router.push('/(onboarding)/goal');
  }

  return (
    <View style={styles.container}>
      <OnboardingProgress step={1} total={4} />
      <View style={styles.content}>
        <Text style={styles.title}>¿Cuál es tu nivel actual?</Text>
        <Text style={styles.subtitle}>Nos ayuda a elegir preguntas del nivel correcto</Text>

        <View style={styles.options}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.option, mathLevel === level.value && styles.optionSelected]}
              onPress={() => handleSelect(level.value)}
            >
              <Text style={styles.optionLabel}>{level.label}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
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
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
  },
});
