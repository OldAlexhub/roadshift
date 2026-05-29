import { district1Levels } from './district1';
import { district2Levels } from './district2';
import { district3Levels } from './district3';
import { district4Levels } from './district4';
import { district5Levels } from './district5';
import { district6Levels } from './district6';
import { LevelDef } from '../../types/game';

export const ALL_LEVELS: LevelDef[] = [
  ...district1Levels,
  ...district2Levels,
  ...district3Levels,
  ...district4Levels,
  ...district5Levels,
  ...district6Levels,
];

export function getLevel(id: number): LevelDef | undefined {
  return ALL_LEVELS.find(l => l.id === id);
}

export function getLevelsForDistrict(districtId: number): LevelDef[] {
  return ALL_LEVELS.filter(l => l.districtId === districtId);
}
