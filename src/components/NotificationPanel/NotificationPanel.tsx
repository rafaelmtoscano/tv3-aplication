import { useEffect, useCallback, useRef, useState } from 'react';
import './NotificationPanel.css';

// ─── NotificationCard ───────────────────────────────────────────

export interface NotificationItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  timestamp?: string;
  onEnter?: () => void;
}

interface NotificationCardProps {
  item: NotificationItem;
  isFocused: boolean;
}

function NotificationCard({ item, isFocused }: NotificationCardProps) {
  return (
    <div className={`notif-card ${isFocused ? 'notif-card--focused' : ''}`}>
      {item.icon && (
        <div className={`notif-card__icon-box ${isFocused ? 'notif-card__icon-box--focused' : ''}`}>
          {item.icon}
        </div>
      )}
      <div className="notif-card__content">
        <div className="notif-card__header">
          <span className={`notif-card__title ${isFocused ? 'notif-card__title--focused' : ''}`}>
            {item.title}
          </span>
          <span className={`notif-card__timestamp ${isFocused ? 'notif-card__timestamp--focused' : ''}`}>
            {item.timestamp ?? 'agora'}
          </span>
        </div>
        <p className={`notif-card__description ${isFocused ? 'notif-card__description--focused' : ''}`}>
          {item.description}
        </p>
      </div>
    </div>
  );
}

// ─── NotificationPanel ──────────────────────────────────────────

export interface NotificationPanelProps {
  items: NotificationItem[];
  showHeader?: boolean;
  onClose: () => void;
  autoHide?: number;
}

export function NotificationPanel({
  items,
  showHeader = false,
  onClose,
  autoHide = 15000,
}: NotificationPanelProps) {
  // focusIndex: -1 = no card, 0..items.length-1 = cards, items.length = Close button
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!autoHide) return;
    const t = setTimeout(() => closeRef.current(), autoHide);
    return () => clearTimeout(t);
  }, [autoHide]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      closeRef.current();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.stopImmediatePropagation();
      setFocusIndex(i => Math.min(i + 1, items.length));
    }
    if (e.key === 'ArrowUp') {
      e.stopImmediatePropagation();
      setFocusIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (focusIndex === items.length) {
        closeRef.current();
      } else if (focusIndex >= 0) {
        items[focusIndex]?.onEnter?.();
      }
    }
  }, [focusIndex, items]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  return (
    <>
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="notif-panel">
        {showHeader && (
          <div className="notif-panel__header">
            <svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.33333 22.6667C0.955556 22.6667 0.638889 22.5389 0.383333 22.2833C0.127778 22.0278 0 21.7111 0 21.3333C0 20.9556 0.127778 20.6389 0.383333 20.3833C0.638889 20.1278 0.955556 20 1.33333 20H2.66667V10.6667C2.66667 8.82222 3.22222 7.18333 4.33333 5.75C5.44444 4.31667 6.88889 3.37778 8.66667 2.93333V2C8.66667 1.44444 8.86111 0.972222 9.25 0.583333C9.63889 0.194444 10.1111 0 10.6667 0C11.2222 0 11.6944 0.194444 12.0833 0.583333C12.4722 0.972222 12.6667 1.44444 12.6667 2V2.93333C14.4444 3.37778 15.8889 4.31667 17 5.75C18.1111 7.18333 18.6667 8.82222 18.6667 10.6667V20H20C20.3778 20 20.6944 20.1278 20.95 20.3833C21.2056 20.6389 21.3333 20.9556 21.3333 21.3333C21.3333 21.7111 21.2056 22.0278 20.95 22.2833C20.6944 22.5389 20.3778 22.6667 20 22.6667H1.33333ZM10.6667 26.6667C9.93333 26.6667 9.30556 26.4056 8.78333 25.8833C8.26111 25.3611 8 24.7333 8 24H13.3333C13.3333 24.7333 13.0722 25.3611 12.55 25.8833C12.0278 26.4056 11.4 26.6667 10.6667 26.6667Z" fill="white"/>
            </svg>
            <span className="notif-panel__header-title">Notificações</span>
          </div>
        )}
        <div className="notif-panel__messages">
          {items.map((item, i) => (
            <NotificationCard
              key={item.id}
              item={item}
              isFocused={focusIndex === i}
            />
          ))}
        </div>
        <button
          className={`notif-panel__close-btn ${focusIndex === items.length ? 'notif-panel__close-btn--focused' : ''}`}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </>
  );
}
