import React from 'react';
import { STORY_IMAGES, ENDINGS } from '../data/storyData';
import { RainCanvas } from './RainCanvas';
import { sound } from '../services/soundEffects';
import { Play, RotateCcw, GitBranch, BookOpen, Settings, Award } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLoad: () => void;
  onOpenFlowchart: () => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  hasSavedGame: boolean;
  unlockedEndingsCount: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLoad,
  onOpenFlowchart,
  onOpenGlossary,
  onOpenSettings,
  hasSavedGame,
  unlockedEndingsCount,
}) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Background with measured scrim overlay */}
      <img
        src={STORY_IMAGES.bts_rain}
        alt="Bangkok BTS Skytrain in Rain"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-60 filter"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

      {/* Monsoon Rain Atmosphere */}
      <RainCanvas active={true} intensity="monsoon" />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Vertex Labs · Bangkok Chronicles
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Endings: {unlockedEndingsCount} / {Object.keys(ENDINGS).length}</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-300 backdrop-blur-sm transition-colors hover:bg-slate-800 hover:text-white"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Central Hero Brand */}
      <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <span className="mb-2 text-xs font-semibold tracking-widest text-amber-400 uppercase font-sans">
          Interactive Narrative Experience
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl font-display">
          Bangkok 9-to-Late
        </h1>
        <p className="mt-2 text-lg font-medium text-amber-200/90 sm:text-xl font-sans">
          กรุงเทพฯ 24 ชั่วโมง: มนุษย์เงินเดือนป้ายแดง
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
          Navigate rush hour rains, 119-day probation tensions, corporate integrity dilemmas, and midnight street food stalls in the beating heart of Sukhumvit.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              sound.playBtsChime();
              sound.playBgm('rain_ambient');
              onStartGame();
            }}
            className="group flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 py-3.5 px-6 font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>{hasSavedGame ? 'New Game' : 'Begin Journey'}</span>
          </button>

          {hasSavedGame && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLoad();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 py-3 px-6 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>Continue from Save</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                onOpenFlowchart();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-slate-800"
            >
              <GitBranch className="h-3.5 w-3.5 text-amber-400" />
              <span>Flowchart</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenGlossary();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-slate-800"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Bangkok Lore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Footer */}
      <footer className="relative z-20 flex flex-col items-center justify-between gap-2 px-8 py-6 text-xs text-slate-400 sm:flex-row">
        <span>Sukhumvit 21 · Asok Interchange · Bangkok Thailand</span>
        <span>Thai Labor Protection Act § 118 Compliance Simulation</span>
      </footer>
    </div>
  );
};
