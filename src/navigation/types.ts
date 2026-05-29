import { SimulationResult } from '../types/game';

export type RootStackParamList = {
  Loading:       undefined;
  Tutorial:      undefined;
  Home:          undefined;
  DistrictMap:   { districtId?: number };
  LevelBriefing: { levelId: number };
  DispatchBoard: { levelId: number };
  LiveShift:     { levelId: number; result: SimulationResult };
  Results:       { levelId: number; result: SimulationResult; newAchievements: string[] };
  Achievements:  undefined;
  Settings:      undefined;
  PrivacyPolicy: undefined;
  About:         undefined;
};
