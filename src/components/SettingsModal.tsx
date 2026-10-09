import React from 'react';
import { sound } from '../services/soundEffects';
import { Settings, X, Volume2, VolumeX, Sliders, Type, FastForward } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  onUpdateAudio: (bgm: number, sfx: number, muted: boolean) => void;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  onUpdateTextSpeed: (speed: 'slow' | 'normal' | 'fast' | 'instant') => void;
  fontSize: 'small' | 'medium' | 'large';
  onUpdateFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  bgmVolume,
  sfxVolume,
  isMuted,
  onUpdateAudio,
  textSpeed,
  onUpdateTextSpeed,
  fontSize,
  onUpdateFontSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Audio & Visual Preferences</h2>
              <p className="text-xs text-slate-400">Customize your visual novel reading experience</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-xs text-slate-300">
          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-amber-400" />
                Sound & Atmosphere
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onUpdateAudio(bgmVolume, sfxVolume, !isMuted);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isMuted ? 'bg-rose-950/60 text-rose-300' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span>Bangkok Atmosphere (BGM / Rain / Lo-Fi)</span>
                <span className="tabular-nums font-mono text-slate-400">
                  {Math.round(bgmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                disabled={isMuted}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateAudio(val, sfxVolume, isMuted);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span>Sound Effects (BTS Chimes, Typing, Pings)</span>
                <span className="tabular-nums font-mono text-slate-400">
                  {Math.round(sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                disabled={isMuted}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateAudio(bgmVolume, val, isMuted);
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Text Speed */}
          <div className="space-y-3 pt-2">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FastForward className="h-4 w-4 text-amber-400" />
              Dialogue Typewriter Speed
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['slow', 'normal', 'fast', 'instant'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    sound.playClick();
                    onUpdateTextSpeed(spd);
                  }}
                  className={`rounded-lg py-2 font-medium capitalize transition-colors ${
                    textSpeed === spd
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3 pt-2">
            <span className="font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Type className="h-4 w-4 text-amber-400" />
              Reading Font Scale
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    sound.playClick();
                    onUpdateFontSize(sz);
                  }}
                  className={`rounded-lg py-2 font-medium capitalize transition-colors ${
                    fontSize === sz
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 px-6 py-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
