import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProgress, GameSettings, Achievement, AdState, LevelProgress } from '../types/game';
import { ACHIEVEMENTS } from '../data/achievements';

const KEYS = {
  PROGRESS:  'roadshift_progress_v1',
  SETTINGS:  'roadshift_settings_v1',
  ACHIEVEMENTS: 'roadshift_achievements_v1',
  AD_STATE:  'roadshift_adstate_v1',
};

function defaultProgress(): GameProgress {
  return {
    levels: {},
    unlockedDistricts: [1],
    totalStars: 0,
    successfulCompletions: 0,
    tutorialComplete: false,
  };
}

function defaultSettings(): GameSettings {
  return { soundEnabled: true, hapticEnabled: true };
}

function defaultAchievements(): Achievement[] {
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));
}

function defaultAdState(): AdState {
  return {
    successfulCompletions: 0,
    lastInterstitialTimestamp: 0,
    lastAppOpenTimestamp: 0,
    firstLaunch: true,
  };
}

async function safeGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const GameStorage = {
  async loadProgress(): Promise<GameProgress> {
    return safeGet(KEYS.PROGRESS, defaultProgress());
  },

  async saveProgress(progress: GameProgress): Promise<void> {
    return safeSet(KEYS.PROGRESS, progress);
  },

  async saveLevelResult(
    progress: GameProgress,
    levelId: number,
    score: number,
    stars: 0 | 1 | 2 | 3,
    districtId: number,
  ): Promise<GameProgress> {
    const prev = progress.levels[levelId];
    const improved = !prev || score > prev.bestScore;

    const updated: LevelProgress = {
      levelId,
      bestScore: improved ? score : prev.bestScore,
      stars:     (!prev || stars > prev.stars) ? stars : prev.stars,
      completed: true,
    };

    const newProgress: GameProgress = {
      ...progress,
      levels: { ...progress.levels, [levelId]: updated },
    };

    if (stars > 0 && improved) {
      newProgress.successfulCompletions = progress.successfulCompletions + 1;
    }

    newProgress.totalStars = Object.values(newProgress.levels).reduce((s, l) => s + (l.stars ?? 0), 0);

    const nextLevelId = levelId + 1;
    const nextDistrictId = Math.ceil(nextLevelId / 10);
    const DISTRICT_UNLOCK_MAP: Record<number, number> = { 2: 3, 3: 13, 4: 23, 5: 33, 6: 43 };
    const needed = DISTRICT_UNLOCK_MAP[nextDistrictId] ?? 0;
    if (needed > 0 && newProgress.totalStars >= needed && !newProgress.unlockedDistricts.includes(nextDistrictId)) {
      newProgress.unlockedDistricts = [...newProgress.unlockedDistricts, nextDistrictId];
    }

    await safeSet(KEYS.PROGRESS, newProgress);
    return newProgress;
  },

  async loadSettings(): Promise<GameSettings> {
    return safeGet(KEYS.SETTINGS, defaultSettings());
  },

  async saveSettings(settings: GameSettings): Promise<void> {
    return safeSet(KEYS.SETTINGS, settings);
  },

  async loadAchievements(): Promise<Achievement[]> {
    const stored = await safeGet<Achievement[]>(KEYS.ACHIEVEMENTS, []);
    const merged = defaultAchievements().map(def => {
      const found = stored.find(a => a.id === def.id);
      return found ?? def;
    });
    return merged;
  },

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    return safeSet(KEYS.ACHIEVEMENTS, achievements);
  },

  async unlockAchievement(id: string): Promise<Achievement[]> {
    const achievements = await this.loadAchievements();
    const updated = achievements.map(a =>
      a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a,
    );
    await this.saveAchievements(updated);
    return updated;
  },

  async loadAdState(): Promise<AdState> {
    return safeGet(KEYS.AD_STATE, defaultAdState());
  },

  async saveAdState(state: AdState): Promise<void> {
    return safeSet(KEYS.AD_STATE, state);
  },

  async resetAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.PROGRESS, KEYS.SETTINGS, KEYS.ACHIEVEMENTS, KEYS.AD_STATE]);
  },
};

export function checkAchievements(
  progress: GameProgress,
  achievements: Achievement[],
  levelId: number,
  stars: 0 | 1 | 2 | 3,
  result: { ridersOnTime: number; totalRiders: number; vehicleCount: number },
): string[] {
  const newlyUnlocked: string[] = [];
  const unlocked = new Set(achievements.filter(a => a.unlocked).map(a => a.id));

  const check = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) newlyUnlocked.push(id);
  };

  const levels = Object.values(progress.levels);
  const completedIds = new Set(levels.filter(l => l.completed).map(l => l.levelId));
  const totalStars = progress.totalStars;

  check('first_level', completedIds.size >= 1);
  check('first_3star', stars === 3);
  check('district1_done', [1,2,3,4,5,6,7,8,9,10].every(id => completedIds.has(id)));
  check('district2_done', [11,12,13,14,15,16,17,18,19,20].every(id => completedIds.has(id)));
  check('district3_done', [21,22,23,24,25,26,27,28,29,30].every(id => completedIds.has(id)));
  check('district4_done', [31,32,33,34,35,36,37,38,39,40].every(id => completedIds.has(id)));
  check('district5_done', [41,42,43,44,45,46,47,48,49,50].every(id => completedIds.has(id)));
  check('district6_done', [51,52,53,54,55,56,57,58,59,60].every(id => completedIds.has(id)));
  check('campaign_done',   completedIds.size >= 60);
  check('stars_50',  totalStars >= 50);
  check('stars_120', totalStars >= 120);
  check('stars_180', totalStars >= 180);
  check('no_delay', result.ridersOnTime === result.totalRiders && result.totalRiders > 0);
  check('multi_perfect', stars === 3 && result.vehicleCount >= 2);

  return newlyUnlocked;
}
