import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboarding.store';
import { OnboardingProgress } from '../../components/OnboardingProgress';

export default function OnboardingGoal() {
  const router = useRouter();
  const { learningGoal, setLearningGoal } = useOnboardingStore();
  const [text, setText] = useState(learningGoal);

  function handleNext() {
    setLearningGoal(text.trim());
    router.push('/(onboarding)/time');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgress step={2} total={4} />
      <View style={styles.content}>
        <Text style={styles.title}>¿Cuál es tu objetivo?</Text>
        <Text style={styles.subtitle}>Cuéntanos qué quieres lograr practicando matemáticas</Text>

        <TextInput
          style={styles.input}
          placeholder="Ej: Aprobar cálculo 1, reforzar álgebra..."
          placeholderTextColor="#94A3B8"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          maxLength={200}
        />

        <TouchableOpacity
          style={[styles.primaryButton, text.trim().length === 0 && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={text.trim().length === 0}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(onboarding)/time')}>
          <Text style={styles.skipText}>Prefiero no decirlo ahora</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4F6AF5',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
  },
});
