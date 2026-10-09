import React, { useState, useEffect, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { NovelView } from './components/NovelView';
import { PhoneModal } from './components/PhoneModal';
import { FlowchartModal } from './components/FlowchartModal';
import { BacklogModal } from './components/BacklogModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { GlossaryModal } from './components/GlossaryModal';
import { SettingsModal } from './components/SettingsModal';
import { STORY_NODES, ENDINGS } from './data/storyData';
import { DialogueLine, PlayerStats, Choice, SaveSlot } from './types/game';
import { sound } from './services/soundEffects';

const INITIAL_STATS: PlayerStats = {
  energy: 85,
  performance: 65,
  integrity: 80,
  savings: 8420,
  mayTrust: 70,
};

const UNLOCKED_ENDINGS_STORAGE = 'bangkok_vn_unlocked_endings';

export default function App() {
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING'>('TITLE');
  const [currentNodeId, setCurrentNodeId] = useState<string>('prologue_1');
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueLine[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>(['prologue_1']);
  const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);
  const [appliedWeatherNodeId, setAppliedWeatherNodeId] = useState<string | null>(null);

  // Modals state
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [saveLoadModalState, setSaveLoadModalState] = useState<{
    isOpen: boolean;
    mode: 'save' | 'load';
  }>({ isOpen: false, mode: 'save' });
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings
  const [bgmVolume, setBgmVolume] = useState<number>(0.35);
  const [sfxVolume, setSfxVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [textSpeed, setTextSpeed] = useState<'slow' | 'normal' | 'fast' | 'instant'>('normal');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Load unlocked endings from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UNLOCKED_ENDINGS_STORAGE);
      if (saved) {
        setUnlockedEndings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const currentNode = STORY_NODES[currentNodeId] || STORY_NODES.prologue_1;
  const currentLine = currentNode.lines[currentLineIndex] || currentNode.lines[0];
  const isEnding = !!currentNode.endingId;

  // Record dialogue in history
  useEffect(() => {
    if (gameState === 'PLAYING' && currentLine) {
      setDialogueHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].id === currentLine.id) {
          return prev;
        }
        return [...prev, currentLine];
      });
    }
  }, [gameState, currentLine]);

  // Track visited nodes
  useEffect(() => {
    if (!visitedNodes.includes(currentNodeId)) {
      setVisitedNodes((prev) => [...prev, currentNodeId]);
    }
  }, [currentNodeId, visitedNodes]);

  // Unlock endings
  useEffect(() => {
    if (currentNode.endingId && !unlockedEndings.includes(currentNode.endingId)) {
      const updated = [...unlockedEndings, currentNode.endingId];
      setUnlockedEndings(updated);
      try {
        localStorage.setItem(UNLOCKED_ENDINGS_STORAGE, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }, [currentNode.endingId, unlockedEndings]);

  // Apply dynamic location weather energy modifier
  useEffect(() => {
    if (gameState === 'PLAYING' && currentLine?.weatherEffect && appliedWeatherNodeId !== currentNodeId) {
      setAppliedWeatherNodeId(currentNodeId);
      const impact = currentLine.weatherEffect.energyImpact;
      if (impact !== 0) {
        setStats((prev) => ({
          ...prev,
          energy: Math.max(0, Math.min(100, prev.energy + impact)),
        }));
      }
    }
  }, [currentNodeId, currentLine, gameState, appliedWeatherNodeId]);

  // Audio adjustments
  const handleUpdateAudio = useCallback((bgm: number, sfx: number, muted: boolean) => {
    setBgmVolume(bgm);
    setSfxVolume(sfx);
    setIsMuted(muted);
    sound.setVolumes(bgm, sfx);
    sound.setMute(muted);
  }, []);

  const handleStartGame = () => {
    setStats(INITIAL_STATS);
    setCurrentNodeId('prologue_1');
    setCurrentLineIndex(0);
    setDialogueHistory([]);
    setAppliedWeatherNodeId(null);
    setGameState('PLAYING');
  };

  const handleAdvanceLine = () => {
    if (currentLineIndex < currentNode.lines.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    }
  };

  const handleMakeChoice = (choice: Choice) => {
    // Apply stat changes
    setStats((prev) => ({
      energy: Math.max(0, Math.min(100, prev.energy + (choice.statEffects.energy || 0))),
      performance: Math.max(0, Math.min(100, prev.performance + (choice.statEffects.performance || 0))),
      integrity: Math.max(0, Math.min(100, prev.integrity + (choice.statEffects.integrity || 0))),
      savings: Math.max(0, prev.savings + (choice.statEffects.savings || 0)),
      mayTrust: Math.max(0, Math.min(100, prev.mayTrust + (choice.statEffects.mayTrust || 0))),
    }));

    if (STORY_NODES[choice.nextNodeId]) {
      setCurrentNodeId(choice.nextNodeId);
      setCurrentLineIndex(0);
    }
  };

  const handleJumpToNode = (nodeId: string) => {
    if (STORY_NODES[nodeId]) {
      setCurrentNodeId(nodeId);
      setCurrentLineIndex(0);
      setGameState('PLAYING');
    }
  };

  const handleLoadGame = (slot: SaveSlot) => {
    setCurrentNodeId(slot.nodeId);
    setCurrentLineIndex(slot.lineIndex);
    setStats(slot.stats);
    setGameState('PLAYING');
  };

  const hasSavedGame = Boolean(localStorage.getItem('bangkok_vn_saves_v1'));

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {gameState === 'TITLE' ? (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenLoad={() => setSaveLoadModalState({ isOpen: true, mode: 'load' })}
          onOpenFlowchart={() => setIsFlowchartOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasSavedGame={hasSavedGame}
          unlockedEndingsCount={unlockedEndings.length}
        />
      ) : (
        <NovelView
          currentLine={currentLine}
          currentNodeId={currentNodeId}
          chapterTitle={currentNode.chapterTitle}
          stats={stats}
          isEnding={isEnding}
          endingId={currentNode.endingId}
          onAdvanceLine={handleAdvanceLine}
          onMakeChoice={handleMakeChoice}
          onOpenPhone={() => setIsPhoneOpen(true)}
          onOpenSave={() => setSaveLoadModalState({ isOpen: true, mode: 'save' })}
          onOpenLoad={() => setSaveLoadModalState({ isOpen: true, mode: 'load' })}
          onOpenBacklog={() => setIsBacklogOpen(true)}
          onOpenFlowchart={() => setIsFlowchartOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onReturnToTitle={() => {
            sound.stopBgm();
            setGameState('TITLE');
          }}
          textSpeed={textSpeed}
          hasUnreadPhone={!!currentLine.phoneNotification}
        />
      )}

      {/* Global Modals */}
      <PhoneModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        savings={stats.savings}
      />

      <FlowchartModal
        isOpen={isFlowchartOpen}
        onClose={() => setIsFlowchartOpen(false)}
        visitedNodes={visitedNodes}
        unlockedEndings={unlockedEndings}
        currentNodeId={currentNodeId}
        onJumpToNode={handleJumpToNode}
      />

      <BacklogModal
        isOpen={isBacklogOpen}
        onClose={() => setIsBacklogOpen(false)}
        dialogueHistory={dialogueHistory}
      />

      <SaveLoadModal
        isOpen={saveLoadModalState.isOpen}
        onClose={() => setSaveLoadModalState((prev) => ({ ...prev, isOpen: false }))}
        mode={saveLoadModalState.mode}
        currentNodeId={currentNodeId}
        currentLineIndex={currentLineIndex}
        chapterTitle={currentNode.chapterTitle}
        stats={stats}
        currentBg={currentLine.bgImageId}
        previewText={currentLine.text}
        onLoadGame={handleLoadGame}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        bgmVolume={bgmVolume}
        sfxVolume={sfxVolume}
        isMuted={isMuted}
        onUpdateAudio={handleUpdateAudio}
        textSpeed={textSpeed}
        onUpdateTextSpeed={setTextSpeed}
        fontSize={fontSize}
        onUpdateFontSize={setFontSize}
      />
    </main>
  );
}
