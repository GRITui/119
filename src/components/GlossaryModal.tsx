import React, { useState } from 'react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import { sound } from '../services/soundEffects';
import { BookOpen, X, Search, Sparkles } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Workplace' | 'Bangkok Life' | 'Culture'>('all');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.thai.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Bangkok First Jobber Lore & Survival Handbook
              </h2>
              <p className="text-xs text-slate-400">
                Essential culture, labor laws, and urban survival vocabulary
              </p>
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

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms (e.g., Probation, BTS, OT, Win-Win)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 text-xs">
            {(['all', 'Workplace', 'Bangkok Life', 'Culture'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Terms List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching entries found for "{search}".
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-400">{item.term}</span>
                    <span className="text-xs font-medium text-slate-400 font-sans">({item.thai})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{item.category}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {item.definition}
                </p>
              </div>
            ))
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
