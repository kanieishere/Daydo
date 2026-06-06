/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, Trophy, Settings, Heart, Gift } from 'lucide-react';

interface DemoPanelProps {
  onAddPoints: (points: number) => void;
  onSetSuccessfulDays: (days: number) => void;
  onTriggerConfetti: () => void;
  onSimulateAlarm: (label: string, category: string) => void;
  currentPoints: number;
  successfulDaysCount: number;
}

export default function DemoPanel({
  onAddPoints,
  onSetSuccessfulDays,
  onTriggerConfetti,
  onSimulateAlarm,
  currentPoints,
  successfulDaysCount,
}: DemoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Toggle Button */}
      <button
        id="demo-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 shadow-xl border border-slate-700 transition-transform active:scale-95 group"
        title="Daydo Demo Companion"
      >
        <Settings className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
      </button>

      {/* Slide-out Menu Panel */}
      {isOpen && (
        <div
          id="demo-panel-content"
          className="absolute bottom-14 right-0 bg-slate-900 text-gray-200 p-5 rounded-2xl shadow-2xl w-72 border border-slate-800 space-y-4 animate-pop-bounce font-sans text-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="font-display font-medium text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pastel-orange" />
              Daydo Playground
            </h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
              Dev Mode
            </span>
          </div>

          <div className="space-y-3">
            {/* Quick State Monitor */}
            <div className="bg-slate-950 p-2.5 rounded-lg text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Total Happy Points:</span>
                <span className="font-bold text-pastel-orange">{currentPoints} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Successful Logged Days:</span>
                <span className="font-bold text-pastel-green">{successfulDaysCount} days</span>
              </div>
            </div>

            {/* Simulated actions */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Accumulate Points</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="demo-add-10-pts"
                  onClick={() => {
                    onAddPoints(10);
                    onTriggerConfetti();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors py-1 px-2 rounded-sm text-xxs flex items-center justify-center gap-1 text-left"
                >
                  <Trophy className="w-3 h-3 text-pastel-peach" />
                  +10 Points
                </button>
                <button
                  id="demo-add-25-pts"
                  onClick={() => {
                    onAddPoints(25);
                    onTriggerConfetti();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors py-1 px-2 rounded-sm text-xxs flex items-center justify-center gap-1 text-left"
                >
                  <Gift className="w-3 h-3 text-pastel-coral" />
                  +25 Points
                </button>
              </div>
            </div>

            {/* Speed Milestones */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Simulate Milestones</p>
              <div className="space-y-1.5">
                <button
                  id="demo-seed-10-days"
                  onClick={() => {
                    onSetSuccessfulDays(10);
                    onTriggerConfetti();
                    onSimulateAlarm('10 Days Journal Reward Unlocked! 🎈 Check your Journal Tab emoji selector!', 'Journal');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors py-1 px-2.5 rounded-sm text-xxs text-left flex items-center justify-between"
                >
                  <span>Set 10 Successful Days</span>
                  <span className="bg-slate-900 text-pastel-green px-1.5 py-0.2 rounded-xs font-mono font-bold">🎈 Emoji</span>
                </button>
                
                <button
                  id="demo-seed-theme-pts"
                  onClick={() => {
                    onAddPoints(25 - currentPoints > 0 ? 25 - currentPoints : 1);
                    onTriggerConfetti();
                    onSimulateAlarm('Special Peach Pastel Theme Achieved! 🧡 Enjoy the luxury ambient shades.', 'General');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors py-1 px-2.5 rounded-sm text-xxs text-left flex items-center justify-between"
                >
                  <span>Unlock Special Theme (25 pts)</span>
                  <span className="bg-slate-900 text-pastel-orange px-1.5 py-0.2 rounded-xs font-mono font-bold">Theme</span>
                </button>
                
                <button
                  id="demo-seed-premium"
                  onClick={() => {
                    onAddPoints(50 - currentPoints > 0 ? 50 - currentPoints : 1);
                    onTriggerConfetti();
                    onSimulateAlarm('Deluxe Binaural Soundscapes Enabled! 🧘 Enjoy premium wind chimes audio in the background.', 'General');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors py-1 px-2.5 rounded-sm text-xxs text-left flex items-center justify-between"
                >
                  <span>Unlock Premium Features (50 pts)</span>
                  <span className="bg-slate-900 text-teal-400 px-1.5 py-0.2 rounded-xs font-mono font-bold">De Luxe</span>
                </button>
              </div>
            </div>

            {/* Test alert trigger */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Simulate Living Alarm</p>
              <button
                id="demo-trigger-alert"
                onClick={() => onSimulateAlarm('🌸 Breathing Space! Take deep slow breaths in your pastel bubble.', 'General')}
                className="w-full bg-emerald-800 hover:bg-emerald-700 transition-colors py-1 text-white rounded-sm text-xxs flex items-center justify-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
                Simulate Alarm Popup
              </button>
            </div>
          </div>
          
          <div className="text-[9px] text-slate-500 text-center italic border-t border-slate-800 pt-2">
            Click Settings gear again to hide this guide
          </div>
        </div>
      )}
    </div>
  );
}
