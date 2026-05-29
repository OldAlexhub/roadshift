export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_level',    name: 'First Shift',         description: 'Complete your first level.' },
  { id: 'first_3star',    name: 'Perfect Route',        description: 'Earn your first three-star result.' },
  { id: 'district1_done', name: 'First Shift Complete', description: 'Complete all levels in First Shift.' },
  { id: 'district2_done', name: 'Downtown Flow',        description: 'Complete all levels in Downtown Flow.' },
  { id: 'district3_done', name: 'Access Champion',      description: 'Complete all levels in Access Line.' },
  { id: 'district4_done', name: 'Rain Rider',           description: 'Complete all levels in Rain Circuit.' },
  { id: 'district5_done', name: 'Surge Master',         description: 'Complete all levels in Event Surge.' },
  { id: 'district6_done', name: 'Midnight Grid',        description: 'Complete all levels in Midnight Grid.' },
  { id: 'campaign_done',  name: 'City Cleared',         description: 'Complete the full RoadShift campaign.' },
  { id: 'stars_50',       name: 'Rising Star',          description: 'Earn 50 total stars.' },
  { id: 'stars_120',      name: 'Star Driver',          description: 'Earn 120 total stars.' },
  { id: 'stars_180',      name: 'Perfect Record',       description: 'Earn all 180 stars.' },
  { id: 'no_delay',       name: 'Ahead of Schedule',    description: 'Complete a level with zero delays.' },
  { id: 'multi_perfect',  name: 'Fleet Commander',      description: 'Complete a multi-vehicle level with perfect efficiency.' },
];
