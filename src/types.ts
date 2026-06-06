/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  dayIndex: number; // 0 (Sun) to 6 (Sat)
}

export interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  category: 'general' | 'social';
}

export interface JournalEntry {
  dateStr: string; // YYYY-MM-DD
  description: string;
  emoji: string;
  starDetails?: string; // special details entry via star icon
  reminderTime?: string; // daily reminder setting
  hasCompleted: boolean;
}

export interface FitnessLog {
  dateStr: string; // YYYY-MM-DD
  mealsChecked: boolean[]; // [breakfast, lunch, dinner]
  waterGlasses: number; // up to 8+
  workouts: { id: string; activity: string; duration: number }[];
}

export interface SocialHangout {
  id: string;
  dateStr: string;
  withWho: string;
  activity: string;
}

export interface AppReminder {
  id: string;
  time: string; // HH:MM
  label: string;
  active: boolean;
  category: 'Journal' | 'Fitness' | 'Social' | 'General';
  days: number[]; // days index 0-6
}

export interface Milestone {
  pointsNeeded: number;
  rewardName: string;
  description: string;
  unlocked: boolean;
}

export interface SideQuest {
  id: string;
  text: string;
  completed: boolean;
}
