import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
  subjectFocus?: string;
  learningGoal?: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'arandil-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
