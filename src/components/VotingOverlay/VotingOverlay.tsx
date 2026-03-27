import { useState, useEffect, useCallback, useRef } from 'react';
import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { VotingResult } from '../../data/votingMock';

interface VotingOverlayProps {
  data: VotingResult;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 6;

const VOTE_COLORS = {
  sim:       '#4CAF50',
  nao:       '#F44336',
  abstencao: '#FFC107',
};

const VOTE_LABELS = {
  sim:       'Sim',
  nao:       'Não',
  abstencao: 'Abstenção',
};

export function VotingOverlay({ data, onClose }: VotingOverlayProps) {
  const [page, setPage] = useState(0);
  const [pageTransitionKey, setPageTransitionKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const totalPages = Math.ceil(data.deputies.length / ITEMS_PER_PAGE);
  const pageDeputies = data.deputies.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  const goToPage = useCallback((nextPage: number) => {
    if (nextPage === page) return;
    setTransitionDirection(nextPage > page ? 'forward' : 'backward');
    setPage(nextPage);
    setPageTransitionKey(key => key + 1);
  }, [page]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeRef.current(); }
    if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); goToPage(Math.min(page + 1, totalPages - 1)); }
    if (e.key === 'ArrowLeft')  { e.stopImmediatePropagation(); goToPage(Math.max(page - 1, 0)); }
  }, [goToPage, page, totalPages]);

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
    padding: '32px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    animation: 'overlaySlideIn 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
    maxHeight: '85vh',
    overflow: 'hidden',
  };

  const pageListStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    padding: '8px 12px',
    animation: `${transitionDirection === 'forward' ? 'votePageInForward' : 'votePageInBackward'} 240ms ease`,
  };

  return (
    <>
      <style>{`
        @keyframes overlaySlideIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes votePageInForward {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes votePageInBackward {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ padding: '0 32px 20px', borderBottom: `1px solid ${colors.line.dark}` }}>
          <span style={{ ...typography.headline.medium, color: colors.text.primaryInverse, fontWeight: 600 }}>
            {data.title}
          </span>
        </div>

        {/* Contadores */}
        <div style={{ display: 'flex', gap: 32, padding: '20px 32px', borderBottom: `1px solid ${colors.line.dark}` }}>
          {(['sim', 'nao', 'abstencao'] as const).map(v => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: VOTE_COLORS[v], display: 'inline-block' }} />
              <span style={{ ...typography.body.medium, color: colors.text.primaryInverse }}>
                {VOTE_LABELS[v]} ({String(data[v]).padStart(2, '0')})
              </span>
            </div>
          ))}
        </div>

        {/* Lista de deputados */}
        <div key={pageTransitionKey} style={pageListStyle}>
          {pageDeputies.map((dep, i) => (
            <div key={dep.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '12px 20px',
              borderBottom: i < pageDeputies.length - 1 ? `1px solid ${colors.line.dark}` : 'none',
            }}>
              <img
                src={dep.photo}
                alt={dep.name}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).style.background = colors.background.primaryInverse; }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 500 }}>
                  {dep.name}
                </p>
                <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                  {dep.party}, {dep.state}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: VOTE_COLORS[dep.vote] }} />
                <span style={{ ...typography.body.medium, color: colors.text.primaryInverse }}>
                  {VOTE_LABELS[dep.vote]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 0' }}>
            <button onClick={() => goToPage(Math.max(page - 1, 0))}
              style={{ background: 'none', border: 'none', color: colors.text.secondaryInverse, fontSize: 20, cursor: 'pointer' }}>
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === page ? colors.text.primaryInverse : colors.text.disabledInverse,
              }} />
            ))}
            <button onClick={() => goToPage(Math.min(page + 1, totalPages - 1))}
              style={{ background: 'none', border: 'none', color: colors.text.secondaryInverse, fontSize: 20, cursor: 'pointer' }}>
              ›
            </button>
          </div>
        )}

        {/* Botão fechar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <button onClick={onClose} style={{
            padding: '14px 48px', borderRadius: 100, border: 'none',
            background: colors.background.primary, color: colors.text.primary,
            ...typography.body.large, fontWeight: 600, cursor: 'pointer',
          }}>
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
