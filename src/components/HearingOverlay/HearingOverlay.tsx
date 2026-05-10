import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { HearingComment } from '../../data/hearings';

interface HearingOverlayProps {
  title: string;
  comments: HearingComment[];
  isAuthenticated: boolean;
  onClose: () => void;
  onBack?: () => void;
  onGovAuth: () => void;
}

type DisplayComment = HearingComment & {
  isFresh?: boolean;
};

const MAX_VISIBLE_COMMENTS = 4;

const demoIncomingComments: Omit<HearingComment, 'id'>[] = [
  {
    text: 'Boa tarde, gostaria de reforçar a importância do tema para as famílias da minha região.',
    author: 'A. Souza',
    state: 'PE',
    time: 'agora',
  },
  {
    text: 'Esse debate precisa considerar acessibilidade digital desde o início da proposta.',
    author: 'M. Alves',
    state: 'SP',
    time: 'agora',
  },
  {
    text: 'A solução precisa chegar de forma prática para quem está acompanhando de casa.',
    author: 'R. Lima',
    state: 'BA',
    time: 'agora',
  },
  {
    text: 'Excelente iniciativa. Estou acompanhando e espero que isso avance para novas audiências.',
    author: 'C. Ferreira',
    state: 'CE',
    time: 'agora',
  },
];

export function HearingOverlay({ title, comments, isAuthenticated, onClose, onBack, onGovAuth }: HearingOverlayProps) {
  const closeRef = useRef(onClose);
  const liveIndexRef = useRef(0);
  const [visibleComments, setVisibleComments] = useState<DisplayComment[]>(() => comments.map(comment => ({ ...comment })));
  // When not authenticated: 0 = govAuth, 1 = voltar. When authenticated: 0 = voltar
  const maxFocus = isAuthenticated ? 0 : 1;
  const [focusIndex, setFocusIndex] = useState(0);

  closeRef.current = onClose;

  useEffect(() => {
    setVisibleComments(comments.map(comment => ({ ...comment })));
  }, [comments]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopImmediatePropagation(); (onBack ?? closeRef.current)(); }
    if (e.key === 'ArrowDown') { e.stopImmediatePropagation(); setFocusIndex(i => Math.min(i + 1, maxFocus)); }
    if (e.key === 'ArrowUp') { e.stopImmediatePropagation(); setFocusIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (!isAuthenticated && focusIndex === 0) onGovAuth();
      else (onBack ?? closeRef.current)();
    }
  }, [focusIndex, maxFocus, isAuthenticated, onGovAuth, onBack]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const template = demoIncomingComments[liveIndexRef.current % demoIncomingComments.length];
      liveIndexRef.current += 1;
      const nextId = `hearing-live-${Date.now()}-${liveIndexRef.current}`;

      setVisibleComments(current => [
        {
          id: nextId,
          ...template,
          isFresh: true,
        },
        ...current.map(comment => ({ ...comment, isFresh: false })),
      ].slice(0, MAX_VISIBLE_COMMENTS));
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
        {visibleComments.map((comment, i) => {
          const isFresh = Boolean(comment.isFresh);
          const rowStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '16px 20px',
            borderBottom: i < visibleComments.length - 1 ? `1px solid ${colors.line.dark}` : 'none',
            animation: isFresh ? 'hearingMessageIn 0.35s ease' : 'none',
          };

          const textStyle: React.CSSProperties = {
            ...typography.body.medium,
            color: colors.text.primaryInverse,
            margin: 0,
            filter: isAuthenticated ? 'none' : 'blur(2px)',
            opacity: isAuthenticated ? 1 : 0.88,
            transition: 'filter 0.25s ease, opacity 0.25s ease',
          };

          const metaStyle: React.CSSProperties = {
            ...typography.body.small,
            color: colors.text.secondaryInverse,
            margin: '4px 0 0',
            filter: isAuthenticated ? 'none' : 'blur(1px)',
            opacity: isAuthenticated ? 1 : 0.84,
            transition: 'filter 0.25s ease, opacity 0.25s ease',
          };

          return (
            <div key={comment.id} style={rowStyle}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: colors.background.primaryInverse,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: colors.text.secondaryInverse }}>person</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={textStyle}>
                  {comment.text}
                </p>
                <p style={metaStyle}>
                  {comment.author} · {comment.state} · {comment.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gate gov.br (se não autenticado) */}
      {!isAuthenticated && (
        <div style={govGateStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 24, color: colors.text.secondaryInverse, flexShrink: 0 }}>
              lock
            </span>
            <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
              Participe de enquetes, acesse serviços gov.br e personalize sua experiência
            </p>
          </div>
          <button onClick={onGovAuth} style={{
            width: '100%',
            padding: '14px',
            borderRadius: 100,
            border: focusIndex === 0 ? 'none' : `2px solid ${colors.line.dark}`,
            background: focusIndex === 0 ? colors.background.primary : 'transparent',
            color: focusIndex === 0 ? colors.text.primary : colors.text.primaryInverse,
            ...typography.body.large,
            fontWeight: 600,
            cursor: 'pointer',
            transform: focusIndex === 0 ? 'scale(1.02)' : 'scale(1)',
            boxShadow: focusIndex === 0 ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}>
            Entrar com gov.br
          </button>
        </div>
      )}

      {/* Botão voltar */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 0' }}>
        <button onClick={onBack ?? onClose} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 48px', borderRadius: 100, border: 'none',
          background: colors.background.primary, color: colors.text.primary,
          ...typography.body.large, fontWeight: 600, cursor: 'pointer',
          transform: focusIndex === maxFocus ? 'scale(1.05)' : 'scale(1)',
          boxShadow: focusIndex === maxFocus ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_back</span>
          Voltar
        </button>
      </div>

      <style>{`
        @keyframes hearingMessageIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
