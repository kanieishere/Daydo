/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskItem, WeeklyGoal, JournalEntry, FitnessLog, SocialHangout, AppReminder, SideQuest } from './types';

export const DAYS_OF_WEEK = [
  { short: 'Sun', name: 'Sunday', index: 0 },
  { short: 'Mon', name: 'Monday', index: 1 },
  { short: 'Tue', name: 'Tuesday', index: 2 },
  { short: 'Wed', name: 'Wednesday', index: 3 },
  { short: 'Thu', name: 'Thursday', index: 4 },
  { short: 'Fri', name: 'Friday', index: 5 },
  { short: 'Sat', name: 'Saturday', index: 6 },
];

export const EMOTE_OPTIONS = ['🌸', '🍃', '☀️', '☁️', '🎈', '⭐', '🌈', '🚲', '🍵', '📚', '🌱', '🧸', '🍊', '🌊', '🏡', '🎐'];

// Default Unlocked Emojis (users can unlock new emojis every 10 successful days or milestones)
export const DEFAULT_EMOJIS = ['🌸', '🍃', '☀️', '☁️', '🍵', '🌱', '🧸', '🍊'];
export const SPECIAL_EMOJIS = ['🎈', '⭐', '🌈', '🚲', '📚', '🌊', '🏡', '🎐', '🌻', '🐾', '🍰', '🎸', '🎨', '✨', '🧘', '🛸'];

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seed data
export const INITIAL_TASKS: TaskItem[] = [
  { id: 't-1', text: 'Water the pastel succulents', completed: true, dayIndex: 1 },
  { id: 't-2', text: 'Drink 2 glasses of warm herbal tea', completed: false, dayIndex: 1 },
  { id: 't-3', text: 'Do 10 minutes of gentle morning stretch', completed: true, dayIndex: 2 },
  { id: 't-4', text: 'Write down three things I am grateful for', completed: false, dayIndex: 3 },
  { id: 't-5', text: 'Call a close friend to check in', completed: false, dayIndex: 4 },
  { id: 't-6', text: 'Read 5 pages of a calming novel', completed: true, dayIndex: 5 },
  { id: 't-7', text: 'Tidy up the cozy reading nook', completed: false, dayIndex: 6 },
];

export const INITIAL_WEEKLY_GOALS: WeeklyGoal[] = [
  { id: 'wg-1', text: 'Keep a 5-day journal logging streak', completed: false, category: 'general' },
  { id: 'wg-2', text: 'Organize a low-stress tea date with Sarah', completed: true, category: 'social' },
  { id: 'wg-3', text: 'Drink 6 glasses of water daily', completed: false, category: 'general' },
];

// Historical entry logs (to show green ticks on the Calendar for completed days)
export const INITIAL_JOURNAL_ENTRIES: Record<string, JournalEntry> = {
  [getPastDateStr(1)]: {
    dateStr: getPastDateStr(1),
    description: 'Had a beautiful quiet night watching the stars. Feeling extremely grounded and rested.',
    emoji: '🍵',
    starDetails: 'Made lavender extract cream and read under direct moonlight.',
    hasCompleted: true,
  },
  [getPastDateStr(3)]: {
    dateStr: getPastDateStr(3),
    description: 'Took a lovely stroll around the botanical gardens. The pastel roses were blooming.',
    emoji: '🌸',
    starDetails: 'Met an elder lady painting watercolors. She let me try!',
    hasCompleted: true,
  },
  [getPastDateStr(4)]: {
    dateStr: getPastDateStr(4),
    description: 'Cleaned the sunroom. Streamed sweet acoustic guitar music all afternoon.',
    emoji: '🍃',
    hasCompleted: true,
  },
  [getPastDateStr(5)]: {
    dateStr: getPastDateStr(5),
    description: 'Baked warm cinnamon scrolls with apple filling. The house smells incredible.',
    emoji: '🧸',
    starDetails: 'Delivered extra scrolls to the next-door neighbors.',
    hasCompleted: true,
  },
};

export const INITIAL_FITNESS: Record<string, FitnessLog> = {
  [getTodayDateStr()]: {
    dateStr: getTodayDateStr(),
    mealsChecked: [true, false, false],
    waterGlasses: 3,
    workouts: [
      { id: 'f-1', activity: 'Morning Yoga Flow', duration: 15 },
    ],
  },
  [getPastDateStr(1)]: {
    dateStr: getPastDateStr(1),
    mealsChecked: [true, true, true],
    waterGlasses: 7,
    workouts: [
      { id: 'f-2', activity: 'Park Walking', duration: 30 },
    ],
  },
  [getPastDateStr(2)]: {
    dateStr: getPastDateStr(2),
    mealsChecked: [true, true, true],
    waterGlasses: 8,
    workouts: [],
  },
  [getPastDateStr(3)]: {
    dateStr: getPastDateStr(3),
    mealsChecked: [true, true, true],
    waterGlasses: 6,
    workouts: [
      { id: 'f-3', activity: 'Cycling', duration: 20 },
    ],
  },
};

export const INITIAL_SOCIALS: SocialHangout[] = [
  { id: 's-1', dateStr: getPastDateStr(1), withWho: 'Sarah & Dan', activity: 'Baking soft muffins together at Sarah\'s place' },
  { id: 's-2', dateStr: getPastDateStr(3), withWho: 'Mom', activity: 'Morning hot cocoa talk and picking organic berries' },
];

export const INITIAL_REMINDERS: AppReminder[] = [
  { id: 'rem-1', time: '08:30', label: 'Morning Reflection Diary', active: true, category: 'Journal', days: [1, 2, 3, 4, 5] },
  { id: 'rem-2', time: '12:00', label: 'Mid-day Meal & Water Hydration Check', active: true, category: 'Fitness', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'rem-3', time: '18:00', label: 'Evening Chat with Loved Ones', active: false, category: 'Social', days: [5, 6] },
  { id: 'rem-4', time: '21:30', label: 'Read calming journal of the week', active: true, category: 'General', days: [0, 6] },
];

export const INITIAL_SIDE_QUESTS: SideQuest[] = [
  { id: 'sq-1', text: 'De-clutter the ceramic shelf', completed: false },
  { id: 'sq-2', text: 'Complement an stranger in passing', completed: true },
  { id: 'sq-3', text: 'Meditate in a pastel-themed silent spot', completed: false },
];
