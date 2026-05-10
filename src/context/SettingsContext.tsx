import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '../data/settings';
import { DEFAULT_SETTINGS, FONT_SCALE_LARGE, SETTINGS_STORAGE_KEY } from '../data/settings';

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
  }
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  fontScaleValue: number;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const VLIBRAS_SCRIPT_SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js';

function loadInitialSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota errors */
    }
  }, [settings]);

  // VLibras
  useEffect(() => {
    if (settings.librasEnabled) {
      // Inject canonical container required by VLibras Widget
      if (!document.querySelector('[vw]')) {
        const container = document.createElement('div');
        container.setAttribute('vw', '');
        container.className = 'enabled';
        container.innerHTML =
          '<div vw-access-button class="active"></div>' +
          '<div vw-plugin-wrapper>' +
          '<div class="vw-plugin-top-wrapper"></div>' +
          '</div>';
        document.body.appendChild(container);
      }
      if (document.querySelector(`script[src*="vlibras-plugin"]`)) return;
      const script = document.createElement('script');
      script.src = VLIBRAS_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        try {
          if (window.VLibras) {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          }
        } catch {
          /* ignore widget init errors */
        }
      };
      document.body.appendChild(script);
    } else {
      document.querySelector('[vw]')?.remove();
      document.querySelector('script[src*="vlibras-plugin"]')?.remove();
    }
  }, [settings.librasEnabled]);

  const fontScaleValue = useMemo(
    () => (settings.largeText ? FONT_SCALE_LARGE : 1),
    [settings.largeText],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSetting, fontScaleValue }),
    [settings, updateSetting, fontScaleValue],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
