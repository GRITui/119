import React from 'react';
import { ENDINGS } from '../data/storyData';
import { sound } from '../services/soundEffects';
import { GitBranch, X, Award, ArrowRight, Play } from 'lucide-react';

interface FlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitedNodes: string[];
  unlockedEndings: string[];
  currentNodeId: string;
  onJumpToNode: (nodeId: string) => void;
}

interface ChapterNode {
  id: string;
  title: string;
  chapter: string;
  tag: string;
  type: 'start' | 'choice' | 'climax' | 'ending';
  endingKey?: string;
  parentIds: string[];
}

const FLOW_NODES: ChapterNode[] = [
  {
    id: 'prologue_1',
    chapter: 'Prologue',
    title: 'The 08:15 AM Monsoon Commute',
    tag: 'Siam BTS Dilemma',
    type: 'start',
    parentIds: [],
  },
  {
    id: 'act1_office_arrival_bts',
    chapter: 'Act 1',
    title: 'Packed Train Arrival',
    tag: 'Badge Scan 08:57 AM',
    type: 'choice',
    parentIds: ['prologue_1'],
  },
  {
    id: 'act1_office_arrival_winwin',
    chapter: 'Act 1',
    title: 'Motorcycle Taxi Dash',
    tag: 'Win-Win 120 THB',
    type: 'choice',
    parentIds: ['prologue_1'],
  },
  {
    id: 'act1_office_arrival_coffee',
    chapter: 'Act 1',
    title: 'Calm 7-Eleven Coffee',
    tag: 'Tardy Note 09:04 AM',
    type: 'choice',
    parentIds: ['prologue_1'],
  },
  {
    id: 'act1_the_crisis',
    chapter: 'Act 1',
    title: 'The 18:45 PM Client Crisis',
    tag: 'P\' Chai\'s Scope Overhaul',
    type: 'choice',
    parentIds: ['act1_office_arrival_bts', 'act1_office_arrival_winwin', 'act1_office_arrival_coffee'],
  },
  {
    id: 'act2_the_all_nighter',
    chapter: 'Act 2',
    title: 'Midnight Red Bull & Falsified Data',
    tag: 'Slide 14 Manipulation Dilemma',
    type: 'choice',
    parentIds: ['act1_the_crisis'],
  },
  {
    id: 'act2_the_negotiation',
    chapter: 'Act 2',
    title: 'Tactical Diplomacy (Phased Scope)',
    tag: 'Concept A/B Solution',
    type: 'choice',
    parentIds: ['act1_the_crisis'],
  },
  {
    id: 'act2_the_rebellion',
    chapter: 'Act 2',
    title: 'Direct Confrontation & Lin\'s Entry',
    tag: 'MD Khun Lin Intervenes',
    type: 'choice',
    parentIds: ['act1_the_crisis'],
  },
  {
    id: 'act3_night_noodles',
    chapter: 'Act 3',
    title: 'Jae Da\'s Midnight Noodle Stall',
    tag: 'Charoenkrung Studio Offer',
    type: 'choice',
    parentIds: ['act2_the_negotiation'],
  },
  {
    id: 'act3_lin_takes_notice',
    chapter: 'Act 3',
    title: 'The Managing Director\'s Eye',
    tag: 'Rest as Professionalism',
    type: 'choice',
    parentIds: ['act2_the_rebellion'],
  },
  {
    id: 'act3_pitch_morning_compromised',
    chapter: 'Act 3',
    title: 'Boardroom Under Fire',
    tag: 'CTO Inquires Conversion Data',
    type: 'choice',
    parentIds: ['act2_the_all_nighter'],
  },
  {
    id: 'act3_pitch_morning_honest',
    chapter: 'Act 3',
    title: 'The Test of Principle',
    tag: 'Honest Metric Victory',
    type: 'choice',
    parentIds: ['act2_the_all_nighter', 'act3_lin_takes_notice'],
  },
  {
    id: 'act4_final_boardroom_dilemma',
    chapter: 'Act 4',
    title: 'Day 119: 120-Day Probation Climax',
    tag: 'Final Review Suite',
    type: 'climax',
    parentIds: ['act3_night_noodles', 'act3_pitch_morning_honest', 'act3_lin_takes_notice'],
  },
  {
    id: 'ending_corporate_climber_node',
    chapter: 'Ending 1',
    title: 'The Silicon Sukhumvit Climber',
    tag: 'Promotion at the Cost of Soul',
    type: 'ending',
    endingKey: 'ending_corporate_climber',
    parentIds: ['act4_final_boardroom_dilemma', 'act3_pitch_morning_compromised'],
  },
  {
    id: 'ending_indie_collective_node',
    chapter: 'Ending 2',
    title: 'Studio Chao Phraya (Indie Path)',
    tag: 'Creative Independence & Craft',
    type: 'ending',
    endingKey: 'ending_indie_collective',
    parentIds: ['act4_final_boardroom_dilemma'],
  },
  {
    id: 'ending_pragmatic_survivor_node',
    chapter: 'Ending 3',
    title: 'The Bangkok Pragmatist',
    tag: 'Balanced Boundaries Mastered',
    type: 'ending',
    endingKey: 'ending_pragmatic_survivor',
    parentIds: ['act4_final_boardroom_dilemma'],
  },
  {
    id: 'ending_burnout_collapse_node',
    chapter: 'Ending 4',
    title: 'Burnout Crash & Life Reboot',
    tag: 'Hospital Awakening & Family',
    type: 'ending',
    endingKey: 'ending_burnout_collapse',
    parentIds: ['act2_the_all_nighter'],
  },
  {
    id: 'ending_whistleblower_reform_node',
    chapter: 'Ending 5',
    title: 'The Glass Tower Reformer',
    tag: 'Ethics & Systemic Reform',
    type: 'ending',
    endingKey: 'ending_whistleblower_reform',
    parentIds: ['act4_final_boardroom_dilemma', 'act3_pitch_morning_compromised'],
  },
];

