/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppReminder } from '../types';
import { DAYS_OF_WEEK } from '../utils';
import { X, Clock, Plus, Trash2, Bell, Sparkles } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: AppReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<AppReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
  onSimulateAlarm: (reminder: AppReminder) => void;
}

export default function ReminderModal({
  isOpen,
  onClose,
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onSimulateAlarm,
}: ReminderModalProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState<AppReminder['category']>('General');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // defaults Mon-Fri
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleToggleDay = (idx: number) => {
    if (newDays.includes(idx)) {
      setNewDays(newDays.filter((i) => i !== idx));
    } else {
      setNewDays([...newDays, idx].sort());
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddReminder({
      time: newTime,
      label: newLabel,
      active: true,
      category: newCategory,
      days: newDays,
    });
    setNewLabel('');
    setShowAddForm(false);
  };

  return (
    <div
      id="reminder-modal-overlay"
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'reminder-modal-overlay') onClose();
      }}
    >
      <div
        id="reminder-modal-container"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-pastel-coral/20 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pastel-coral via-pastel-peach to-pastel-peach-light p-6 text-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg leading-tight">Mindful Reminders</h2>
              <p className="text-xs text-gray-600 font-sans">Set gentle alerts to ground your day</p>
            </div>
          </div>
          <button
            id="close-reminders"
            onClick={onClose}
            className="p-1.5 hover:bg-white/40 rounded-full transition-colors text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Header Action */}
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-medium text-sm text-gray-500 uppercase tracking-wider">Scheduled Chimes</h3>
            <button
              id="add-reminder-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-pastel-green hover:bg-emerald-200 transition-colors rounded-full text-gray-700"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? 'Cancel' : 'New Alarm'}
            </button>
          </div>

          {/* Add Reminder Form */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-pastel-rose-bg/70 p-4 rounded-2xl border border-pastel-rose/70 space-y-4 animate-pop-bounce">
              <h4 className="font-display font-medium text-sm text-gray-700">Schedule Peaceful Reminder</h4>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 block">Reminder Name</label>
                <input
                  id="reminder-label"
                  type="text"
                  placeholder="e.g. Soft herbal tea brewing breath"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full text-sm px-3- py-2.5 bg-white/70 rounded-xl border border-pastel-coral/30 focus:outline-hidden focus:ring-2 focus:ring-pastel-coral/80 px-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 block">Time</label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 bg-white/70 rounded-xl border border-pastel-coral/30 text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 block">Atmosphere</label>
                  <select
                    id="reminder-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AppReminder['category'])}
                    className="w-full text-xs px-2 py-1.5 bg-white/70 rounded-xl border border-pastel-coral/30 h-10"
                  >
                    <option value="Journal">🌸 Journal Time</option>
                    <option value="Fitness">💧 Hydrate/Move</option>
                    <option value="Social">🤍 Care Connection</option>
                    <option value="General">🍃 Gentle Breathe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 block">Repeat Every</label>
                <div className="flex gap-1 justify-between">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = newDays.includes(day.index);
                    return (
                      <button
                        key={day.index}
                        type="button"
                        onClick={() => handleToggleDay(day.index)}
                        className={`w-7 h-7 text-xxs font-semibold rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-pastel-coral text-gray-800 shadow-xs'
                            : 'bg-white/40 text-gray-400 hover:bg-white/80'
                        }`}
                        style={{ fontSize: '10px' }}
                      >
                        {day.short[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                id="save-reminder-submit"
                type="submit"
                className="w-full py-2 bg-pastel-orange hover:bg-amber-200 text-gray-800 text-xs font-medium rounded-xl shadow-xs transition-colors"
              >
                Assemble Reminder
              </button>
            </form>
          )}

          {/* Alarm items list */}
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs font-sans">
                No active alarms. Tap "New Alarm" to write a reminder!
              </div>
            ) : (
              reminders.map((rem) => {
                const categoryColor = 
                  rem.category === 'Journal' ? 'bg-pastel-green border-pastel-green text-emerald-800' :
                  rem.category === 'Fitness' ? 'bg-sky-100 border-sky-300 text-sky-800' :
                  rem.category === 'Social' ? 'bg-pastel-peach-light border-pastel-peach text-peach-800' :
                  'bg-pastel-gray border-pastel-gray text-gray-800';

                return (
                  <div
                    key={rem.id}
                    id={`reminder-${rem.id}`}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      rem.active ? 'bg-white shadow-xs' : 'bg-gray-50/50 border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-lg text-gray-800">{rem.time}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColor}`}>
                          {rem.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-sans font-medium line-clamp-1">{rem.label}</p>
                      
                      <div className="flex gap-1 pt-1">
                        {DAYS_OF_WEEK.map((d) => (
                          <span
                            key={d.index}
                            className={`text-[8px] font-bold px-1 rounded-sm ${
                              rem.days.includes(d.index)
                                ? 'text-pastel-orange bg-pastel-orange/10'
                                : 'text-gray-300'
                            }`}
                          >
                            {d.short[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`test-reminder-${rem.id}`}
                        onClick={() => onSimulateAlarm(rem)}
                        title="Simulate prompt alert action immediately"
                        className="p-1.5 hover:bg-pastel-rose-bg rounded-lg text-pastel-orange transition-transform hover:scale-105"
                      >
                        <Bell className="w-4.5 h-4.5" />
                      </button>
                      
                      <button
                        id={`toggle-reminder-${rem.id}`}
                        onClick={() => onToggleReminder(rem.id)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-hidden ${
                          rem.active ? 'bg-pastel-green' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            rem.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        id={`delete-reminder-${rem.id}`}
                        onClick={() => onDeleteReminder(rem.id)}
                        className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pastel-orange" />
            Automatic background loop active
          </span>
          <span>Time is kept in Local Time</span>
        </div>
      </div>
    </div>
  );
}
