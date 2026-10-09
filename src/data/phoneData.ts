import { ChatMessage } from '../types/game';

export interface ChatThread {
  id: string;
  name: string;
  title: string;
  avatarBg: string;
  unreadCount: number;
  lastMessage: string;
  messages: ChatMessage[];
}

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread_mae',
    name: 'Mae (แม่)',
    title: 'Family · Home',
    avatarBg: 'bg-emerald-600',
    unreadCount: 1,
    lastMessage: 'Tonลูก, did you eat dinner yet? Don\'t forget to sleep...',
    messages: [
      {
        id: 'm1',
        senderId: 'mae',
        senderName: 'Mae (แม่)',
        avatarBg: 'bg-emerald-600',
        text: 'ต้นลูก ถึงกรุงเทพฯ สบายดีไหม วันนี้ฝนตกหนักไหมลูก?',
        timestamp: '07:45 AM',
      },
      {
        id: 'm2',
        senderId: 'ton',
        senderName: 'Ton',
        avatarBg: 'bg-amber-600',
        text: 'ฝนตกหนักมากครับแม่ ตอนนี้กำลังรอรถไฟฟ้าไปออฟฟิศครับ',
        timestamp: '07:52 AM',
        isMe: true,
      },
      {
        id: 'm3',
        senderId: 'mae',
        senderName: 'Mae (แม่)',
        avatarBg: 'bg-emerald-600',
        text: 'อย่าลืมกางร่มนะลูก พ่อฝากบอกว่าข้าวสารที่บ้านเริ่มเกี่ยวแล้ว ถ้าไม่พอกินบอกแม่นะ ไม่ต้องรีบส่งเงินมา',
        timestamp: '08:05 AM',
      },
      {
        id: 'm4',
        senderId: 'mae',
        senderName: 'Mae (แม่)',
        avatarBg: 'bg-emerald-600',
        text: 'Tonลูก, did you eat dinner yet? Don\'t forget to sleep. Dad and I are proud of you.',
        timestamp: '22:15 PM',
      },
    ],
  },
  {
    id: 'thread_may',
    name: 'May (เมย์ Dev)',
    title: 'Frontend Probation Peer',
    avatarBg: 'bg-teal-600',
    unreadCount: 2,
    lastMessage: 'Can\'t believe P\' Chai said that in the meeting...',
    messages: [
      {
        id: 'may_1',
        senderId: 'may',
        senderName: 'May',
        avatarBg: 'bg-teal-600',
        text: 'Ton! Did you see the new Figma board Chai uploaded at midnight?!',
        timestamp: '08:12 AM',
      },
      {
        id: 'may_2',
        senderId: 'ton',
        senderName: 'Ton',
        avatarBg: 'bg-amber-600',
        text: 'Yeah, I saw it... why does he always dump scopes right before client syncs?',
        timestamp: '08:14 AM',
        isMe: true,
      },
      {
        id: 'may_3',
        senderId: 'may',
        senderName: 'May',
        avatarBg: 'bg-teal-600',
        text: 'I swear if we don\'t pass probation because of his unrealistic promises, I\'m going to rage quit and sell grilled pork skewers in front of BTS On Nut 🍢',
        timestamp: '08:20 AM',
      },
      {
        id: 'may_4',
        senderId: 'may',
        senderName: 'May',
        avatarBg: 'bg-teal-600',
        text: 'Whatever happens tonight, let\'s stick together ok? We juniors gotta protect each other.',
        timestamp: '18:40 PM',
      },
    ],
  },
  {
    id: 'thread_chai',
    name: 'P\' Chai (Vertex Team)',
    title: 'Senior Account Director',
    avatarBg: 'bg-rose-700',
    unreadCount: 0,
    lastMessage: 'Great hustle today team. Family mindset!',
    messages: [
      {
        id: 'c1',
        senderId: 'chai',
        senderName: 'P\' Chai',
        avatarBg: 'bg-rose-700',
        text: '@channel Team, reminder that Siam Apex is our tier-1 account. Zero tolerance for sloppy typography or late decks.',
        timestamp: 'Yesterday 23:30 PM',
      },
      {
        id: 'c2',
        senderId: 'chai',
        senderName: 'P\' Chai',
        avatarBg: 'bg-rose-700',
        text: 'Ton, make sure your laptop is charged for the 10:00 AM demo.',
        timestamp: '08:35 AM',
      },
    ],
  },
  {
    id: 'thread_bank',
    name: 'K-Mobile Banking Alert',
    title: 'Financial Notifications',
    avatarBg: 'bg-emerald-700',
    unreadCount: 0,
    lastMessage: 'Monthly salary 28,000 THB credited.',
    messages: [
      {
        id: 'b1',
        senderId: 'bank',
        senderName: 'K-Alert',
        avatarBg: 'bg-emerald-700',
        text: 'Account x-4921: Salary payment 28,000.00 THB from VERTEX LABS CO., LTD. credited.',
        timestamp: 'Day 1 · 00:01 AM',
        type: 'bank_alert',
        amount: 28000,
      },
      {
        id: 'b2',
        senderId: 'bank',
        senderName: 'K-Alert',
        avatarBg: 'bg-emerald-700',
        text: 'Auto-Debit: Lumpini Condo Studio Rent 9,500.00 THB processed.',
        timestamp: 'Day 5 · 10:00 AM',
        type: 'bank_alert',
        amount: -9500,
      },
      {
        id: 'b3',
        senderId: 'bank',
        senderName: 'K-Alert',
        avatarBg: 'bg-emerald-700',
        text: 'Rabbit Card BTS Skytrain 30-Day Pass: 1,400.00 THB deducted.',
        timestamp: 'Day 6 · 08:00 AM',
        type: 'bank_alert',
        amount: -1400,
      },
      {
        id: 'b4',
        senderId: 'bank',
        senderName: 'K-Alert',
        avatarBg: 'bg-emerald-700',
        text: 'Current Available Balance: 8,420.00 THB.',
        timestamp: 'Today 18:00 PM',
        type: 'bank_alert',
      },
    ],
  },
];
