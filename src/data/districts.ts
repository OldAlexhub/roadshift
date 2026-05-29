import { DistrictDef } from '../types/game';

export const DISTRICTS: DistrictDef[] = [
  {
    id: 1,
    name: 'First Shift',
    description: 'Learn the basics of route planning, rider assignments, and earning stars.',
    mood: 'Early evening city. Clean roads. Beginner-friendly.',
    unlockRequirement: 0,
  },
  {
    id: 2,
    name: 'Downtown Flow',
    description: 'Busier streets, congestion, capacity management, and time pressure.',
    mood: 'Busy downtown. More lights. More movement.',
    unlockRequirement: 3,
  },
  {
    id: 3,
    name: 'Access Line',
    description: 'Accessible rider requirements and matching vehicle constraints.',
    mood: 'Community corridors. Respectful service.',
    unlockRequirement: 13,
  },
  {
    id: 4,
    name: 'Rain Circuit',
    description: 'Rainstorm conditions, road closures, and complex detours.',
    mood: 'Midnight rain. Reflections. Blue and amber glow.',
    unlockRequirement: 23,
  },
  {
    id: 5,
    name: 'Event Surge',
    description: 'Post-event rushes, shared destinations, and fleet pressure.',
    mood: 'Fictional arena district. Crowd energy. Urban lights.',
    unlockRequirement: 33,
  },
  {
    id: 6,
    name: 'Midnight Grid',
    description: 'All mechanics combined. The campaign finale.',
    mood: 'Deep-night final district. Maximum challenge.',
    unlockRequirement: 43,
  },
];
