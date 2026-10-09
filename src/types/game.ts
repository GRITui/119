export interface Character {
  id: string;
  name: string;
  thaiName: string;
  role: string;
  color: string;
  avatarColor: string;
  avatarInitials: string;
}

export type Mood = 'neutral' | 'happy' | 'stressed' | 'shocked' | 'determined' | 'exhausted' | 'smug';

export interface PlayerStats {
  energy: number;       // 0 to 100 (Health/Sanity)
  performance: number;  // 0 to 100 (Office evaluation)
  integrity: number;    // 0 to 100 (Moral compass)
  savings: number;      // THB currency
  mayTrust: number;     // 0 to 100 (Relationship with peer May)
}

export interface Choice {
  id: string;
  text: string;
  subtext?: string;
  dilemmaNote?: string;
  statEffects: Partial<PlayerStats>;
  nextNodeId: string;
  soundCue?: 'decision' | 'tension' | 'success';
}

export type WeatherType = 'monsoon' | 'heat_haze' | 'ac_chill' | 'golden_dusk' | 'clear';

export interface WeatherEffect {
  type: WeatherType;
  label: string;
  thaiLabel: string;
  tempCelsius: number;
  humidityPercent: number;
  energyImpact: number; // energy modification (+ or -)
  impactReason: string;
  thaiImpactReason: string;
}

export interface DialogueLine {
  id: string;
  speakerId: 'ton' | 'may' | 'chai' | 'lin' | 'narrator' | 'mae' | 'barista' | 'system';
  speakerName?: string;
  mood?: Mood;
  text: string;
  thaiText?: string;
  thought?: boolean;
  bgImageId: 'bts_rain' | 'office_night' | 'street_food' | 'condo_balcony';
  timeOfDay: '08:15 AM · Rush Hour' | '14:30 PM · Client Suite' | '18:45 PM · Overtime' | '22:15 PM · Street Alley' | '00:30 AM · Late Condo' | 'Final Review Day';
  location: string;
  bgm?: 'chill_lofi' | 'rain_ambient' | 'office_hum' | 'dramatic_tension' | 'none';
  weather?: WeatherType;
  weatherEffect?: WeatherEffect;
  shakeScreen?: boolean;
  choices?: Choice[];
  phoneNotification?: {
    sender: string;
    snippet: string;
  };
}

export interface StoryNode {
  id: string;
  chapter: string;
  chapterTitle: string;
  lines: DialogueLine[];
  endingId?: string;
}

export interface EndingInfo {
  id: string;
  title: string;
  thaiTitle: string;
  tagline: string;
  description: string;
  verdict: 'Success with Compromise' | 'Creative Independence' | 'Balanced Modern Life' | 'Physical Reset' | 'Systemic Reform';
  bgImageId: 'bts_rain' | 'office_night' | 'street_food' | 'condo_balcony';
  finalStatsLabel: string;
  badgeColor: string;
}

export interface SaveSlot {
  id: number;
  timestamp: string;
  chapterTitle: string;
  nodeId: string;
  lineIndex: number;
  stats: PlayerStats;
  currentBg: string;
  previewText: string;
}

export interface ChatMessage {
  id: string;
  senderId: 'mae' | 'may' | 'chai' | 'bank' | 'ton';
  senderName: string;
  avatarBg: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
  type?: 'text' | 'bank_alert' | 'urgent';
  amount?: number;
}
