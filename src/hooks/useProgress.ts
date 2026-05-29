import { useState, useEffect, useCallback } from 'react';
import { GameProgress, Achievement } from '../types/game';
import { GameStorage, checkAchievements } from '../storage/gameStorage';

export function useProgress() {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([GameStorage.loadProgress(), GameStorage.loadAchievements()]).then(([p, a]) => {
      setProgress(p);
      setAchievements(a);
      setLoaded(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    const [p, a] = await Promise.all([GameStorage.loadProgress(), GameStorage.loadAchievements()]);
    setProgress(p);
    setAchievements(a);
  }, []);

  const completeTutorial = useCallback(async () => {
    if (!progress) return;
    const next = { ...progress, tutorialComplete: true };
    setProgress(next);
    await GameStorage.saveProgress(next);
  }, [progress]);

  const resetAll = useCallback(async () => {
    await GameStorage.resetAll();
    const [p, a] = await Promise.all([GameStorage.loadProgress(), GameStorage.loadAchievements()]);
    setProgress(p);
    setAchievements(a);
  }, []);

  return { progress, achievements, loaded, refresh, completeTutorial, resetAll };
}
