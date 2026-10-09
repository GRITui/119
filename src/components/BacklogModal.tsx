import React from 'react';
import { DialogueLine } from '../types/game';
import { CHARACTERS } from '../data/storyData';
import { sound } from '../services/soundEffects';
import { History, X } from 'lucide-react';

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialogueHistory: DialogueLine[];
}

export const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  onClose,
  dialogueHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Dialogue Backlog & History</h2>
              <p className="text-xs text-slate-400">Review past conversations in this playthrough</p>
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

        {/* List */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {dialogueHistory.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-10">No dialogue recorded yet.</div>
          ) : (
            dialogueHistory.map((item, idx) => {
              const char = CHARACTERS[item.speakerId] || CHARACTERS.narrator;
              return (
                <div key={idx} className="border-b border-slate-800/60 pb-3 last:border-b-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`text-xs font-bold ${char.color}`}>
                      {char.name} {char.thaiName && `(${char.thaiName})`}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.timeOfDay}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {item.thought ? `"${item.text}"` : item.text}
                  </p>
                  {item.thaiText && (
                    <p className="mt-1 text-xs text-slate-400 font-sans">
                      {item.thaiText}
                    </p>
                  )}
                </div>
              );
            })
          )}
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
