import { useEffect, useCallback, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { HearingComment } from '../../data/hearings';

interface HearingOverlayProps {
  title: string;
  comments: HearingComment[];
  isAuthenticated: boolean;
  onClose: () => void;
  onGovAuth: () => void;
}

export function HearingOverlay({ title, comments, isAuthenticated, onClose, onGovAuth }: HearingOverlayProps) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeRef.current(); }
  }, []);

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
    padding: '36px 0 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    animation: 'overlaySlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
    maxHeight: '85vh',
    overflow: 'hidden',
  };

  const govGateStyle: React.CSSProperties = {
    margin: '8px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '20px 24px',
    background: colors.background.primaryInverse,
    borderRadius: 16,
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ padding: '0 32px 20px', borderBottom: `1px solid ${colors.line.dark}` }}>
        <span style={{ ...typography.headline.medium, color: colors.text.primaryInverse, fontWeight: 600 }}>
          {title}
        </span>
      </div>

      {/* Lista de comentários */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 12px' }}>
        {comments.map((comment, i) => (
          <div key={comment.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '16px 20px',
            borderBottom: i < comments.length - 1 ? `1px solid ${colors.line.dark}` : 'none',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: colors.background.primaryInverse,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20, color: colors.text.secondaryInverse }}>👤</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
                {comment.text}
              </p>
              <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
                {comment.author} · {comment.state} · {comment.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gate gov.br (se não autenticado) */}
      {!isAuthenticated && (
        <div style={govGateStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 24, color: colors.text.secondaryInverse, flexShrink: 0 }}>🔒</span>
            <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
              Participe de enquetes, acesse serviços gov.br e personalize sua experiência
            </p>
          </div>
          <button onClick={onGovAuth} style={{
            width: '100%', padding: '14px', borderRadius: 100, border: 'none',
            background: colors.background.primary, color: colors.text.primary,
            ...typography.body.large, fontWeight: 600, cursor: 'pointer',
          }}>
            Entrar com gov.br
          </button>
        </div>
      )}

      {/* Botão fechar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 0' }}>
        <button onClick={onClose} style={{
          padding: '14px 48px', borderRadius: 100, border: 'none',
          background: colors.background.primary, color: colors.text.primary,
          ...typography.body.large, fontWeight: 600, cursor: 'pointer',
        }}>
          Fechar
        </button>
      </div>
    </div>
  );
}
