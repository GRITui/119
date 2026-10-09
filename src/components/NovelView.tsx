import React, { useState, useEffect, useRef } from 'react';
import { DialogueLine, PlayerStats, Choice } from '../types/game';
import { CHARACTERS, STORY_IMAGES, ENDINGS } from '../data/storyData';
import { RainCanvas } from './RainCanvas';
import { sound } from '../services/soundEffects';
import {
  Smartphone,
  Save,
  Download,
  History,
  GitBranch,
  BookOpen,
  Settings,
  Home,
  Play,
  Pause,
  FastForward,
  Zap,
  Target,
  Shield,
  Wallet,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface NovelViewProps {
  currentLine: DialogueLine;
  currentNodeId: string;
  chapterTitle: string;
  stats: PlayerStats;
  isEnding?: boolean;
  endingId?: string;
  onAdvanceLine: () => void;
  onMakeChoice: (choice: Choice) => void;
  onOpenPhone: () => void;
  onOpenSave: () => void;
  onOpenLoad: () => void;
  onOpenBacklog: () => void;
  onOpenFlowchart: () => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onReturnToTitle: () => void;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  hasUnreadPhone: boolean;
}

export const NovelView: React.FC<NovelViewProps> = ({
  currentLine,
  currentNodeId,
  chapterTitle,
  stats,
  isEnding,
  endingId,
  onAdvanceLine,
  onMakeChoice,
  onOpenPhone,
  onOpenSave,
  onOpenLoad,
  onOpenBacklog,
  onOpenFlowchart,
  onOpenGlossary,
  onOpenSettings,
  onReturnToTitle,
  textSpeed,
  hasUnreadPhone,
}) => {
  // Typewriter state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const autoPlayTimeoutRef = useRef<number | null>(null);

  // Determine speaker
  const character = CHARACTERS[currentLine.speakerId] || CHARACTERS.narrator;
  const currentBgUrl = STORY_IMAGES[currentLine.bgImageId] || STORY_IMAGES.office_night;

  // Screen shake on dramatic cues
  useEffect(() => {
    if (currentLine.shakeScreen) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentLine]);

  // Audio BGM sync
  useEffect(() => {
    if (currentLine.bgm) {
      sound.playBgm(currentLine.bgm);
    }
  }, [currentLine.bgm]);

  // Phone notification ping
  useEffect(() => {
    if (currentLine.phoneNotification) {
      sound.playPhoneNotification();
    }
  }, [currentLine.phoneNotification]);

  // Typewriter text pacing
  useEffect(() => {
    if (textSpeed === 'instant') {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    const speedMs = textSpeed === 'fast' ? 12 : textSpeed === 'slow' ? 38 : 22;
    let charIndex = 0;
    const fullText = currentLine.text;

    const interval = window.setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      // Occasional keyboard typing click sound
      if (charIndex % 5 === 0) {
        sound.playKeyType();
      }

      if (charIndex >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [currentLine.text, textSpeed]);

  // Auto-play progression
  useEffect(() => {
    if (!isAutoPlay || isTyping || currentLine.choices) {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      return;
    }

    autoPlayTimeoutRef.current = window.setTimeout(() => {
      onAdvanceLine();
    }, 2800);

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isAutoPlay, isTyping, currentLine.choices, onAdvanceLine]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClickDialogueBox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleClickDialogueBox = () => {
    if (currentLine.choices && !isTyping) return;
    if (isTyping) {
      // Reveal immediately
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      sound.playClick();
      onAdvanceLine();
    }
  };

  const endingData = endingId ? ENDINGS[endingId] : null;

  return (
    <div
      className={`relative flex h-screen w-full flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 select-none ${
        isShaking ? 'animate-shake' : ''
      }`}
    >
      {/* Background Image Layer */}
      <img
        src={currentBgUrl}
        alt={currentLine.location}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out brightness-65"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70 pointer-events-none" />

      {/* Atmospheric Monsoon Rain Overlay */}
      <RainCanvas
        active={currentLine.weather === 'monsoon' || currentLine.weather === 'rain'}
        intensity={currentLine.weather === 'monsoon' ? 'monsoon' : 'light'}
      />

      {/* Top Bar HUD */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
        {/* Zone 1: Location & Time Unboxed Metadata */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
            {chapterTitle}
          </span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="text-xs text-slate-300 font-medium">{currentLine.location}</span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400">{currentLine.timeOfDay}</span>
        </div>

        {/* Zone 2: Player Vitals Dashboard */}
        <div className="flex items-center gap-5 text-xs">
          {/* Energy / Sanity */}
          <div className="flex items-center gap-1.5" title="Physical & Mental Energy">
            <Zap className={`h-3.5 w-3.5 ${stats.energy < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">Sanity:</span>
            <span className="font-semibold tabular-nums text-slate-200">{stats.energy}%</span>
          </div>

          {/* Performance */}
          <div className="flex items-center gap-1.5" title="Probation Performance Score">
            <Target className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-slate-400">Work Rating:</span>
            <span className="font-semibold tabular-nums text-slate-200">{stats.performance}%</span>
          </div>

          {/* Integrity */}
          <div className="flex items-center gap-1.5" title="Ethical Compass & Truth">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">Integrity:</span>
            <span className="font-semibold tabular-nums text-slate-200">{stats.integrity}%</span>
          </div>

          {/* Cash */}
          <div className="flex items-center gap-1.5" title="Cash Reserve in Bank Account">
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold tabular-nums text-emerald-300">
              ฿ {stats.savings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Zone 3: Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Phone button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPhone();
            }}
            className="relative rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            title="Bangkok Phone & Chats"
          >
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-amber-400" />
              <span>Phone</span>
            </div>
            {hasUnreadPhone && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenBacklog();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            title="Backlog Transcript"
          >
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span>Log</span>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenFlowchart();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            title="Branch Flowchart & Endings"
          >
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-amber-400" />
              <span>Map</span>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSave();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-800"
            title="Save Game"
          >
            <div className="flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5 text-slate-400" />
              <span>Save</span>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenGlossary();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-800"
            title="Bangkok Lore Handbook"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-800"
            title="Preferences"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnToTitle();
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-800"
            title="Main Menu"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Center Zone: Notification banners & Dilemma choices */}
      <div className="relative z-30 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-end px-6 pb-4">
        {/* Phone notification pop-up alert */}
        {currentLine.phoneNotification && (
          <div
            onClick={() => {
              sound.playClick();
              onOpenPhone();
            }}
            className="mb-3 flex cursor-pointer items-center justify-between rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 shadow-lg backdrop-blur-md transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400">
                  {currentLine.phoneNotification.sender}
                </p>
                <p className="text-xs text-slate-300">{currentLine.phoneNotification.snippet}</p>
              </div>
            </div>
            <span className="text-[11px] text-amber-400">Tap to open phone →</span>
          </div>
        )}

        {/* Ending Screen Summary if at ending */}
        {isEnding && endingData && (
          <div className="mb-4 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${endingData.badgeColor}`}>
                {endingData.verdict}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Probation Simulation Completed
              </span>
            </div>

            <div className="my-4">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl font-display">
                {endingData.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-amber-300">
                {endingData.thaiTitle}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {endingData.description}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Outcome Profile:</span> {endingData.finalStatsLabel}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenFlowchart();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                <GitBranch className="h-4 w-4 text-amber-400" />
                <span>Explore Other Endings</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onReturnToTitle();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Dilemma Choices Overlay */}
        {currentLine.choices && !isTyping && (
          <div className="mb-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Crucial Decision Point · Choose your path</span>
            </div>
            {currentLine.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                  if (choice.soundCue === 'tension') {
                    sound.playDramaticStinger();
                  } else if (choice.soundCue === 'success') {
                    sound.playSuccessChime();
                  } else {
                    sound.playClick();
                  }
                  onMakeChoice(choice);
                }}
                className="group relative flex flex-col items-start rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 text-left shadow-lg backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-850 hover:shadow-amber-500/10 active:scale-[0.99]"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-bold text-white group-hover:text-amber-300">
                    {choice.text}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
                </div>
                {choice.subtext && (
                  <p className="mt-1 text-xs text-slate-300">{choice.subtext}</p>
                )}
                {choice.dilemmaNote && (
                  <div className="mt-2 text-[11px] font-medium text-amber-400/90">
                    Impact: {choice.dilemmaNote}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Dialogue Window Box */}
        <div
          onClick={handleClickDialogueBox}
          className="relative min-h-[145px] cursor-pointer rounded-2xl border border-slate-700/80 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-md transition-all hover:border-slate-600"
        >
          {/* Speaker Badge */}
          {character.name && (
            <div className="mb-2.5 flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${character.avatarColor}`}
              >
                {character.avatarInitials}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold tracking-wide ${character.color}`}>
                  {character.name} {character.thaiName && `(${character.thaiName})`}
                </span>
                {character.role && (
                  <span className="text-[11px] text-slate-400 font-sans">
                    — {character.role}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dialogue Text */}
          <div className="text-sm leading-relaxed sm:text-base">
            <p className={`${currentLine.thought ? 'italic text-slate-300' : 'text-slate-100'}`}>
              {displayedText}
              {isTyping && (
                <span className="inline-block h-4 w-1.5 ml-1 bg-amber-400 animate-pulse" />
              )}
            </p>
            {currentLine.thaiText && !isTyping && (
              <p className="mt-2 text-xs text-slate-400 font-sans border-t border-slate-800/80 pt-1.5">
                {currentLine.thaiText}
              </p>
            )}
          </div>

          {/* Bottom Box Navigation Hint */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setIsAutoPlay(!isAutoPlay);
                }}
                className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                  isAutoPlay
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {isAutoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>Auto</span>
              </button>
              <span>Space / Click to advance</span>
            </div>

            {!isTyping && !currentLine.choices && !isEnding && (
              <span className="animate-bounce font-mono text-amber-400">▼ Next</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
