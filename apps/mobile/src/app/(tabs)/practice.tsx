import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { getNextCard, submitReview, type Question, type Card } from '../../services/api';

export default function Practice() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNextCard();
  }, []);

  async function loadNextCard(retryCount = 0) {
    setLoading(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setStartTime(Date.now());
    setError(null);

    try {
      const data = await getNextCard();
      setCard(data.card);
      setQuestion(data.question);
    } catch (err) {
      console.error('[loadNextCard] Error:', err);
      setError('No se pudo cargar la pregunta');

      // Retry logic: up to 2 retries with exponential backoff
      if (retryCount < 2) {
        setTimeout(() => {
          loadNextCard(retryCount + 1);
        }, 1000 * (retryCount + 1)); // 1s, 2s
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!card || !question || selectedIndex === null || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const correct = selectedIndex === question.correct_index;
      const responseTime = Date.now() - startTime;

      await submitReview(card.id, rating, correct, responseTime);

      // Load next card
      loadNextCard();
    } catch (err) {
      console.error('[handleSubmitReview] Error:', err);
      setError('No se pudo enviar la respuesta. Intenta de nuevo.');
      setSubmitting(false); // Allow retry
    }
  }

  function handleSelectOption(index: number) {
    if (showSolution) return; // Don't allow changing answer after showing solution
    setSelectedIndex(index);
  }

  function handleShowSolution() {
    if (selectedIndex === null) {
      Alert.alert('Selecciona una respuesta', 'Por favor selecciona una opción primero');
      return;
    }
    setShowSolution(true);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={styles.loadingText}>Cargando pregunta...</Text>
      </View>
    );
  }

  if (error && !question) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadNextCard()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!question || !card) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>🎉</Text>
        <Text style={styles.emptyTitle}>¡Completaste todas las cards disponibles!</Text>
        <Text style={styles.emptySubtitle}>Vuelve más tarde para seguir practicando</Text>
      </View>
    );
  }

  const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
  const isCorrect = selectedIndex === question.correct_index;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Topic badge */}
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>
            {question.topic.charAt(0).toUpperCase() + question.topic.slice(1)}
            {question.subtopic && ` • ${question.subtopic}`}
          </Text>
        </View>

        {/* Question stem */}
        <Text style={styles.questionStem}>{question.stem}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option: string, index: number) => {
            const isSelected = selectedIndex === index;
            const isCorrectOption = index === question.correct_index;
            const showCorrect = showSolution && isCorrectOption;
            const showWrong = showSolution && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && !showSolution && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => handleSelectOption(index)}
                disabled={showSolution}
              >
                <Text
                  style={[
                    styles.optionText,
                    (isSelected || showCorrect || showWrong) && styles.optionTextSelected,
                  ]}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Solution steps */}
        {showSolution && question.solution_steps && (
          <View style={styles.solutionContainer}>
            <Text style={styles.solutionTitle}>📝 Solución:</Text>
            {(typeof question.solution_steps === 'string'
              ? JSON.parse(question.solution_steps)
              : question.solution_steps
            ).map((step: string, index: number) => (
              <Text key={index} style={styles.solutionStep}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>
        )}

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Actions */}
        {!showSolution ? (
          <TouchableOpacity
            style={[styles.primaryButton, selectedIndex === null && styles.buttonDisabled]}
            onPress={handleShowSolution}
            disabled={selectedIndex === null}
          >
            <Text style={styles.primaryButtonText}>Ver solución</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>¿Qué tal te fue?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  styles.ratingAgain,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={() => handleSubmitReview('again')}
                disabled={submitting}
              >
                <Text style={styles.ratingButtonText}>Otra vez</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  styles.ratingHard,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={() => handleSubmitReview('hard')}
                disabled={submitting}
              >
                <Text style={styles.ratingButtonText}>Difícil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  styles.ratingGood,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={() => handleSubmitReview('good')}
                disabled={submitting}
              >
                <Text style={styles.ratingButtonText}>Bien</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ratingButton,
                  styles.ratingEasy,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={() => handleSubmitReview('easy')}
                disabled={submitting}
              >
                <Text style={styles.ratingButtonText}>Fácil</Text>
              </TouchableOpacity>
            </View>
            {submitting && (
              <ActivityIndicator size="small" color="#4F6AF5" style={{ marginTop: 12 }} />
            )}
          </View>
        )}
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
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F6AF5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  topicBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F6AF5',
  },
  questionStem: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  optionSelected: {
    borderColor: '#4F6AF5',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  solutionContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  solutionStep: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4F6AF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    marginTop: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingAgain: {
    backgroundColor: '#EF4444',
  },
  ratingHard: {
    backgroundColor: '#F97316',
  },
  ratingGood: {
    backgroundColor: '#10B981',
  },
  ratingEasy: {
    backgroundColor: '#3B82F6',
  },
  ratingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
