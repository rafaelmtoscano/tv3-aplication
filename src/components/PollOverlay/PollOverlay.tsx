import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { Poll } from '../../data/polls';

interface PollOverlayProps {
  poll: Poll;
  isAuthenticated: boolean;
  onClose: () => void;
  onBack?: () => void;
  onGovAuth: () => void;
}

export function PollOverlay({ poll, isAuthenticated: _isAuthenticated, onClose, onBack, onGovAuth }: PollOverlayProps) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // 0 = govAuth button, 1 = voltar button
  const [focusIndex, setFocusIndex] = useState(0);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopImmediatePropagation(); (onBack ?? closeRef.current)(); }
    if (e.key === 'ArrowDown') { e.stopImmediatePropagation(); setFocusIndex(i => Math.min(i + 1, 1)); }
    if (e.key === 'ArrowUp') { e.stopImmediatePropagation(); setFocusIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (focusIndex === 0) onGovAuth();
      else (onBack ?? closeRef.current)();
    }
  }, [focusIndex, onGovAuth, onBack]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 48,
    right: 56,
    zIndex: 300,
    width: 480,
    background: '#0D1220',
    border: `1px solid ${colors.line.dark}`,
    borderRadius: 24,
    padding: '36px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    animation: 'overlaySlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
  };

  const govGateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '20px 24px',
    background: colors.background.primaryInverse,
    borderRadius: 16,
  };

  const govBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: 100,
    border: 'none',
    background: colors.background.primary,
    color: colors.text.primary,
    ...typography.body.large,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={panelStyle}>
      <div>
        <p style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 600 }}>
          {poll.question}
        </p>
        <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: '8px 0 0' }}>
          Pauta: {poll.bill}
        </p>
      </div>

      <div style={govGateStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 24, color: colors.text.secondaryInverse, flexShrink: 0 }}>
            lock
          </span>
          <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
            Participe de enquetes, acesse serviços gov.br e personalize sua experiência
          </p>
        </div>
        <button style={{
          ...govBtnStyle,
          transform: focusIndex === 0 ? 'scale(1.02)' : 'scale(1)',
          boxShadow: focusIndex === 0 ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }} onClick={onGovAuth}>
          Entrar com gov.br
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={onBack ?? onClose} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 48px', borderRadius: 100, border: 'none',
          background: colors.background.primary, color: colors.text.primary,
          ...typography.body.large, fontWeight: 600, cursor: 'pointer',
          transform: focusIndex === 1 ? 'scale(1.05)' : 'scale(1)',
          boxShadow: focusIndex === 1 ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_back</span>
          Voltar
        </button>
      </div>
    </div>
  );
}