export const FlowchartModal: React.FC<FlowchartModalProps> = ({
  isOpen,
  onClose,
  visitedNodes,
  unlockedEndings,
  currentNodeId,
  onJumpToNode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Narrative Flowchart & Endings Map
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Branching Narrative</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-semibold tabular-nums">
                  {unlockedEndings.length} / 5 Endings Discovered
                </span>
              </div>
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

        {/* Endings Trophy Shelf */}
        <div className="grid grid-cols-1 gap-2 border-b border-slate-800/80 bg-slate-950/40 p-4 sm:grid-cols-5">
          {Object.values(ENDINGS).map((ending) => {
            const isUnlocked = unlockedEndings.includes(ending.id);
            return (
              <div
                key={ending.id}
                className={`rounded-xl border p-2.5 transition-all ${
                  isUnlocked
                    ? `${ending.badgeColor}`
                    : 'border-slate-800 bg-slate-900/40 opacity-40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <Award className="h-3.5 w-3.5" />
                  <span className="truncate">{ending.title.split(':')[0]}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] font-medium">
                  {isUnlocked ? ending.title.split(':')[1] : '??? (Undiscovered)'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Scrollable Flowchart Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 text-xs text-slate-400">
            Click on any visited chapter node to jump directly to that point in the timeline and explore alternate choices.
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {FLOW_NODES.map((node) => {
              const isVisited = visitedNodes.includes(node.id);
              const isCurrent = currentNodeId === node.id;
              const isEnding = node.type === 'ending';

              return (
                <div
                  key={node.id}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-950/20 shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/40'
                      : isVisited
                      ? 'border-slate-700 bg-slate-800/70 hover:border-slate-600'
                      : 'border-slate-800/60 bg-slate-950/30 opacity-45'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-400">{node.chapter}</span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                          <Play className="h-3 w-3 fill-amber-400" /> Current
                        </span>
                      )}
                      {!isCurrent && isVisited && (
                        <span className="text-[10px] text-emerald-400">Unlocked</span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-semibold text-slate-100">
                      {isVisited ? node.title : '??? (Unexplored Path)'}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {isVisited ? node.tag : 'Make choices in previous chapters to unlock'}
                    </p>
                  </div>

                  {isVisited && !isCurrent && (
                    <div className="mt-3 flex items-center justify-end border-t border-slate-700/50 pt-2.5">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onJumpToNode(node.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
                      >
                        <span>Jump to Node</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3 text-xs text-slate-400">
          <span>Bangkok 9-to-Late Branching Decision Tree</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
