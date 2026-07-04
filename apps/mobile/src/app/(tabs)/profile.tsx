import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../stores/user.store';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            logout();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {user?.subjectFocus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enfoque actual</Text>
            <Text style={styles.sectionValue}>{user.subjectFocus}</Text>
          </View>
        )}

        {user?.learningGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetivo</Text>
            <Text style={styles.sectionValue}>{user.learningGoal}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F6AF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  logoutButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
