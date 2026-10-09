export interface GlossaryTerm {
  term: string;
  thai: string;
  category: 'Workplace' | 'Bangkok Life' | 'Culture';
  definition: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: '119-Day Probation Rule',
    thai: 'ช่วงทดลองงาน 119 วัน',
    category: 'Workplace',
    definition: 'Under Section 118 of Thailand\'s Labor Protection Act, an employer can dismiss an employee with less than 120 days of continuous service without paying statutory severance pay. Hence, companies evaluate probationers closely up to day 119.',
  },
  {
    term: 'P\' (Phi) & Nong',
    thai: 'พี่ / น้อง',
    category: 'Culture',
    definition: 'Polite Thai hierarchical honorifics used ubiquitously in office culture. "P\'" denotes a senior colleague or mentor, while "Nong" addresses younger juniors.',
  },
  {
    term: 'Win-Win Motorcycle Taxi',
    thai: 'วินมอเตอร์ไซค์รับจ้าง',
    category: 'Bangkok Life',
    definition: 'Orange-vested motorbike taxis stationed at soi entrances. The ultimate Bangkok survival lifeline for weaving through gridlocked traffic to reach the BTS on time.',
  },
  {
    term: 'OT (Overtime)',
    thai: 'โอที (ทำงานล่วงเวลา)',
    category: 'Workplace',
    definition: 'Working past regular business hours. In many fast-paced creative and tech agencies, unpaid "passion" overtime is subtly expected under the guise of family culture.',
  },
  {
    term: 'First Jobber Salary Reality',
    thai: 'เงินเดือนเด็กจบใหม่',
    category: 'Workplace',
    definition: 'Typical entry-level Bangkok graduate salaries range from 22,000 to 30,000 THB. With condo studio rents near BTS running 8,500–12,000 THB plus transport and family remittances, budgeting is a constant tightrope.',
  },
  {
    term: 'BTS Siam Interchange',
    thai: 'สถานีสยาม จุดเปลี่ยนสาย',
    category: 'Bangkok Life',
    definition: 'The busiest transit nexus in Thailand, connecting the Sukhumvit and Silom lines. During 08:00–09:00 AM rush hour, thousands of commuters squeeze onto platforms in a synchronized urban sprint.',
  },
  {
    term: 'Street Noodle Stall Comfort',
    thai: 'บะหมี่เกี๊ยวริมทาง',
    category: 'Culture',
    definition: 'Roadside cart stalls (like Jae Da\'s in Soi 22) operating late into the night with hot broth, roast pork, and red plastic stools—the ultimate comfort food for exhausted office workers.',
  },
];
