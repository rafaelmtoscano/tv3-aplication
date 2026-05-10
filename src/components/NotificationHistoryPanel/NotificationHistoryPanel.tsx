import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { BellIcon } from '../../icons';
import { NotificationCard } from '../NotificationCard';
import type { HistoryNotification } from '../../hooks/useNotificationHistory';

interface NotificationHistoryPanelProps {
  items: HistoryNotification[];
  onClose: () => void;
  onClear: () => void;
}

export function NotificationHistoryPanel({ items, onClose, onClear }: NotificationHistoryPanelProps) {
  // focusIndex: 0..items.length-1 = cards, items.length = Clear, items.length+1 = Close
  const clearIndex = items.length;
  const closeIndex = items.length + 1;

  const [focusIndex, setFocusIndex] = useState<number>(() => items.length === 0 ? 1 : 0);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;

  const clearDisabled = items.length === 0;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      onCloseRef.current();
      return;
    }
    const isOnFooter = focusIndex >= clearIndex;
    if (e.key === 'ArrowDown') {
      e.stopImmediatePropagation();
      if (isOnFooter) return;
      setFocusIndex((i) => {
        const next = i + 1;
        if (next >= items.length) {
          return clearDisabled ? closeIndex : clearIndex;
        }
        return next;
      });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.stopImmediatePropagation();
      if (isOnFooter) {
        setFocusIndex(Math.max(items.length - 1, 0));
        return;
      }
      setFocusIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (!isOnFooter) return;
      e.stopImmediatePropagation();
      if (clearDisabled) return;
      setFocusIndex(focusIndex === clearIndex ? closeIndex : clearIndex);
      return;
    }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (focusIndex === clearIndex) {
        if (clearDisabled) return;
        onClearRef.current();
        setFocusIndex(1);
        return;
      }
      if (focusIndex === closeIndex) {
        onCloseRef.current();
        return;
      }
      const item = items[focusIndex];
      if (item?.onEnter) {
        item.onEnter();
      }
      onCloseRef.current();
    }
  }, [focusIndex, items, clearIndex, closeIndex, clearDisabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true } as EventListenerOptions);
  }, [handleKey]);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 48,
    right: 56,
    zIndex: 300,
    width: 560,
    maxHeight: 'calc(100vh - 96px)',
    background: colors.background.baseInverse,
    border: `4px solid ${colors.line.dark}`,
    borderRadius: 32,
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
    animation: 'notifHistorySlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
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
    flex: 1,
  };

  const headerCounterStyle: React.CSSProperties = {
    ...typography.body.medium,
    color: colors.text.secondaryInverse,
  };

  const messagesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 8px',
    overflowY: 'auto',
    flex: 1,
  };

  const emptyStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16,
    padding: 48,
  };

  const emptyTextStyle: React.CSSProperties = {
    ...typography.body.large,
    color: colors.text.secondaryInverse,
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '8px 24px 0',
    flexShrink: 0,
  };

  const buttonBaseStyle = (isFocused: boolean, disabled: boolean): React.CSSProperties => ({
    height: 64,
    padding: '0 32px',
    borderRadius: 100,
    border: `2px solid ${isFocused && !disabled ? 'transparent' : colors.line.dark}`,
    background: isFocused && !disabled ? colors.background.primary : 'transparent',
    color: disabled
      ? colors.text.disabledInverse
      : isFocused ? colors.text.primary : colors.text.primaryInverse,
    ...typography.body.large,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transform: isFocused && !disabled ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isFocused && !disabled ? '0 0 0 3px rgba(255, 255, 255, 0.3)' : 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease, opacity 0.2s ease',
  });

  return (
    <>
      <style>{`
        @keyframes notifHistorySlideIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div style={panelStyle}>
        <div style={headerContainerStyle}>
          <BellIcon size={28} color={colors.text.primaryInverse} />
          <span style={headerTitleStyle}>Notificações</span>
          {items.length > 0 && (
            <span style={headerCounterStyle}>
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={emptyStyle}>
            <BellIcon size={48} color={colors.text.secondaryInverse} />
            <span style={emptyTextStyle}>Nenhuma notificação</span>
          </div>
        ) : (
          <div style={messagesStyle}>
            {items.map((item, i) => (
              <NotificationCard
                key={item.id}
                item={item}
                isFocused={focusIndex === i}
              />
            ))}
          </div>
        )}

        <div style={footerStyle}>
          <button
            style={buttonBaseStyle(focusIndex === clearIndex, clearDisabled)}
            onClick={() => { onClear(); setFocusIndex(1); }}
            disabled={clearDisabled}
          >
            Limpar tudo
          </button>
          <button
            style={buttonBaseStyle(focusIndex === closeIndex, false)}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
