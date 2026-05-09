import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

// ─── NotificationCard ───────────────────────────────────────────

export interface NotificationItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  timestamp?: string;
  onEnter?: () => void;
}

interface NotificationCardProps {
  item: NotificationItem;
  isFocused: boolean;
}

function NotificationCard({ item, isFocused }: NotificationCardProps) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '24px 24px 24px 16px',
    borderRadius: 24,
    background: isFocused ? colors.background.primary : 'transparent',
    transition: 'background 0.2s ease',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: 17.6,
    background: isFocused ? colors.background.base : colors.line.dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s ease',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minWidth: 0,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.headline.medium,
    fontWeight: 500,
    color: isFocused ? colors.text.primary : colors.text.primaryInverse,
  };

  const timestampStyle: React.CSSProperties = {
    ...typography.headline.small,
    fontWeight: 500,
    color: isFocused ? colors.text.disabled : colors.text.secondaryInverse,
    opacity: isFocused ? 1 : 0.57,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    ...typography.headline.small,
    fontWeight: 500,
    color: isFocused ? colors.text.secondary : colors.text.primaryInverse,
    margin: 0,
    maxHeight: 75,
    overflow: 'hidden',
  };

  return (
    <div style={cardStyle}>
      {item.icon && (
        <div style={iconBoxStyle}>
          {item.icon}
        </div>
      )}
      <div style={contentStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>{item.title}</span>
          <span style={timestampStyle}>{item.timestamp ?? 'agora'}</span>
        </div>
        <p style={descriptionStyle}>{item.description}</p>
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

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 48,
    right: 56,
    zIndex: 300,
    width: 520,
    maxHeight: 'calc(100vh - 96px)',
    background: colors.background.baseInverse,
    border: `4px solid ${colors.line.dark}`,
    borderRadius: 32,
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
    animation: 'notifSlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
    overflow: 'hidden',
  };

  const headerContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 32px 16px',
    borderBottom: `1px solid ${colors.line.dark}`,
    marginBottom: 8,
  };

  const headerTitleStyle: React.CSSProperties = {
    ...typography.headline.medium,
    fontWeight: 600,
    color: colors.text.primaryInverse,
  };

  const messagesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 8px',
    overflowY: 'auto',
  };

  const isCloseFocused = focusIndex === items.length;
  const closeBtnStyle: React.CSSProperties = {
    alignSelf: 'center',
    marginTop: 8,
    height: 72,
    padding: '0 48px',
    borderRadius: 100,
    border: `4px solid ${colors.background.primary}`,
    background: colors.background.primary,
    color: colors.text.primary,
    ...typography.headline.medium,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease, transform 0.15s ease',
    transform: isCloseFocused ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isCloseFocused ? '0 0 0 4px rgba(255, 255, 255, 0.3)' : 'none',
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div style={panelStyle}>
        {showHeader && (
          <div style={headerContainerStyle}>
            <svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.33333 22.6667C0.955556 22.6667 0.638889 22.5389 0.383333 22.2833C0.127778 22.0278 0 21.7111 0 21.3333C0 20.9556 0.127778 20.6389 0.383333 20.3833C0.638889 20.1278 0.955556 20 1.33333 20H2.66667V10.6667C2.66667 8.82222 3.22222 7.18333 4.33333 5.75C5.44444 4.31667 6.88889 3.37778 8.66667 2.93333V2C8.66667 1.44444 8.86111 0.972222 9.25 0.583333C9.63889 0.194444 10.1111 0 10.6667 0C11.2222 0 11.6944 0.194444 12.0833 0.583333C12.4722 0.972222 12.6667 1.44444 12.6667 2V2.93333C14.4444 3.37778 15.8889 4.31667 17 5.75C18.1111 7.18333 18.6667 8.82222 18.6667 10.6667V20H20C20.3778 20 20.6944 20.1278 20.95 20.3833C21.2056 20.6389 21.3333 20.9556 21.3333 21.3333C21.3333 21.7111 21.2056 22.0278 20.95 22.2833C20.6944 22.5389 20.3778 22.6667 20 22.6667H1.33333ZM10.6667 26.6667C9.93333 26.6667 9.30556 26.4056 8.78333 25.8833C8.26111 25.3611 8 24.7333 8 24H13.3333C13.3333 24.7333 13.0722 25.3611 12.55 25.8833C12.0278 26.4056 11.4 26.6667 10.6667 26.6667Z" fill="white" />
            </svg>
            <span style={headerTitleStyle}>Notificações</span>
          </div>
        )}
        <div style={messagesStyle}>
          {items.map((item, i) => (
            <NotificationCard
              key={item.id}
              item={item}
              isFocused={focusIndex === i}
            />
          ))}
        </div>
        <button style={closeBtnStyle} onClick={onClose}>
          Fechar
        </button>
      </div>
    </>
  );
}