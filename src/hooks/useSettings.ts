import { useState, useEffect, useCallback } from 'react';
import { Vibration } from 'react-native';
import { GameSettings } from '../types/game';
import { GameStorage } from '../storage/gameStorage';

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>({ soundEnabled: true, hapticEnabled: true });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    GameStorage.loadSettings().then(s => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<GameSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await GameStorage.saveSettings(next);
  }, [settings]);

  const triggerHaptic = useCallback((pattern?: number | number[]) => {
    if (!settings.hapticEnabled) return;
    Vibration.vibrate(pattern ?? 50);
  }, [settings.hapticEnabled]);

  return { settings, loaded, updateSettings, triggerHaptic };
}
