import { create } from 'zustand';
import type { MathLevel } from './user.store';

interface OnboardingState {
  mathLevel: MathLevel | null;
  learningGoal: string;
  studyMinutesDay: number | null;
  preferredTopic: string | null;
  setMathLevel: (level: MathLevel) => void;
  setLearningGoal: (goal: string) => void;
  setStudyMinutesDay: (minutes: number) => void;
  setPreferredTopic: (topic: string) => void;
  reset: () => void;
}

// In-memory only — not persisted. If the user abandons onboarding mid-flow,
// the auth gate sends them back to step 1 on next app open (onboarding_completed
// stays false server-side until the final step submits). See DEC-010.
export const useOnboardingStore = create<OnboardingState>((set) => ({
  mathLevel: null,
  learningGoal: '',
  studyMinutesDay: null,
  preferredTopic: null,
  setMathLevel: (mathLevel) => set({ mathLevel }),
  setLearningGoal: (learningGoal) => set({ learningGoal }),
  setStudyMinutesDay: (studyMinutesDay) => set({ studyMinutesDay }),
  setPreferredTopic: (preferredTopic) => set({ preferredTopic }),
  reset: () =>
    set({ mathLevel: null, learningGoal: '', studyMinutesDay: null, preferredTopic: null }),
}));
