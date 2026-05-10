import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GridIcon } from '../icons';
import { colors } from '../styles/colors';
import { scheduleChannels } from '../data/notifications';
import type { NotificationItem } from '../components/NotificationCard';

const STORAGE_KEY = 'tv:notif-history:v1';
const HISTORY_LIMIT = 50;
const SCHEDULE_REMINDER_ID = 'schedule-reminder';

export interface HistoryNotification extends NotificationItem {
  addedAt: number;
}

interface PersistedNotification {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  addedAt: number;
  payload?: Record<string, unknown>;
}

interface UseNotificationHistoryOptions {
  onNavigate: (page: string) => void;
  onCloseHistory: () => void;
}

interface UseNotificationHistoryReturn {
  history: HistoryNotification[];
  addNotification: (item: NotificationItem) => void;
  clearHistory: () => void;
  unreadCount: number;
  markAsRead: () => void;
}

function rebuildIcon(id: string): React.ReactNode {
  if (id === SCHEDULE_REMINDER_ID) {
    return React.createElement(GridIcon, { size: 28, color: colors.background.brandPrimary });
  }
  if (id === 'device-connected' || id === 'device-requesting') {
    return React.createElement('span', { style: { fontSize: 28 } }, '📱');
  }
  if (id === 'govbr-connected') {
    return React.createElement(
      'span',
      {
        className: 'material-symbols-rounded',
        style: { fontSize: 28, color: '#1ea7fd' },
      },
      'verified_user',
    );
  }
  if (id === 'medication-available') {
    return React.createElement(
      'span',
      {
        className: 'material-symbols-rounded',
        style: { fontSize: 28, color: '#34D399' },
      },
      'medication',
    );
  }
  return null;
}

function descriptionToString(description: React.ReactNode): string {
  if (typeof description === 'string') return description;
  if (typeof description === 'number') return String(description);
  return '';
}

export function useNotificationHistory({
  onNavigate,
  onCloseHistory,
}: UseNotificationHistoryOptions): UseNotificationHistoryReturn {
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const onCloseHistoryRef = useRef(onCloseHistory);
  onCloseHistoryRef.current = onCloseHistory;

  const rebuildOnEnter = useCallback((id: string, payload?: Record<string, unknown>): (() => void) | undefined => {
    if (id === SCHEDULE_REMINDER_ID) {
      return () => {
        onCloseHistoryRef.current();
        onNavigateRef.current('schedule');
      };
    }
    if (id === 'medication-available') {
      return () => {
        onCloseHistoryRef.current();
        onNavigateRef.current('pharmacies');
      };
    }
    if (id === 'device-connected' || id === 'device-requesting' || id === 'govbr-connected') {
      return () => {
        onCloseHistoryRef.current();
        onNavigateRef.current('account');
      };
    }
    if (payload && typeof payload.navigateTo === 'string') {
      const target = payload.navigateTo;
      return () => {
        onCloseHistoryRef.current();
        onNavigateRef.current(target);
      };
    }
    return undefined;
  }, []);

  const [history, setHistory] = useState<HistoryNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: PersistedNotification[] = JSON.parse(raw);
      return parsed.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        timestamp: p.timestamp,
        addedAt: p.addedAt,
        icon: rebuildIcon(p.id),
        onEnter: rebuildOnEnter(p.id, p.payload),
      }));
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Persist to sessionStorage on history change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const persisted: PersistedNotification[] = history.map((h) => ({
        id: h.id,
        title: h.title,
        description: descriptionToString(h.description),
        timestamp: h.timestamp,
        addedAt: h.addedAt,
      }));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage full or unavailable — skip
    }
  }, [history]);

  const addNotification = useCallback((item: NotificationItem) => {
    setHistory((prev) => {
      const now = Date.now();
      const filtered = prev.filter((h) => h.id !== item.id);
      const next: HistoryNotification = { ...item, addedAt: now };
      const combined = [next, ...filtered];
      return combined.slice(0, HISTORY_LIMIT);
    });
    setUnreadCount((c) => c + 1);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setUnreadCount(0);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Seed permanent notifications on first mount (once per session)
  useEffect(() => {
    setHistory((prev) => {
      if (prev.some((h) => h.id === SCHEDULE_REMINDER_ID)) return prev;
      const channel = scheduleChannels[Math.floor(Math.random() * scheduleChannels.length)];
      const seed: HistoryNotification = {
        id: SCHEDULE_REMINDER_ID,
        title: 'Programação disponível',
        description: `Confira a grade completa do ${channel.name}. Tem conteúdo novo hoje.`,
        timestamp: 'hoje',
        addedAt: Date.now(),
        icon: rebuildIcon(SCHEDULE_REMINDER_ID),
        onEnter: rebuildOnEnter(SCHEDULE_REMINDER_ID),
      };
      return [seed, ...prev].slice(0, HISTORY_LIMIT);
    });
    // intentionally empty deps — runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { history, addNotification, clearHistory, unreadCount, markAsRead };
}
