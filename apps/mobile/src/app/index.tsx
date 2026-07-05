import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '../stores/user.store';
import { supabase } from '../lib/supabase';
import { getProfile } from '../services/api';

export default function Index() {
  const router = useRouter();
  const { setUser, setLoading, isLoading } = useUserStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });

        // Onboarding gate: fetch profile to decide onboarding vs dashboard.
        // If the profile fetch fails (e.g. network hiccup), fail open to the
        // dashboard rather than trapping the user on a blank loading screen —
        // practice screens degrade gracefully with their own error/retry states.
        try {
          const profile = await getProfile();
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name ?? undefined,
            subjectFocus: profile.subject_focus ?? undefined,
            learningGoal: profile.learning_goal ?? undefined,
            studyMinutesDay: profile.study_minutes_day ?? undefined,
            mathLevel: profile.math_level ?? undefined,
            preferredTopic: profile.preferred_topic ?? undefined,
            onboardingCompleted: profile.onboarding_completed,
          });

          if (!profile.onboarding_completed) {
            router.replace('/(onboarding)/level');
          } else {
            router.replace('/(tabs)');
          }
        } catch (error) {
          console.error('[auth-gate] Failed to fetch profile:', error);
          router.replace('/(tabs)');
        }
      } else {
        setUser(null);
        router.replace('/(auth)/sign-in');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F6AF5" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
});
