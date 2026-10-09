import React, { useState, useEffect } from 'react';
import { SaveSlot, PlayerStats } from '../types/game';
import { sound } from '../services/soundEffects';
import { Save, Download, Trash2, X, Clock, Zap, Target } from 'lucide-react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  currentNodeId: string;
  currentLineIndex: number;
  chapterTitle: string;
  stats: PlayerStats;
  currentBg: string;
  previewText: string;
  onLoadGame: (slot: SaveSlot) => void;
}

const STORAGE_KEY = 'bangkok_vn_saves_v1';

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentNodeId,
  currentLineIndex,
  chapterTitle,
  stats,
  currentBg,
  previewText,
  onLoadGame,
}) => {
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null, null]);
  const [activeTab, setActiveTab] = useState<'save' | 'load'>(mode);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSlots(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveToSlot = (slotIndex: number) => {
    sound.playSuccessChime();
    const newSlot: SaveSlot = {
      id: slotIndex + 1,
      timestamp: new Date().toLocaleString(),
      chapterTitle,
      nodeId: currentNodeId,
      lineIndex: currentLineIndex,
      stats: { ...stats },
      currentBg,
      previewText,
    };

    const newSlots = [...slots];
    newSlots[slotIndex] = newSlot;
    setSlots(newSlots);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots));
  };

  const handleLoadSlot = (slot: SaveSlot) => {
    sound.playSuccessChime();
    onLoadGame(slot);
    onClose();
  };

  const handleDeleteSlot = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header with Segmented Tab */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              {activeTab === 'save' ? <Save className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {activeTab === 'save' ? 'Save Game State' : 'Load Saved Game'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === 'save'
                  ? 'Select a memory slot to record your journey'
                  : 'Resume your Bangkok story from a previous point'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('save');
                }}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === 'save'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Save
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('load');
                }}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  activeTab === 'load'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Load
              </button>
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
        </div>

        {/* Slots List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {slots.map((slot, index) => (
            <div
              key={index}
              onClick={() => {
                if (activeTab === 'save') {
                  handleSaveToSlot(index);
                } else if (slot) {
                  handleLoadSlot(slot);
                }
              }}
              className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                slot
                  ? 'border-slate-700 bg-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800'
                  : activeTab === 'save'
                  ? 'border-dashed border-slate-700 bg-slate-900/40 hover:border-amber-500/40 hover:bg-slate-800/30'
                  : 'border-dashed border-slate-800/60 bg-slate-950/20 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/60 text-sm font-bold text-amber-400">
                  0{index + 1}
                </div>

                {slot ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {slot.chapterTitle}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{slot.timestamp}</span>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400 font-sans">
                      "{slot.previewText}"
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" />
                        Energy: {slot.stats.energy}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-teal-400" />
                        Performance: {slot.stats.performance}%
                      </span>
                      <span>฿ {slot.stats.savings.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-medium text-slate-400">Empty Save Slot</span>
                    <p className="text-xs text-slate-500">
                      {activeTab === 'save' ? 'Click to record current game state here' : 'No data'}
                    </p>
                  </div>
                )}
              </div>

              {slot && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteSlot(index, e)}
                    className="rounded-lg p-2 text-slate-500 opacity-60 transition-opacity hover:bg-rose-950/40 hover:text-rose-400 group-hover:opacity-100"
                    title="Delete Slot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
