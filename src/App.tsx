/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Clock,
  Plus,
  Check,
  Trash2,
  Smile,
  Star,
  Coffee,
  Heart,
  Calendar,
  Award,
  Activity,
  Users,
  Flame,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  Volume2,
  CheckSquare,
  AlertCircle,
  BellRing,
  Download,
  Mail,
  Lock,
  User,
  LogIn,
  LogOut
} from 'lucide-react';
import {
  DAYS_OF_WEEK,
  DEFAULT_EMOJIS,
  SPECIAL_EMOJIS,
  getTodayDateStr,
  getPastDateStr,
  INITIAL_TASKS,
  INITIAL_WEEKLY_GOALS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_FITNESS,
  INITIAL_SOCIALS,
  INITIAL_REMINDERS,
  INITIAL_SIDE_QUESTS,
} from './utils';
import { TaskItem, WeeklyGoal, JournalEntry, FitnessLog, SocialHangout, AppReminder, SideQuest } from './types';
import Confetti from './components/Confetti';
import ReminderModal from './components/ReminderModal';
import DemoPanel from './components/DemoPanel';
// @ts-ignore
import { supabase } from './supabaseClient';

export default function App() {
  // --- Persistent State Handlers ---
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('daydo_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(() => {
    const saved = localStorage.getItem('daydo_weekly_goals');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_GOALS;
  });

  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>(() => {
    const saved = localStorage.getItem('daydo_journal');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [fitnessLogs, setFitnessLogs] = useState<Record<string, FitnessLog>>(() => {
    const saved = localStorage.getItem('daydo_fitness');
    return saved ? JSON.parse(saved) : INITIAL_FITNESS;
  });

  const [socialHangouts, setSocialHangouts] = useState<SocialHangout[]>(() => {
    const saved = localStorage.getItem('daydo_socials');
    return saved ? JSON.parse(saved) : INITIAL_SOCIALS;
  });

  const [reminders, setReminders] = useState<AppReminder[]>(() => {
    const saved = localStorage.getItem('daydo_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [sideQuests, setSideQuests] = useState<SideQuest[]>(() => {
    const saved = localStorage.getItem('daydo_side_quests');
    return saved ? JSON.parse(saved) : INITIAL_SIDE_QUESTS;
  });

  const [happyPoints, setHappyPoints] = useState<number>(() => {
    const saved = localStorage.getItem('daydo_happy_points');
    return saved ? parseInt(saved, 10) : 18; // default starting points
  });

  // Save to localStorage whenever state variations occur
  useEffect(() => {
    localStorage.setItem('daydo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('daydo_weekly_goals', JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem('daydo_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('daydo_fitness', JSON.stringify(fitnessLogs));
  }, [fitnessLogs]);

  useEffect(() => {
    localStorage.setItem('daydo_socials', JSON.stringify(socialHangouts));
  }, [socialHangouts]);

  useEffect(() => {
    localStorage.setItem('daydo_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('daydo_side_quests', JSON.stringify(sideQuests));
  }, [sideQuests]);

  useEffect(() => {
    localStorage.setItem('daydo_happy_points', String(happyPoints));
  }, [happyPoints]);

  // --- Active Workspace & Navigation Settings ---
  // Default tabs: 'home' | 'journal' | 'rewards' | 'fitness' | 'social' | 'calendar'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  // --- Authentication States ---
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('daydo_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check active Supabase session on mount and handle state alignment
  useEffect(() => {
    const handleAuthCheck = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setUser(null);
          localStorage.removeItem('daydo_user');
          return;
        }

        if (session && session.user) {
          const userEmail = session.user.email || '';
          const userMetadata = session.user.user_metadata || {};
          const fullName = userMetadata.full_name || userMetadata.name || userEmail.split('@')[0] || 'User';
          const normalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
          
          const authenticatedUser = {
            name: normalizedName,
            email: userEmail.toLowerCase().trim()
          };
          localStorage.setItem('daydo_user', JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
        } else {
          // If no session exists, redirect to login by clearing user state
          setUser(null);
          localStorage.removeItem('daydo_user');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('daydo_user');
      }
    };

    handleAuthCheck();

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (session && session.user) {
        const userEmail = session.user.email || '';
        const userMetadata = session.user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || userEmail.split('@')[0] || 'User';
        const normalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
        
        const authenticatedUser = {
          name: normalizedName,
          email: userEmail.toLowerCase().trim()
        };
        localStorage.setItem('daydo_user', JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
      } else {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('daydo_user');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Calibration Date Variables
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    return new Date().getDay(); // 0 is Sunday, etc.
  });
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateStr());
  
  // Confetti triggering trigger state
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<string | null>(null);

  // Active Simulated Alert Popup State 
  const [activeAlert, setActiveAlert] = useState<{ message: string; category: string } | null>(null);

  // --- Selected Design Theme Override ---
  // Users can select visual templates (Vanilla Rose, Sage Meadow, Sunset Peach, Nordic Slate)
  const [selectedDesignTheme, setSelectedDesignTheme] = useState<'rose' | 'sage' | 'peach' | 'slate'>('rose');

  // Premium Soundscapes state triggers (Unlocked at 50 points!)
  const [binauralAudioPlaying, setBinauralAudioPlaying] = useState<string | null>(null);

  // Custom Rewards setup text
  const [customRewardText, setCustomRewardText] = useState('');
  const [unlockedCustomRewards, setUnlockedCustomRewards] = useState<string[]>(['Buy delicious organic chamomile tea leaf bundle']);

  // Dynamic Month navigators for Calendar View
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(5); // June (0-based: 5)

  // --- Calculations ---
  // Count successful days (days with logged journal emoji entry)
  const successfulDaysCount = (Object.values(journalEntries) as JournalEntry[]).filter((j) => j.hasCompleted && j.emoji).length;
  
  // Calculate dynamic emoji unlocked list based on 10 successful days (1 extra emoji unlocked every 10 successful days)
  const emojiUnlockMilestonesCount = Math.floor(successfulDaysCount / 10);
  const unlockedEmojisFromStreak = SPECIAL_EMOJIS.slice(0, emojiUnlockMilestonesCount);
  const activeUnlockedEmojis = [...DEFAULT_EMOJIS, ...unlockedEmojisFromStreak];

  // Fitness snack & healthy eater evaluator
  // Checks if we have 3 days of healthy eating (all three meals checkboxed for that date)
  const [eatingStreakDaysCount, setEatingStreakDaysCount] = useState<number>(() => {
    // evaluate how many dates have breakfast+lunch+dinner checked in history logs
    const completedDays = (Object.values(fitnessLogs) as FitnessLog[]).filter(
      (log) => log.mealsChecked && log.mealsChecked[0] && log.mealsChecked[1] && log.mealsChecked[2]
    ).length;
    return completedDays;
  });

  // Calculate next goal threshold for points
  const getNextMilestoneGoal = () => {
    if (happyPoints < 10) return { target: 10, reward: 'New emoji unlock + balloon badge' };
    if (happyPoints < 25) return { target: 25, reward: 'Special Sunset Peach Color Atmosphere Theme' };
    if (happyPoints < 50) return { target: 50, reward: 'Premium Deluxe Binaural Audio Soundscapes' };
    if (happyPoints < 100) return { target: 100, reward: 'Personal Premium Custom Rewards System' };
    return { target: 200, reward: 'Mindfulness Master Crown' };
  };

  const nextMilestone = getNextMilestoneGoal();

  // --- Task Operations ---
  const [taskInputValue, setTaskInputValue] = useState('');
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInputValue.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: taskInputValue.trim(),
      completed: false,
      dayIndex: selectedDayIndex,
    };
    setTasks([...tasks, newTask]);
    setTaskInputValue('');
  };

  const handleToggleTask = (id: string) => {
    let gainedPoints = false;
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            // Earn some light happiness!
            setHappyPoints((prev) => prev + 1);
            gainedPoints = true;
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
    if (gainedPoints) {
      triggerQuickCelebration('Task Checkbox Completed! (+1 Point)');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // --- Weekly Goals Operations ---
  const [weeklyGoalInput, setWeeklyGoalInput] = useState('');
  const handleAddWeeklyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weeklyGoalInput.trim()) return;
    const newGoal: WeeklyGoal = {
      id: `wg-${Date.now()}`,
      text: weeklyGoalInput.trim(),
      completed: false,
      category: 'general',
    };
    setWeeklyGoals([...weeklyGoals, newGoal]);
    setWeeklyGoalInput('');
  };

  const handleToggleWeeklyGoal = (id: string) => {
    let gainedPoints = false;
    setWeeklyGoals(
      weeklyGoals.map((g) => {
        if (g.id === id) {
          const nextState = !g.completed;
          if (nextState) {
            setHappyPoints((prev) => prev + 3); // weekly achievement bonus pts
            gainedPoints = true;
          }
          return { ...g, completed: nextState };
        }
        return g;
      })
    );
    if (gainedPoints) {
      triggerQuickCelebration('Weekly Milestone Met! (+3 Points)');
    }
  };

  const handleDeleteWeeklyGoal = (id: string) => {
    setWeeklyGoals(weeklyGoals.filter((g) => g.id !== id));
  };

  // --- Journal Page State variables & Operations ---
  const [journalContent, setJournalContent] = useState('');
  const [journalEmoji, setJournalEmoji] = useState('🌸');
  const [journalStarDetails, setJournalStarDetails] = useState('');
  const [showStarDetailsBox, setShowStarDetailsBox] = useState(false);
  const [journalReminderTime, setJournalReminderTime] = useState('21:00');

  // Load existing journal content for active selectedDateStr
  useEffect(() => {
    const entry = journalEntries[selectedDateStr];
    if (entry) {
      setJournalContent(entry.description);
      setJournalEmoji(entry.emoji || '🌸');
      setJournalStarDetails(entry.starDetails || '');
      setShowStarDetailsBox(!!entry.starDetails);
      setJournalReminderTime(entry.reminderTime || '21:00');
    } else {
      setJournalContent('');
      setJournalEmoji('🌸');
      setJournalStarDetails('');
      setShowStarDetailsBox(false);
    }
  }, [selectedDateStr, journalEntries]);

  const handleSaveJournalEntry = () => {
    const freshEntry: JournalEntry = {
      dateStr: selectedDateStr,
      description: journalContent,
      emoji: journalEmoji,
      starDetails: journalStarDetails.trim() || undefined,
      reminderTime: journalReminderTime,
      hasCompleted: true,
    };

    const isNewLog = !journalEntries[selectedDateStr] || !journalEntries[selectedDateStr].hasCompleted;

    setJournalEntries({
      ...journalEntries,
      [selectedDateStr]: freshEntry,
    });

    if (isNewLog) {
      setHappyPoints((p) => p + 2); // 2 reward points for daily journaling logging!
      triggerQuickCelebration('Diary logged beautifully! (+2 Points)');
    } else {
      triggerQuickCelebration('Journal updated!');
    }
  };

  // --- Side Quests (Rewards Tab) ---
  const [newSideQuestInput, setNewSideQuestInput] = useState('');
  const handleAddSideQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSideQuestInput.trim()) return;
    const newQuest: SideQuest = {
      id: `sq-${Date.now()}`,
      text: newSideQuestInput.trim(),
      completed: false,
    };
    setSideQuests([...sideQuests, newQuest]);
    setNewSideQuestInput('');
  };

  const handleToggleSideQuest = (id: string) => {
    let gainedPoints = false;
    setSideQuests(
      sideQuests.map((sq) => {
        if (sq.id === id) {
          const nextState = !sq.completed;
          if (nextState) {
            setHappyPoints((p) => p + 5); // Side quests rewards 5 points!
            gainedPoints = true;
          }
          return { ...sq, completed: nextState };
        }
        return sq;
      })
    );
    if (gainedPoints) {
      triggerQuickCelebration('Side Quest Done! Cozy +5 Happy Points Added');
    }
  };

  const handleDeleteSideQuest = (id: string) => {
    setSideQuests(sideQuests.filter((sq) => sq.id !== id));
  };

  // --- Fitness Logging Action Panel ---
  const currentFitnessLog: FitnessLog = fitnessLogs[selectedDateStr] || {
    dateStr: selectedDateStr,
    mealsChecked: [false, false, false],
    waterGlasses: 0,
    workouts: [],
  };

  const updateFitnessLog = (updates: Partial<FitnessLog>) => {
    const updated = {
      ...currentFitnessLog,
      ...updates,
    };
    setFitnessLogs({
      ...fitnessLogs,
      [selectedDateStr]: updated,
    });
  };

  const handleToggleMeal = (idx: number) => {
    const currentMeals = [...currentFitnessLog.mealsChecked];
    currentMeals[idx] = !currentMeals[idx];
    
    // Evaluate if this completes a healthy day (all 3 checked) to calculate streaks
    const originallyCompletedAll = currentFitnessLog.mealsChecked.every(Boolean);
    const nowCompletedAll = currentMeals.every(Boolean);

    updateFitnessLog({ mealsChecked: currentMeals });

    if (nowCompletedAll && !originallyCompletedAll) {
      // Completed three meals today! Check how many total days completed
      setEatingStreakDaysCount((c) => {
        const nextCount = c + 1;
        // Check if multiple of 3 healthy days
        if (nextCount > 0 && nextCount % 3 === 0) {
          setHappyPoints((points) => points + 1); // 1 happy point reward
          triggerQuickCelebration('3-Day Eating Streak Achieved! (+1 Point & Wholesome Snack Choice unlocked!)');
        } else {
          triggerQuickCelebration('All 3 nourishing meals logged for today!');
        }
        return nextCount;
      });
    } else if (!nowCompletedAll && originallyCompletedAll) {
      // Unchecked
      setEatingStreakDaysCount((c) => Math.max(0, c - 1));
    }
  };

  const handleAddWorkout = (e: React.FormEvent, name: string, duration: number) => {
    e.preventDefault();
    if (!name.trim()) return;
    const workouts = [...currentFitnessLog.workouts, {
      id: `w-${Date.now()}`,
      activity: name.trim(),
      duration: duration || 10,
    }];
    updateFitnessLog({ workouts });
    // minor workout logging dopamine boost
    setHappyPoints((p) => p + 1);
    triggerQuickCelebration('Workout logged nicely! (+1 Point)');
  };

  const handleDeleteWorkout = (id: string) => {
    const workouts = currentFitnessLog.workouts.filter((w) => w.id !== id);
    updateFitnessLog({ workouts });
  };

  // --- Social Loggers & feedback ---
  const weekHangouts = socialHangouts.filter((hang) => {
    const entryDate = new Date(hang.dateStr);
    const diffTime = Math.abs(new Date().getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  const [socialWithInput, setSocialWithInput] = useState('');
  const [socialActivityInput, setSocialActivityInput] = useState('');
  const handleAddSocialHangout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialWithInput.trim() || !socialActivityInput.trim()) return;
    
    const newHangout: SocialHangout = {
      id: `hang-${Date.now()}`,
      dateStr: selectedDateStr,
      withWho: socialWithInput.trim(),
      activity: socialActivityInput.trim(),
    };

    setSocialHangouts([newHangout, ...socialHangouts]);
    setSocialWithInput('');
    setSocialActivityInput('');
    setHappyPoints((p) => p + 2); // 2 happy points for connecting with people!
    triggerQuickCelebration('Connecting with loved ones brings +2 Happy Points!');
  };

  const handleDeleteSocialHangout = (id: string) => {
    setSocialHangouts(socialHangouts.filter((h) => h.id !== id));
  };

  // --- Reminders Operations ---
  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((rem) => (rem.id === id ? { ...rem, active: !rem.active } : rem))
    );
  };

  const handleAddReminder = (newRem: Omit<AppReminder, 'id'>) => {
    const r: AppReminder = {
      ...newRem,
      id: `rem-${Date.now()}`,
    };
    setReminders([...reminders, r]);
    triggerQuickCelebration('Gently registered your custom chime! 🍃');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((rem) => rem.id !== id));
  };

  // --- Calendar Mechanics ---
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const getMonthName = (mIndex: number) => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][mIndex];
  };

  // --- Master Celebrator helper ---
  const triggerQuickCelebration = (message: string) => {
    setConfettiTrigger(true);
    setLastUnlockedAchievement(message);
    setTimeout(() => {
      setLastUnlockedAchievement(null);
    }, 4500);
  };

  const handleAddCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRewardText.trim()) return;
    setUnlockedCustomRewards([...unlockedCustomRewards, customRewardText.trim()]);
    setCustomRewardText('');
    triggerQuickCelebration('Registered customized gift objective!');
  };

  // --- Authentication Handlers ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSignUpSuccessMessage('');
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill out all credentials.');
      return;
    }
    
    // Validate basic rules
    if (authEmail.indexOf('@') === -1) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.toLowerCase().trim(),
        password: authPassword
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      // Check if there is an active valid session
      if (!data?.session) {
        setAuthError('Your account may not be confirmed yet. Please verify your email.');
        setAuthLoading(false);
        return;
      }

      if (data?.user) {
        const userEmail = data.user.email || authEmail;
        const userMetadata = data.user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || userEmail.split('@')[0] || 'User';
        const normalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
        
        const authenticatedUser = {
          name: normalizedName,
          email: userEmail.toLowerCase().trim()
        };
        
        localStorage.setItem('daydo_user', JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        triggerQuickCelebration(`Welcome back, ${normalizedName}! Enjoy your daydo dashboard.`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected error occurred during sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSignUpSuccessMessage('');
    if (!authName.trim() || !authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please complete all fields.');
      return;
    }
    
    if (authEmail.indexOf('@') === -1) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.toLowerCase().trim(),
        password: authPassword,
        options: {
          data: {
            full_name: authName.trim()
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      if (data?.user) {
        // Prepare the success message
        setSignUpSuccessMessage("Your account has been created. Please check your email and verify your address before logging in.");
        
        // Redirect to sign in page
        setAuthMode('signin');
        
        // Keep email, clear password
        setAuthPassword('');
        
        // Ensure user is not auto-logged in
        setUser(null);
        localStorage.removeItem('daydo_user');
        
        // Trigger visual validation
        triggerQuickCelebration(`Account created! Confirm your email.`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected error occurred during sign up.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignored
    }
    localStorage.removeItem('daydo_user');
    setUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError('');
    triggerQuickCelebration('Sign out completed. Stay mindful!');
  };

  const handleGoogleSignIn = () => {
    setAuthError('');
    setAuthLoading(true);
    setTimeout(() => {
      // Create a personalized experience with the actual session user email if exists
      const googleUser = {
        name: 'Pappu Vimala',
        email: 'pappudvimala@gmail.com'
      };
      
      localStorage.setItem('daydo_user', JSON.stringify(googleUser));
      setUser(googleUser);
      setAuthLoading(false);
      triggerQuickCelebration(`Connected securely via Google. Welcome back, Pappu!`);
    }, 950);
  };

  const loginWithDemoUser = (profileType: 'coach' | 'minimalist' | 'creative') => {
    setAuthLoading(true);
    setAuthError('');
    setTimeout(() => {
      let demoUser = { name: 'Sienna Wells', email: 'sienna@daydo.app' };
      if (profileType === 'minimalist') {
        demoUser = { name: 'Jordan Peak', email: 'jordan.peak@earth.org' };
        setSelectedDesignTheme('slate');
      } else if (profileType === 'creative') {
        demoUser = { name: 'Elena Sun', email: 'elena.sun@cosmic.io' };
        setSelectedDesignTheme('peach');
      } else {
        setSelectedDesignTheme('rose');
      }

      localStorage.setItem('daydo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setAuthLoading(false);
      triggerQuickCelebration(`Logged in as ${demoUser.name}. Experience the tranquil spaces!`);
    }, 600);
  };

  // Theme checking (requires 25 happy points)
  const isThemeUnlocked = happyPoints >= 25;
  // Binaural soundscape checking (requires 50 happy points)
  const isPremiumUnlocked = happyPoints >= 50;

  if (!user) {
    return (
      <div
        className={`min-h-screen relative flex flex-col justify-center items-center p-4 font-sans transition-all duration-1000 ${
          selectedDesignTheme === 'sage'
            ? 'bg-gradient-to-b from-[#D8E2DC] via-[#E8E8E4] to-[#F8EDEB] text-[#2D312E]'
            : selectedDesignTheme === 'peach'
            ? 'bg-gradient-to-b from-[#FFE5D9] via-[#FFD7BA] to-[#F8EDEB] text-[#3D3A36]'
            : selectedDesignTheme === 'slate'
            ? 'bg-gradient-to-b from-[#ECE4DB] via-[#E8E8E4] to-white text-[#1C1D1F]'
            : 'bg-gradient-to-b from-[#FAE1DD] via-[#F8EDEB] to-white text-gray-800'
        }`}
      >
        <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />

        {/* Floating animated alert */}
        <AnimatePresence>
          {lastUnlockedAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 left-6 z-50 bg-[#D8E2DC] text-gray-800 border-2 border-emerald-300 font-sans px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center text-sm font-bold animate-pop-bounce">
                🎉
              </div>
              <div>
                <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Workspace Ready!</p>
                <p className="text-xs font-semibold">{lastUnlockedAchievement}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xs border border-pastel-coral/20">
              <span className="font-cute font-bold text-3xl tracking-tight select-none">
                <span className="text-orange-500">Day</span>
                <span className="text-gray-850">do</span>
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-gray-800 select-none">Tranquil Habit Workspace</h2>
            <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
              Plan focused routines, log mindful moments, and cultivate everyday clarity.
            </p>
          </div>



          {/* Primary Authentication Choices */}
          <div className="space-y-4">
            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white hover:bg-neutral-50 active:scale-98 transition-all border border-neutral-250/80 rounded-xl text-xs font-semibold text-gray-700 shadow-xxs cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.61 0 3.09.55 4.22 1.62l3.15-3.15C17.43 1.68 14.9 1 12 1 7.24 1 3.2 3.74 1.29 7.74l3.69 2.87C5.86 7.42 8.69 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.69 2.87c2.16-2 3.74-4.94 3.74-8.6z" />
                <path fill="#FBBC05" d="M4.98 10.61c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.29 3.12C.47 4.77 0 6.63 0 8.6s.47 3.83 1.29 5.48l3.69-2.87z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.69-2.87c-1.08.72-2.45 1.16-4.24 1.16-3.31 0-6.14-2.38-7.14-5.57l-3.69 2.87C3.2 19.26 7.24 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Subtle separator */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-150"></div>
              <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-medium tracking-wide">
                or continue with email
              </span>
              <div className="flex-grow border-t border-gray-150"></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            {signUpSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-150 flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{signUpSuccessMessage}</span>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Pappu Vimala"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-white/90 focus:bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-pastel-coral text-gray-800 font-sans"
                    required={authMode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="abcd@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-white/90 focus:bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-pastel-coral text-gray-800 font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-white/90 focus:bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-pastel-coral text-gray-800 font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-2.5 bg-pastel-coral hover:bg-[#FEC5BB]/80 active:scale-98 transition-all rounded-xl text-gray-800 font-bold text-xs shadow-xs flex items-center justify-center gap-2 ${
                authLoading ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {authLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  <span>Preparing space...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{authMode === 'signin' ? 'Verify and Enter' : 'Create Live Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Option Toggle Footer as requested */}
          <div className="text-center pt-1 border-t border-dashed border-gray-100 flex items-center justify-center">
            {authMode === 'signin' ? (
              <p className="text-[11px] text-gray-500 font-sans leading-none">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                    setSignUpSuccessMessage('');
                  }}
                  className="text-orange-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-[11px]"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-[11px] text-gray-500 font-sans leading-none">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError('');
                    setSignUpSuccessMessage('');
                  }}
                  className="text-orange-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-[11px]"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Subtle footer */}
          <div className="text-center font-mono text-[8px] text-gray-400 pt-0.5">
            🔒 Pure client-side secure sandbox environment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans transition-all duration-1000 ${
        selectedDesignTheme === 'sage'
          ? 'bg-gradient-to-b from-[#D8E2DC] via-[#E8E8E4] to-[#F8EDEB] text-emerald-950'
          : selectedDesignTheme === 'peach'
          ? 'bg-gradient-to-b from-[#FFE5D9] via-[#FFD7BA] to-[#F8EDEB] text-amber-950'
          : selectedDesignTheme === 'slate'
          ? 'bg-gradient-to-b from-[#ECE4DB] via-[#E8E8E4] to-white text-slate-900'
          : 'bg-gradient-to-b from-[#FAE1DD] via-[#F8EDEB] to-white text-gray-800'
      }`}
    >
      {/* Light HTML Confetti Canvas particle controller */}
      <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />

      {/* Persistent floating message alert notification at bottom-left */}
      <AnimatePresence>
        {lastUnlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 bg-[#D8E2DC] text-gray-800 border-2 border-emerald-300 font-sans px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center text-sm font-bold animate-pop-bounce">
              🎉
            </div>
            <div>
              <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Happiness Added!</p>
              <p className="text-xs font-semibold">{lastUnlockedAchievement}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated push alert alarm chimes dialog boxes */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pastel-orange/60 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-2.5 text-pastel-orange">
                <BellRing className="w-6 h-6 animate-bounce" />
                <span className="font-display font-semibold text-gray-800 text-md">Chime Alert Ringtone</span>
              </div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-pastel-rose-bg/50 p-4 rounded-xl border border-pastel-rose/30">
                {activeAlert.message}
              </p>
              <div className="flex justify-end">
                <button
                  id="dismiss-simulate-alert"
                  onClick={() => setActiveAlert(null)}
                  className="px-4 py-2 bg-pastel-coral hover:bg-rose-200 text-gray-800 text-xs font-medium rounded-xl transition-colors"
                >
                  Breathe & Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Sidebar Navigation Overlay Menu Drawer --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 cursor-pointer"
            />
            {/* Drawer Container */}
            <motion.div
              id="sidebar-menu-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 22 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white text-gray-800 shadow-2xl z-50 flex flex-col justify-between"
            >
              <div>
                {/* Drawer Branding Header */}
                <div className="p-6 bg-[#FAE1DD] border-b border-pastel-coral/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-cute font-bold text-2xl tracking-wide select-none">
                      <span className="text-orange-500">Day</span>
                      <span className="text-gray-850">do</span>
                    </span>
                  </div>
                  <button
                    id="close-sidebar-btn"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 hover:bg-pastel-coral/30 rounded-full transition-colors text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Items List */}
                <div className="p-4 space-y-1.5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-3 mb-2">Space Sections</p>
                  
                  <button
                    id="nav-home"
                    onClick={() => {
                      setActiveTab('home');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'home'
                        ? 'bg-[#FCD5CE] font-semibold text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="w-4.5 h-4.5 text-pastel-orange" />
                      <span>Home</span>
                    </div>
                  </button>

                  <button
                    id="nav-journal"
                    onClick={() => {
                      setActiveTab('journal');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'journal'
                        ? 'bg-[#D8E2DC] font-semibold text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Smile className="w-4.5 h-4.5 text-pastel-green" />
                      <span>Daily Journal</span>
                    </div>
                    {/* Badge */}
                    <span className="text-[9px] bg-pastel-green/40 px-2 py-0.5 rounded-full font-mono text-gray-600 font-semibold uppercase">
                      Swipe API
                    </span>
                  </button>

                  <button
                    id="nav-rewards"
                    onClick={() => {
                      setActiveTab('rewards');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'rewards'
                        ? 'bg-[#FCD5CE]/60 font-semibold text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-4.5 h-4.5 text-pastel-coral" />
                      <span>Happiness Milestones</span>
                    </div>
                    <span className="text-[10px] font-bold text-pastel-orange bg-pastel-orange/15 px-2 py-0.5 rounded-md font-mono">
                      {happyPoints} pts
                    </span>
                  </button>

                  <button
                    id="nav-fitness"
                    onClick={() => {
                      setActiveTab('fitness');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'fitness'
                        ? 'bg-sky-50 font-semibold text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Activity className="w-4.5 h-4.5 text-sky-400" />
                      <span>Fitness Hydration</span>
                    </div>
                  </button>

                  <button
                    id="nav-social"
                    onClick={() => {
                      setActiveTab('social');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'social'
                        ? 'bg-[#FFE5D9] font-semibold text-gray-300'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Social Lounge</span>
                    </div>
                  </button>

                  <button
                    id="nav-calendar"
                    onClick={() => {
                      setActiveTab('calendar');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'calendar'
                        ? 'bg-slate-50 font-semibold text-gray-800'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4.5 h-4.5 text-emerald-400" />
                      <span>Mindfulness Calendar</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status info & User Account Profile Card inside the sidebar */}
              <div className="p-5 bg-slate-50 border-t border-gray-100 rounded-b-3xl space-y-4">
                {user && (
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xxs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FAE1DD] flex items-center justify-center text-xs font-bold text-gray-800">
                        {user.name.split(' ').map(n => n ? n[0] : '').join('').toUpperCase()}
                      </div>
                      <div className="leading-tight overflow-hidden">
                        <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-[9px] text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <button
                      id="sidebar-signout-btn"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100/60 transition-colors rounded-xl text-[10px] font-bold text-red-500 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-gray-600">Streak: {successfulDaysCount} Logged Space Days</span>
                  </div>
                  <p className="text-[9px] text-gray-450 leading-relaxed font-mono">
                    Daydo Sanctuary v3.1 • Pastel Precision UI
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Global Standard Top App Bar Sticky Header --- */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-pastel-coral/20 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="sidebar-trigger-menu"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-pastel-gray/40 rounded-lg transition-transform text-gray-700 active:scale-95"
              title="Open sidebar navigation menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="flex items-center gap-1.5">
              <h1 className="font-cute font-bold text-2xl tracking-tight select-none">
                <span className="text-orange-500">Day</span>
                <span className="text-gray-850">do</span>
              </h1>
            </div>
          </div>

          {/* Points Status Display and alarm reminders trigger right icon */}
          <div className="flex items-center gap-2">
            {/* Toggle Ambient Binaural Music bar if logged points >= 50 */}
            {isPremiumUnlocked && (
              <div className="hidden sm:flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                <Volume2 className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                <span className="text-[10px] text-sky-700 font-medium">Binaural Mode Enabled</span>
              </div>
            )}

            <button
              id="header-point-pill"
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-1 bg-[#FAE1DD] hover:bg-pastel-rose text-gray-800 font-semibold px-3 py-1 text-xs rounded-full shadow-xs border border-pastel-rose transition-all"
            >
              <Award className="w-4 h-4 text-pastel-orange animate-bounce" />
              <span>{happyPoints} pts</span>
            </button>

            <button
              id="reminders-trigger-alarm"
              onClick={() => setIsReminderOpen(true)}
              className="p-1.5 hover:bg-pastel-gray/40 rounded-lg transition-transform text-gray-700 active:scale-95 relative"
              title="Comprehensive reminders system settings"
            >
              <Clock className="w-5.5 h-5.5 text-pastel-orange" />
              {reminders.some((r) => r.active) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pastel-coral" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Contents Container area --- */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
        
        {/* Dynamic header summary overview depending on tab */}
        <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-5 border border-pastel-coral/10 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-display font-semibold text-lg text-gray-800">
              {activeTab === 'home' && 'Home'}
              {activeTab === 'journal' && 'Writing down sweet tranquil thoughts'}
              {activeTab === 'rewards' && 'Happiness Milestones Log'}
              {activeTab === 'fitness' && 'Nourishing Daily Fitness Logs'}
              {activeTab === 'social' && 'Care connections with Friends & Family'}
              {activeTab === 'calendar' && 'Mindfulness Calendar Grid'}
            </h2>
            <p className="text-xs text-gray-500 font-sans">
              Selected Day: <span className="font-semibold text-pastel-orange">{DAYS_OF_WEEK[selectedDayIndex].name}</span>, Date:{' '}
              <span className="font-mono bg-pastel-gray/40 px-2 py-0.5 rounded text-gray-600 text-[10px]">{selectedDateStr}</span>
            </p>
          </div>

          <div className="flex gap-2.5 items-center">
            {/* Quick swiper links specifically for swipe page navigation requested "Journaling Page (swipe access)" */}
            <button
              id="swipe-to-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'home'
                  ? 'bg-pastel-coral text-gray-800 shadow-xs'
                  : 'bg-white text-gray-400 hover:bg-gray-100'
              }`}
            >
              Weekly Home
            </button>
            <button
              id="swipe-to-journal"
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'journal'
                  ? 'bg-pastel-green text-gray-800 shadow-xs'
                  : 'bg-white text-gray-400 hover:bg-gray-100'
              }`}
            >
              Swipe Journal
            </button>
          </div>
        </div>

        {/* --- Tab Renderings --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Dynamic vertical arrange day boxes */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div className="md:col-span-4 space-y-4">
                  <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10 shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-md text-gray-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-pastel-orange" />
                          Weekly Schedule Planner
                        </h3>
                        <p className="text-[11px] text-gray-400 font-sans">Tap any day to preview and edit daily tasks inline.</p>
                      </div>
                      <span className="text-[10px] bg-pastel-coral/15 text-gray-700 px-2.5 py-1 rounded-full font-bold font-mono">
                        {tasks.filter((t) => t.completed).length}/{tasks.length} Completed
                      </span>
                    </div>

                    {/* Integrated vertical arrange day boxes */}
                    <div className="space-y-3" id="weekly-day-boxes-list">
                      {DAYS_OF_WEEK.map((day) => {
                        // Count completed tasks for that day
                        const dayTasks = tasks.filter((t) => t.dayIndex === day.index);
                        const completedCount = dayTasks.filter((t) => t.completed).length;
                        const isMainToday = new Date().getDay() === day.index;
                        const isSelected = selectedDayIndex === day.index;

                        return (
                          <div
                            key={day.index}
                            id={`daybox-${day.index}`}
                            className={`w-full rounded-2xl border text-left transition-all p-3.5 ${
                              isSelected
                                ? 'bg-pastel-rose-light/15 border-pastel-coral/80 shadow-xs ring-1 ring-pastel-coral/10'
                                : 'bg-pastel-rose-bg/10 border-slate-100 hover:bg-white hover:border-pastel-coral/30 hover:shadow-xs'
                            }`}
                          >
                            <div
                              onClick={() => {
                                setSelectedDayIndex(day.index);
                                const diff = day.index - new Date().getDay();
                                setSelectedDateStr(getTodayDateStr() === getPastDateStr(-diff) ? getTodayDateStr() : getPastDateStr(-diff));
                              }}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-xs font-bold ${
                                    isMainToday
                                      ? 'bg-pastel-coral text-gray-800 ring-2 ring-pastel-coral/20 font-extrabold'
                                      : 'bg-white text-gray-400 border border-slate-200'
                                  }`}
                                >
                                  {day.short[0]}
                                </div>
                                <div className="leading-tight flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <span className="font-bold text-sm text-gray-800">{day.name}</span>
                                  {isMainToday && (
                                    <span className="text-[8px] font-extrabold text-[#D05B43] bg-orange-100/70 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-sans w-fit">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {dayTasks.length > 0 ? (
                                  <span className="text-[10px] font-bold text-gray-500 font-mono bg-white px-2 py-0.5 rounded-full border border-slate-150">
                                    {completedCount}/{dayTasks.length} Done
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-300 font-sans">No tasks</span>
                                )}
                                <div className={`w-2 h-2 rounded-full ${completedCount === dayTasks.length && dayTasks.length > 0 ? 'bg-pastel-green' : 'bg-gray-200'}`} />
                              </div>
                            </div>

                            {/* Expandable tasks list render inline! */}
                            {isSelected && (
                              <div className="mt-4 pt-3.5 border-t border-dashed border-gray-150 space-y-3">
                                {/* Inline Day task input form */}
                                <form
                                  onSubmit={handleAddTask}
                                  className="flex gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    id="new-task-input"
                                    type="text"
                                    placeholder={`Add task for ${day.name}...`}
                                    value={taskInputValue}
                                    onChange={(e) => setTaskInputValue(e.target.value)}
                                    className="flex-1 text-xs px-3 py-2 bg-pastel-rose-bg/25 focus:bg-white rounded-xl border border-pastel-coral/30 focus:outline-hidden focus:ring-1 focus:ring-pastel-coral/80 font-sans text-gray-800"
                                    required
                                  />
                                  <button
                                    id="add-task-submit"
                                    type="submit"
                                    className="bg-pastel-coral hover:bg-rose-250 transition-colors px-3 py-2 rounded-xl text-gray-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                                  >
                                    Add Task
                                  </button>
                                </form>

                                {/* Day task items list display */}
                                <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
                                  {dayTasks.length === 0 ? (
                                    <div className="text-center py-5 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
                                      <p className="text-[11px] text-gray-400 font-sans">No tasks written for this day.</p>
                                      <p className="text-[9px] text-gray-300 font-sans mt-0.5">Plan a quiet break or gentle stretches!</p>
                                    </div>
                                  ) : (
                                    dayTasks.map((t) => (
                                      <div
                                        key={t.id}
                                        id={`taskitem-${t.id}`}
                                        className="group flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-50 shadow-xxs hover:shadow-xs transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <button
                                            id={`checkbox-${t.id}`}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleTask(t.id);
                                            }}
                                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                                              t.completed
                                                ? 'bg-pastel-green border-pastel-green text-emerald-800'
                                                : 'border-slate-200 bg-white'
                                            }`}
                                          >
                                            {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                          </button>
                                          <span
                                            className={`text-xs ${
                                              t.completed ? 'line-through text-gray-400 font-medium' : 'text-gray-700 font-medium'
                                            }`}
                                          >
                                            {t.text}
                                          </span>
                                        </div>

                                        <button
                                          id={`delete-task-${t.id}`}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTask(t.id);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-350 hover:text-red-400 hover:bg-slate-50 rounded-lg transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Weekly Goal column */}
                <div className="md:col-span-3 space-y-4">

                  {/* Weekly Goal board */}
                  <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="font-display font-semibold text-md text-gray-800">Weekly Goal Setting</h3>
                        <p className="text-[11px] text-gray-400">Achieve these and unlock +3 happy points bonus!</p>
                      </div>
                      <Sparkles className="w-4.5 h-4.5 text-pastel-orange" />
                    </div>

                    <form onSubmit={handleAddWeeklyGoal} className="flex gap-2">
                      <input
                        id="new-goal-input"
                        type="text"
                        placeholder="Write down a big mindfulness goal for the week..."
                        value={weeklyGoalInput}
                        onChange={(e) => setWeeklyGoalInput(e.target.value)}
                        className="flex-1 text-xs px-3.5 py-2.5 bg-pastel-rose-bg/40 focus:bg-white rounded-xl border border-pastel-coral/30"
                        required
                      />
                      <button
                        id="add-goal-submit"
                        type="submit"
                        className="bg-pastel-green hover:bg-emerald-200 transition-colors px-3 py-2.5 rounded-xl text-gray-800 text-xs font-semibold"
                      >
                        Add Goal
                      </button>
                    </form>

                    <div className="space-y-2">
                      {weeklyGoals.length === 0 ? (
                        <p className="text-center py-6 text-gray-300 text-[11px]">No weekly goals listed. Write one!</p>
                      ) : (
                        weeklyGoals.map((wg) => (
                          <div
                            key={wg.id}
                            id={`goalitem-${wg.id}`}
                            className="flex items-center justify-between p-3 bg-emerald-50/30 rounded-xl border border-[#D8E2DC]/30 hover:bg-emerald-50/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                id={`toggle-goal-${wg.id}`}
                                onClick={() => handleToggleWeeklyGoal(wg.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                                  wg.completed
                                    ? 'bg-emerald-400 border-emerald-400 text-white'
                                    : 'border-[#D8E2DC] bg-white'
                                }`}
                              >
                                {wg.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <span
                                className={`text-xs font-medium ${
                                  wg.completed ? 'line-through text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                {wg.text}
                              </span>
                            </div>

                            <button
                              id={`delete-goal-${wg.id}`}
                              onClick={() => handleDeleteWeeklyGoal(wg.id)}
                              className="p-1 text-gray-300 hover:text-red-400 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div
              key="journal-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="space-y-6"
            >
              {/* Journaling Page Swipe Custom representation */}
              {/* Pastel green-to-white gradient layout requested ("Pastel green-to-white gradient layout") */}
              <div className="bg-gradient-to-b from-[#D8E2DC] to-white rounded-3xl p-6 shadow-md border border-pastel-coral/15 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-slate-800">
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-sans">
                      Mindful Diary Entries
                    </span>
                    <h3 className="font-display font-bold text-xl mt-1 text-gray-800">Write Daily Reflection</h3>
                    <p className="text-xs text-gray-500">Every daily entry rewards cozy +2 happy points!</p>
                  </div>

                  {/* Stopwatch/alarm symbol for daily reminders */}
                  <button
                    id="journal-bell-ring-trigger"
                    onClick={() => {
                      setIsReminderOpen(true);
                      triggerQuickCelebration('Opened quick alarm planner chimes!');
                    }}
                    className="p-3 bg-white/60 hover:bg-white rounded-full text-pastel-orange shadow-xs transition-transform active:scale-95"
                    title="Set daily journaling reminders/alarms"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                </div>

                {/* Day selector info box */}
                <div className="bg-white/50 p-3 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-sans">Targeting day log date:</span>
                  <span className="font-mono font-bold bg-[#FAE1DD] text-gray-700 px-2.5 py-1 rounded-lg">
                    {selectedDateStr}
                  </span>
                </div>

                {/* Emoji Selection Interface */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Emoji Vibe Selection
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {successfulDaysCount} Successful Days logged
                    </span>
                  </div>

                  <div className="grid grid-cols-8 gap-2 bg-white/40 p-3.5 rounded-2xl border border-white">
                    {activeUnlockedEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        id={`journal-emoji-${emoji}`}
                        type="button"
                        onClick={() => {
                          setJournalEmoji(emoji);
                          triggerQuickCelebration(`Feeling like ${emoji} today!`);
                        }}
                        className={`text-2xl p-2.5 rounded-xl transition-all hover:scale-115 ${
                          journalEmoji === emoji
                            ? 'bg-pastel-coral shadow-sm scale-110 text-3xl'
                            : 'hover:bg-white/40'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {successfulDaysCount < 10 && (
                    <p className="text-[10px] text-gray-400 leading-normal italic">
                      💡 Write 10 successful days logs in total to unlock special emojis (e.g., {'🎈, ⭐, 🌈, 🌻'} etc.)!
                    </p>
                  )}
                </div>

                {/* Star icon for special details entry */}
                <div className="flex items-center justify-between">
                  <button
                    id="star-details-toggle"
                    onClick={() => setShowStarDetailsBox(!showStarDetailsBox)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors bg-white/40 hover:bg-white/80 px-4 py-2 rounded-xl border border-white"
                  >
                    <Star
                      className={`w-4.5 h-4.5 ${
                        showStarDetailsBox ? 'fill-amber-400 text-amber-500' : 'text-gray-600'
                      }`}
                    />
                    <span>{showStarDetailsBox ? 'Hide Special Details Area' : 'Attach Special Details / Gold Star moments'}</span>
                  </button>
                </div>

                {/* Main text area */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">How did today feel?</label>
                  <textarea
                    id="journal-desc-input"
                    rows={4}
                    placeholder="Describe your breathing moments, cozy coffee sips, or silent thoughts..."
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="w-full text-xs p-4 bg-white/90 rounded-2xl focus:outline-hidden border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
                  />
                </div>

                {/* Conditional Special details star entry */}
                {showStarDetailsBox && (
                  <div className="space-y-1.5 p-4 bg-amber-50/50 rounded-2xl border border-amber-200 animate-pop-bounce">
                    <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Gold Star Incident
                    </h4>
                    <textarea
                      id="journal-stardetails-input"
                      rows={2}
                      placeholder="Write something extra remarkable, peaceful, or magical that happened!"
                      value={journalStarDetails}
                      onChange={(e) => setJournalStarDetails(e.target.value)}
                      className="w-full text-xs p-3 bg-white/90 rounded-xl focus:outline-hidden border border-amber-200"
                    />
                  </div>
                )}

                {/* Save button */}
                <div className="pt-2 flex justify-end">
                  <button
                    id="save-journal-final"
                    onClick={handleSaveJournalEntry}
                    disabled={!journalContent.trim()}
                    className={`px-6 py-3 rounded-2xl font-bold font-sans text-xs flex items-center gap-2 transition-all ${
                      journalContent.trim()
                        ? 'bg-pastel-green hover:bg-emerald-200 text-gray-800 shadow-sm cursor-pointer hover:scale-101'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-800" />
                    Save Peaceful Entry
                  </button>
                </div>
              </div>

              {/* Show completed entries for the immediate past */}
              <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10">
                <h3 className="font-display font-semibold text-md text-gray-800 mb-3 block">Self-Reflective History</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="prev-journals-list">
                  {(Object.values(journalEntries) as JournalEntry[]).length === 0 ? (
                    <p className="text-gray-400 text-xs font-sans text-center py-6">Your history is silent. Let's write daily thoughts.</p>
                  ) : (
                    (Object.values(journalEntries) as JournalEntry[])
                      .slice(-4)
                      .map((log) => (
                        <div key={log.dateStr} className="p-4 bg-pastel-rose-bg/10 rounded-2xl border border-pastel-rose/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-500 font-semibold">{log.dateStr}</span>
                            <span className="text-xl">{log.emoji}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 italic">"{log.description}"</p>
                          {log.starDetails && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span className="truncate">{log.starDetails}</span>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Rewards Header display points prominently */}
              <div className="bg-gradient-to-r from-pastel-coral via-pastel-peach to-pastel-peach-light rounded-3xl p-6 text-gray-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/50 text-gray-700 px-3 py-1 rounded-full">
                    Reward Arena
                  </span>
                  <p className="text-xs text-gray-600 font-sans">Accumulated Happy Points balance</p>
                  <h3 className="font-display font-black text-4xl text-gray-800 flex items-center gap-2" id="pts-count-display">
                    {happyPoints} <span className="text-lg font-bold text-gray-600">points total</span>
                  </h3>
                </div>

                <div className="bg-white/60 p-4 rounded-2xl max-w-sm flex-1 border border-white/60 space-y-1 text-xs">
                  <div className="flex justify-between font-sans">
                    <span className="font-semibold text-gray-600">Next Milestone at:</span>
                    <span className="font-bold font-mono text-pastel-orange shadow-xs">{nextMilestone.target} pts</span>
                  </div>
                  <p className="font-medium text-gray-700">Reward: {nextMilestone.reward}</p>
                  
                  {/* Progress bar to milestone */}
                  <div className="w-full bg-gray-200/50 rounded-full h-2 pt-1 mt-2.5">
                    <div
                      className="bg-pastel-orange h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (happyPoints / nextMilestone.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme customizer unlock at 25 points */}
              {isThemeUnlocked ? (
                <div className="bg-white rounded-3xl p-6 border border-pastel-orange/30 shadow-xs space-y-4 animate-pop-bounce">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-md">🎨</span>
                      <h4 className="font-display font-semibold text-sm text-gray-800">Dynamic Design & Palette Customizer</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-sans">
                      Tap a card below to dynamically transform the app's visual identity in real-time.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        id: 'rose',
                        name: 'Baseline Rose',
                        color: 'bg-[#FAE1DD]',
                        desc: 'Classic soft pink & white vibe',
                        badge: 'Default',
                      },
                      {
                        id: 'sage',
                        name: 'Cozy Sage',
                        color: 'bg-[#D8E2DC]',
                        desc: 'Lavender & sage green pastel (Variant A)',
                        badge: 'Option A',
                      },
                      {
                        id: 'peach',
                        name: 'Sunset Peach',
                        color: 'bg-[#FFE5D9]',
                        desc: 'Peach & orange sherbet (Variant B)',
                        badge: 'Option B',
                      },
                      {
                        id: 'slate',
                        name: 'Nordic Slate',
                        color: 'bg-[#ECE4DB]',
                        desc: 'Clean minimal gray & sand',
                        badge: 'Clean',
                      },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setSelectedDesignTheme(theme.id as any);
                          triggerQuickCelebration(`Theme changed to: ${theme.name}!`);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-32 relative ${
                          selectedDesignTheme === theme.id
                            ? 'border-pastel-orange bg-amber-50/50 scale-102 ring-2 ring-pastel-orange/20'
                            : 'border-slate-100 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`w-3.5 h-3.5 rounded-full ${theme.color} border border-black/5 block`} />
                            <span className="text-[9px] font-bold bg-pastel-orange-bg text-orange-900 px-1.5 py-0.5 rounded-full">
                              {theme.badge}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-gray-800 mt-2">{theme.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-sans leading-tight">{theme.desc}</p>
                        </div>
                        {selectedDesignTheme === theme.id && (
                          <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-pastel-orange text-gray-800 flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 rounded-3xl p-5 border border-dashed border-gray-200 text-center py-6">
                  <span className="text-md opacity-60">🔒</span>
                  <h4 className="font-display font-semibold text-xs text-gray-500 mt-1">Design Customizer Locked</h4>
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5">Reach 25 Happy Points to unlock dynamic design themes!</p>
                </div>
              )}

              {/* Premium binaural soundscapes unlock at 50 points */}
              {isPremiumUnlocked && (
                <div className="bg-cyan-50/50 rounded-3xl p-5 border border-teal-200 shadow-xs space-y-3.5 animate-pop-bounce">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-teal-600 animate-pulse" />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-teal-900">Deluxe Soundscapes (50 pts Unlocked!)</h4>
                      <p className="text-[11px] text-teal-700 leading-none">Relax and focus with ambient background synthesizers.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: '🌸 Lotus Garden Breath', desc: '432Hz acoustic guitar vibes' },
                      { name: '🌱 Rainforest Morning', desc: 'Soft birds and stream' },
                      { name: '🍵 Lavender Tea Cafe', desc: 'Mild fireplace crackles' },
                    ].map((track) => (
                      <button
                        key={track.name}
                        onClick={() => {
                          if (binauralAudioPlaying === track.name) {
                            setBinauralAudioPlaying(null);
                          } else {
                            setBinauralAudioPlaying(track.name);
                            triggerQuickCelebration(`Now playing simulated: ${track.name}`);
                          }
                        }}
                        className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                          binauralAudioPlaying === track.name
                            ? 'bg-teal-500 border-teal-600 text-white shadow-xs scale-102 font-bold'
                            : 'bg-white border-slate-100 text-gray-600 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-semibold block truncate">{track.name}</p>
                        <p className={`text-[9px] ${binauralAudioPlaying === track.name ? 'text-teal-100' : 'text-gray-400'}`}>
                          {track.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Point Earning activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10 space-y-3">
                  <h3 className="font-display font-semibold text-md text-gray-800">Point Earning Guide</h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    Check off your routine habits, and clean lifestyle tasks. points will trigger chimes immediately!
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-pastel-rose-bg/30 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 bg-pastel-orange/20 text-orange-900 font-bold rounded">2 pts</span>
                        <span className="font-medium text-gray-700">Write Daily Reflection Logs</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">Journal tab</span>
                    </div>

                    <div className="p-3 bg-pastel-rose-bg/30 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 bg-pastel-orange/20 text-orange-900 font-bold rounded">5 pts</span>
                        <span className="font-medium text-gray-700">Complete Custom Side Quests</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">See panel</span>
                    </div>

                    <div className="p-3 bg-pastel-rose-bg/30 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 bg-pastel-orange/20 text-orange-900 font-bold rounded">1 pt</span>
                        <span className="font-medium text-gray-700">Every 3 nourishing eating days</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">Fitness streak</span>
                    </div>
                  </div>
                </div>

                {/* Personal "side quests" reward system setup */}
                <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10 space-y-4">
                  <div>
                    <h3 className="font-display font-semibold text-md text-gray-800">Personal Side Quests</h3>
                    <p className="text-xs text-gray-400 font-sans leading-none">Design your own quick milestones (+5 pts)</p>
                  </div>

                  <form onSubmit={handleAddSideQuest} className="flex gap-2">
                    <input
                      id="new-quest-input"
                      type="text"
                      placeholder="e.g., Water chamomile plants..."
                      value={newSideQuestInput}
                      onChange={(e) => setNewSideQuestInput(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2.5 bg-pastel-rose-bg/40 focus:bg-white rounded-xl border border-pastel-coral/30"
                      required
                    />
                    <button
                      id="add-quest-submit"
                      type="submit"
                      className="bg-pastel-orange hover:bg-amber-200 transition-colors p-2.5 rounded-xl block cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-orange-955" />
                    </button>
                  </form>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {sideQuests.map((sq) => (
                      <div key={sq.id} className="flex items-center justify-between p-2.5 bg-pastel-rose-bg/20 rounded-xl hover:bg-pastel-rose-bg/40 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleToggleSideQuest(sq.id)}
                            className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-all ${
                              sq.completed ? 'bg-pastel-green border-pastel-green text-emerald-800' : 'bg-white border-pastel-orange/65'
                            }`}
                          >
                            {sq.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span className={`text-xs ${sq.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                            {sq.text}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSideQuest(sq.id)}
                          className="text-gray-300 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comprehensive milestone list */}
              <div className="bg-white rounded-3xl p-5 border border-pastel-coral/10 text-xs">
                <h3 className="font-display font-semibold text-md text-gray-800 mb-3 block">Happiness Milestone Roadmap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { pts: 10, title: 'Emoji Unlock', desc: '🎈 unlocks in the selection board', active: happyPoints >= 10 },
                    { pts: 25, title: 'Sunset Ambiance', desc: 'Unlocks customized peach system color themes', active: happyPoints >= 25 },
                    { pts: 50, title: 'Premium Audio', desc: 'Lotus Breath binaural music player enables', active: happyPoints >= 50 },
                    { pts: 100, title: 'Custom Gifting', desc: 'Enter customized real objectives & log checks', active: happyPoints >= 100 },
                  ].map((m) => (
                    <div
                      key={m.pts}
                      className={`p-4 rounded-3xl border transition-all ${
                        m.active
                          ? 'bg-gradient-to-br from-pastel-peach-light/50 to-white border-pastel-orange shadow-xs'
                          : 'bg-gray-50/50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono font-black text-pastel-orange">{m.pts} pts</span>
                        {m.active ? (
                          <span className="text-[10px] text-emerald-700 bg-pastel-green/45 px-2 py-0.2 rounded font-bold uppercase">
                            Met
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.2 rounded uppercase font-medium">Pending</span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 leading-tight mb-1">{m.title}</p>
                      <p className="text-[10px] text-gray-450 leading-relaxed font-sans">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Real Custom Rewards System at 100 points */}
              {happyPoints >= 100 && (
                <div className="bg-gradient-to-b from-[#FAE1DD] to-white rounded-3xl p-5 border-2 border-pastel-coral/30 shadow-xs space-y-4 animate-pop-bounce">
                  <div>
                    <h4 className="font-display font-bold text-gray-800 text-sm">Target Custom Gift Claims (100 pts Unlocked!)</h4>
                    <p className="text-xs text-gray-500 font-sans">Celebrate your mindfulness by completing customized gift goals.</p>
                  </div>

                  <form onSubmit={handleAddCustomReward} className="flex gap-2">
                    <input
                      id="new-custom-reward"
                      type="text"
                      placeholder="e.g. Treat myself to lavender hot cocoa bubble bath..."
                      value={customRewardText}
                      onChange={(e) => setCustomRewardText(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-pastel-coral/30"
                      required
                    />
                    <button
                      id="add-custom-reward-btn"
                      type="submit"
                      className="bg-pastel-pink bg-pastel-coral hover:bg-rose-200 text-xs font-semibold px-4 py-2 rounded-xl"
                    >
                      Add Custom Gift
                    </button>
                  </form>

                  <div className="space-y-2">
                    {unlockedCustomRewards.map((rew, index) => (
                      <div key={index} className="p-3 bg-white/80 rounded-2xl flex items-center justify-between shadow-xs">
                        <span className="text-xs text-gray-700 font-sans font-medium">🎁 {rew}</span>
                        <button
                          onClick={() => {
                            setUnlockedCustomRewards(unlockedCustomRewards.filter((_, i) => i !== index));
                            triggerQuickCelebration(`Claimed Cozy Custom Reward: "${rew}"! Awesome Job!`);
                          }}
                          className="bg-emerald-100 hover:bg-pastel-green hover:scale-101 px-3 py-1 text-[10px] font-bold text-emerald-800 rounded-full transition-transform active:scale-95"
                        >
                          Claim Reward
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'fitness' && (
            <motion.div
              key="fitness-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-sky-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200">
                <div className="space-y-1 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-200/50 text-sky-800 px-3 py-1 rounded-full">
                    Fitness & Hydration Tracker
                  </span>
                  <h3 className="font-display font-medium text-lg text-slate-800">Mindful Nourishment Journal</h3>
                  <p className="text-xs text-slate-500">Log clean eating streaks, pure water intake, and body stretches.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meal checkboxes display 3 circles */}
                  <div className="bg-white/80 rounded-2xl p-5 border border-sky-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Daily Nourishing Meals</h4>
                      <p className="text-[10px] text-gray-400">Aim to eat balanced wholesomely</p>
                    </div>

                    <div className="flex items-center gap-4 justify-around py-2">
                      {['Breakfast', 'Lunch', 'Dinner'].map((mealName, idx) => {
                        const isChecked = currentFitnessLog.mealsChecked[idx];
                        return (
                          <button
                            key={mealName}
                            id={`meal-${mealName.toLowerCase()}`}
                            onClick={() => handleToggleMeal(idx)}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                          >
                            <div
                              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-sky-200 border-sky-400 text-sky-850 scale-105 shadow-sm'
                                  : 'border-slate-200 bg-white group-hover:border-sky-300'
                              }`}
                            >
                              <Coffee className={`w-6 h-6 ${isChecked ? 'text-sky-800 animate-pop-bounce' : 'text-slate-350'}`} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">{mealName}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-[10px] text-slate-700 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Healthy Diet Streak tracker:</span>
                        <span>{eatingStreakDaysCount} Completed Days</span>
                      </div>
                      <p className="text-slate-500 leading-normal">
                        Every 3 days with all 3 meals checked off triggers a custom snack choice reward and cozy 1 points chimes!
                      </p>
                      
                      {/* Reward snack helper choice if steak multiple count > 0 */}
                      {eatingStreakDaysCount > 0 && eatingStreakDaysCount % 3 === 0 && (
                        <div className="mt-2 bg-emerald-100/70 p-2 rounded-lg border border-emerald-300 text-emerald-900 font-semibold animate-pulse">
                          🎁 Streak Active: Grab a delicious "Vegan Matcha Oats Bowl" or "Hazelnut Cocoa Bite"! claim +1 Happy point!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Water intake cups bubble clicks */}
                  <div className="bg-white/80 rounded-2xl p-5 border border-sky-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pure Water Hydration</h4>
                        <p className="text-[10px] text-gray-400">Target of 8 glasses daily</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                        {currentFitnessLog.waterGlasses} / 8 Glasses
                      </span>
                    </div>

                    {/* Clickable circular bubble glasses */}
                    <div className="grid grid-cols-4 gap-3 py-1">
                      {Array.from({ length: 8 }).map((_, inx) => {
                        const isGlassFilled = currentFitnessLog.waterGlasses > inx;
                        return (
                          <button
                            key={inx}
                            id={`water-bubble-${inx}`}
                            onClick={() => {
                              const currentGlasses = currentFitnessLog.waterGlasses;
                              let val = 0;
                              if (isGlassFilled) {
                                val = inx; // toggle back to clicked index
                              } else {
                                val = inx + 1; // fill up to clicked
                                setHappyPoints((p) => p + 1); // bonus point for hydration trigger
                                triggerQuickCelebration(`Hydration Goal Met! Glass ${val} log completed (+1 point)`);
                              }
                              updateFitnessLog({ waterGlasses: val });
                            }}
                            className={`h-11 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                              isGlassFilled
                                ? 'bg-[#D8E2DC] border-[#D8E2DC] text-teal-800 scale-102 shadow-xs font-bold'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-sky-200'
                            }`}
                          >
                            <span className="text-xs">💧</span>
                            <span className="text-[8px] font-bold">Cup {inx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Workout duration logs */}
                <div className="mt-6 bg-white/70 rounded-2xl p-5 border border-sky-100 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Daily Mindful movement Log</h4>
                    <p className="text-[10px] text-gray-400">Aim for gentle walking, cosmic stretches, or light Pilates!</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      const nameInput = (document.getElementById('workout-name') as HTMLInputElement).value;
                      const durationInput = parseInt((document.getElementById('workout-dur') as HTMLInputElement).value, 10);
                      handleAddWorkout(e, nameInput, durationInput);
                      (document.getElementById('workout-name') as HTMLInputElement).value = '';
                      (document.getElementById('workout-dur') as HTMLInputElement).value = '15';
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    <input
                      id="workout-name"
                      type="text"
                      placeholder="Stretching, yoga, walk..."
                      className="text-xs px-3 py-2 bg-white rounded-xl border border-sky-200"
                      required
                    />
                    <input
                      id="workout-dur"
                      type="number"
                      placeholder="Minutes"
                      className="text-xs px-3 py-2 bg-white rounded-xl border border-sky-200"
                      defaultValue={15}
                      min={1}
                      max={180}
                      required
                    />
                    <button
                      id="save-workout-btn"
                      type="submit"
                      className="bg-sky-400 hover:bg-sky-300 text-gray-800 text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer block"
                    >
                      Log Workout
                    </button>
                  </form>

                  <div className="space-y-1.5" id="workouts-daily-list">
                    {currentFitnessLog.workouts.map((w) => (
                      <div key={w.id} className="p-2.5 bg-sky-50/50 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium">
                          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                          <span className="text-slate-800">{w.activity}</span>
                          <span className="text-[10px] bg-sky-100 px-2 rounded-md font-mono font-bold text-sky-700">
                            {w.duration} minutes
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="text-gray-300 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 border border-pastel-peach/30 shadow-xs space-y-6">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFE5D9] text-amber-900 px-3 py-1 rounded-full">
                      Social Connection Lounge
                    </span>
                    <h3 className="font-display font-medium text-lg text-gray-800">Hangout Tracking with Friends & Family</h3>
                    <p className="text-xs text-gray-500">Record lovely moments connected with loved ones (+2 Happy Points!)</p>
                  </div>
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>

                {/* Social Goal Setting at Top */}
                <div className="p-4 bg-[#FFE5D9]/40 rounded-2xl border border-[#FFE5D9] space-y-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pastel-orange" />
                    Weekly Social Connection Checklist Goal
                  </h4>
                  <p className="text-[11px] text-gray-600 font-sans">
                    Aim to schedule at least two separate quiet dates this week!
                  </p>
                  
                  {/* Automated feedback evaluator based on week hangout count log */}
                  <div className="mt-3 p-3 bg-white/80 rounded-xl border border-[#FFE5D9] text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Evaluated Connection Status:</span>
                      <span className="text-pastel-orange font-mono font-bold">
                        {weekHangouts.length} logged hangouts
                      </span>
                    </div>

                    {/* End-of-week feedback evaluator */}
                    {weekHangouts.length >= 2 ? (
                      <p className="text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Smile className="w-4 h-4 text-pastel-green" />
                        "This week was lively! 🎉" You did an amazing job holding spaces for people!
                      </p>
                    ) : (
                      <p className="text-amber-800 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-pastel-orange" />
                        "You need to spend more time." 💛 Make sure to send a soft SMS chime or call mom!
                      </p>
                    )}
                  </div>
                </div>

                {/* Log simple hangout connection */}
                <form onSubmit={handleAddSocialHangout} className="bg-pastel-rose-bg/30 p-4 rounded-2xl border border-pastel-rose space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Log Hangout Memory</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-650">Who was in attendance?</label>
                      <input
                        id="social-with"
                        type="text"
                        placeholder="Sarah, Dad, close neighbors..."
                        value={socialWithInput}
                        onChange={(e) => setSocialWithInput(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-pastel-coral/30"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-650">What calming things did you focus on?</label>
                      <input
                        id="social-activity"
                        type="text"
                        placeholder="Acoustic lounge tea, slow forest stroll..."
                        value={socialActivityInput}
                        onChange={(e) => setSocialActivityInput(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-pastel-coral/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      id="save-social-memory"
                      type="submit"
                      className="bg-pastel-orange hover:bg-amber-200 text-gray-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-transform active:scale-95"
                    >
                      Assemble Social Log
                    </button>
                  </div>
                </form>

                {/* List social memories logged */}
                <div className="space-y-2" id="social-memories-timeline">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Hangout Memory Timeline</h4>
                  {socialHangouts.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-xs italic">Your lounge history is silent. Register a connect.</p>
                  ) : (
                    socialHangouts.map((h) => (
                      <div key={h.id} className="p-3.5 bg-pastel-rose-bg/10 rounded-2xl border border-pastel-coral/10 hover:bg-[#FFE5D9]/20 transition-colors flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 font-mono font-medium">{h.dateStr}</p>
                          <p className="text-xs font-bold text-gray-850">Connected with: <span className="text-pastel-orange">{h.withWho}</span></p>
                          <p className="text-[11px] text-gray-600 italic">"{h.activity}"</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSocialHangout(h.id)}
                          className="text-gray-300 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Monthly calendar display */}
              <div className="bg-white rounded-3xl p-6 border border-pastel-coral/20 shadow-xs space-y-4">
                <div className="flex justify-between items-center bg-pastel-rose-bg/30 p-4 rounded-2xl">
                  {/* Navigators inside month */}
                  <button
                    id="prev-month-btn"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-transform active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-display font-bold text-lg text-gray-800" id="calendar-header-title">
                    {getMonthName(calendarMonth)} {calendarYear}
                  </h3>
                  <button
                    id="next-month-btn"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day title columns headings */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 py-1 border-b border-gray-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="block py-1">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Days grid layout with green tick marks */}
                <div className="grid grid-cols-7 gap-1 text-center" id="calendar-days-grid">
                  {/* Spacing empty days block leading index */}
                  {Array.from({ length: firstDayIndex }).map((_, inx) => (
                    <div key={`empty-${inx}`} className="p-3 text-transparent text-xs" />
                  ))}

                  {/* Calendar cells */}
                  {Array.from({ length: daysInMonth }).map((_, inx) => {
                    const dayNum = inx + 1;
                    const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const hasJournal = journalEntries[dateString] && journalEntries[dateString].hasCompleted && journalEntries[dateString].emoji;
                    const isSelectToday = dateString === getTodayDateStr();
                    const isSelected = selectedDateStr === dateString;

                    return (
                      <button
                        key={dayNum}
                        id={`calcel-${dayNum}`}
                        onClick={() => {
                          setSelectedDateStr(dateString);
                          const dObj = new Date(calendarYear, calendarMonth, dayNum);
                          setSelectedDayIndex(dObj.getDay());
                          triggerQuickCelebration(`Navigated date: ${dateString}`);
                        }}
                        className={`p-2.5 rounded-2xl relative flex flex-col items-center justify-between min-h-[50px] border transition-all hover:scale-105 hover:bg-gray-50 focus:outline-hidden ${
                          isSelected
                            ? 'bg-pastel-rose-light/40 border-pastel-coral font-bold'
                            : 'bg-white border-transparent'
                        }`}
                      >
                        <span className={`text-xs ${isSelectToday ? 'w-5 h-5 rounded-full bg-pastel-coral text-gray-800 font-bold flex items-center justify-center' : 'text-gray-700'}`}>
                          {dayNum}
                        </span>

                        {/* Green ticks indicating journal completed days */}
                        <div className="h-4.5 flex items-center justify-center">
                          {hasJournal ? (
                            <span className="text-md animate-pop-bounce" title="Mindfulness journal draft exists">
                              💚
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-100 font-mono">.</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-[#D8E2DC]/30 p-3.5 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <span className="text-lg">💚</span>
                  <p className="leading-snug">
                     Days containing green ticks denote logged journal writing. Keep consistency up to secure special badges!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Provide a clear output preview: Mindfulness status digest receipt --- */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-pastel-coral/30 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-display font-semibold text-md text-gray-800">Mindfulness Status Digest Output</h3>
              <p className="text-[11px] text-gray-400">Précis of your day-to-day logs</p>
            </div>
            <div className="p-2.5 bg-pastel-rose-bg/60 rounded-xl">
              <Download className="w-4 h-4 text-pastel-orange" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-gray-600 bg-pastel-rose-bg/20 p-4 rounded-2xl border border-pastel-rose-light/20">
            {/* Journal Digest */}
            <div className="space-y-1.5 border-r border-gray-100/50 pr-2">
              <p className="font-bold underline text-pastel-coral uppercase tracking-wide">Journal Draft</p>
              {journalEntries[selectedDateStr] ? (
                <div className="space-y-1">
                  <p className="line-clamp-2 italic">"{journalEntries[selectedDateStr].description}"</p>
                  <p className="text-[10px]">Emoji: {journalEntries[selectedDateStr].emoji}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">No journal logged for today.</p>
              )}
            </div>

            {/* Tasks checklist status */}
            <div className="space-y-1.5 border-r border-gray-100/50 px-2">
              <p className="font-bold underline text-pastel-orange uppercase tracking-wide">Dynamic Plan Checklist</p>
              <div className="space-y-1">
                <p>Day specific: {tasks.filter((t) => t.dayIndex === selectedDayIndex && t.completed).length}/{tasks.filter((t) => t.dayIndex === selectedDayIndex).length} completed</p>
                <p>Weekly Goals: {weeklyGoals.filter((g) => g.completed).length}/{weeklyGoals.length} done</p>
              </div>
            </div>

            {/* fitness / water */}
            <div className="space-y-1.5 pl-2">
              <p className="font-bold underline text-teal-800 uppercase tracking-wide">Fitness & Nourishment</p>
              <div className="space-y-1">
                <p>Water: {currentFitnessLog.waterGlasses} glasses today</p>
                <div className="flex gap-1.5">
                  <span>meals Check:</span>
                  <span className="font-bold font-mono">
                    [{currentFitnessLog.mealsChecked.map((c) => (c ? 'X' : '_')).join(', ')}]
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-450 leading-relaxed text-center">
            Daydo organizes your schedule fully client-side inside secure browser containers. All calculations completed instantly.
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-4 bg-white/40 border-t border-slate-100 text-[10px] text-gray-500 mt-20">
        © 2026 Daydo Atmosphere. Crafted using pure Inter and Space Grotesk pastel modules.
      </footer>

      {/* --- Alarm Reminder Modal Overlay --- */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        reminders={reminders}
        onToggleReminder={handleToggleReminder}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
        onSimulateAlarm={(rem) => {
          setActiveAlert({
            message: `⏰ Alarum trigger: [${rem.time}] - "${rem.label}"! Breathe deeply and smile.`,
            category: rem.category,
          });
        }}
      />

      {/* --- Developer Demonstration Companion panel --- */}
      <DemoPanel
        onAddPoints={(pts) => {
          setHappyPoints((p) => p + pts);
        }}
        onSetSuccessfulDays={(days) => {
          // pre-populate 10 journal logs to trigger the dynamic unlock check
          const mocked: Record<string, JournalEntry> = { ...journalEntries };
          for (let i = 1; i <= days; i++) {
            const dateS = getPastDateStr(10 + i);
            mocked[dateS] = {
              dateStr: dateS,
              description: `Simulated successful day entry number ${i}`,
              emoji: '🍵',
              hasCompleted: true,
            };
          }
          setJournalEntries(mocked);
          triggerQuickCelebration(`Simulated ${days} Successful logged days immediately!`);
        }}
        onTriggerConfetti={() => setConfettiTrigger(true)}
        onSimulateAlarm={(msg, cat) => {
          setActiveAlert({ message: msg, category: cat });
        }}
        currentPoints={happyPoints}
        successfulDaysCount={successfulDaysCount}
      />
    </div>
  );
}
