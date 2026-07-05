import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MathLevel = 'beginner' | 'intermediate' | 'advanced';

interface User {
  id: string;
  email: string;
  name?: string;
  subjectFocus?: string;
  learningGoal?: string;
  studyMinutesDay?: number;
  mathLevel?: MathLevel;
  preferredTopic?: string;
  onboardingCompleted?: boolean;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      updateUser: (patch) =>
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'arandil-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
