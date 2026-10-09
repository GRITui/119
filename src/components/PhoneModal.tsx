import React, { useState } from 'react';
import { INITIAL_CHAT_THREADS, ChatThread } from '../data/phoneData';
import { sound } from '../services/soundEffects';
import { ArrowLeft, MessageSquare, Wallet, CheckCheck, X, ShieldAlert } from 'lucide-react';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  savings: number;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onClose, savings }) => {
  const [threads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'banking'>('chats');

  if (!isOpen) return null;

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      {/* Phone Shell */}
      <div className="relative flex h-[620px] w-full max-w-[380px] flex-col overflow-hidden rounded-[36px] border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80 ring-1 ring-slate-800">
        {/* Phone Notch & Status Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-6 py-2.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-200 tabular-nums">08:42</span>
          <div className="h-4 w-24 rounded-full bg-slate-900/90" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>5G</span>
            <span>89%</span>
          </div>
        </div>

        {/* Phone Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2">
            {activeThreadId ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveThreadId(null);
                }}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Chats</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-100">Bangkok Mobile</span>
                <span className="text-[11px] text-slate-500">AIS 5G</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close Phone"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-3">
          {activeThread ? (
            /* Inside a Chat Thread */
            <div className="flex flex-col gap-3">
              <div className="border-b border-slate-800/80 pb-2 text-center">
                <p className="text-xs font-semibold text-slate-200">{activeThread.name}</p>
                <p className="text-[11px] text-slate-500">{activeThread.title}</p>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-amber-600 text-amber-50 rounded-br-xs'
                          : msg.type === 'bank_alert'
                          ? 'border border-emerald-800/50 bg-emerald-950/40 text-emerald-100 rounded-bl-xs'
                          : 'bg-slate-800 text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.type === 'bank_alert' && (
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <Wallet className="h-3 w-3" />
                          <span>K-Mobile Transaction</span>
                        </div>
                      )}
                      <p className="font-sans">{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.isMe && <CheckCheck className="h-3 w-3 text-amber-200" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'chats' ? (
            /* Threads List */
            <div className="flex flex-col gap-1.5">
              <div className="mb-2 px-1 text-[11px] font-medium text-slate-400">
                <span>Recent Conversations · Bangkok Life</span>
              </div>
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveThreadId(thread.id);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-slate-800 hover:bg-slate-900"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${thread.avatarBg}`}
                  >
                    {thread.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs font-semibold text-slate-200">
                        {thread.name}
                      </span>
                      {thread.unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-slate-400">{thread.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Banking Tab */
            <div className="flex flex-col gap-3 p-1">
              <div className="rounded-2xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/70 to-slate-900 p-4">
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>K-Savings Account</span>
                  <span className="text-[10px] text-slate-400">Bangkok Bank Sync</span>
                </div>
                <div className="my-2">
                  <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                    ฿ {savings.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">THB</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  <span>Upcoming Due: On Nut Studio Rent (฿ 9,500)</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Monthly Budget Breakdown</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Salary (Gross):</span>
                    <span className="text-slate-200 tabular-nums">฿ 28,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rent + Utilities (On Nut):</span>
                    <span className="text-rose-400 tabular-nums">- ฿ 11,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTS Skytrain Monthly Pass:</span>
                    <span className="text-rose-400 tabular-nums">- ฿ 1,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remittance to Parents:</span>
                    <span className="text-rose-400 tabular-nums">- ฿ 4,000</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1">
                    <span>Daily Survival Budget:</span>
                    <span className="text-emerald-400 tabular-nums">~ ฿ 375 / day</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom App Navigation */}
        <div className="flex items-center justify-around border-t border-slate-800 bg-slate-950 py-2.5 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('chats');
              setActiveThreadId(null);
            }}
            className={`flex flex-col items-center gap-0.5 ${
              activeTab === 'chats' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-[10px]">LINE Chat</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('banking');
              setActiveThreadId(null);
            }}
            className={`flex flex-col items-center gap-0.5 ${
              activeTab === 'banking' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span className="text-[10px]">K-Bank</span>
          </button>
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="flex justify-center bg-slate-950 pb-2">
          <div className="h-1 w-28 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
};
