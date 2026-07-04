import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Progress() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mi Progreso</Text>
        <Text style={styles.subtitle}>Aquí verás tus curvas de aprendizaje</Text>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📊</Text>
          <Text style={styles.placeholderTitle}>Próximamente</Text>
          <Text style={styles.placeholderSubtitle}>
            Curvas BKT por tema, estadísticas detalladas y más
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
