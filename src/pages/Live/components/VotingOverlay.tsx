// src/pages/Live/components/VotingOverlay.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import type { UsePlenarioVotingReturn } from '../../../hooks/usePlenarioVoting';

interface VotingOverlayProps {
  voting: UsePlenarioVotingReturn;
  livePlayerRef: React.RefObject<HTMLDivElement>;
}

export function VotingOverlay({ voting, livePlayerRef }: VotingOverlayProps) {
  const {
    phase, sessao, vote, dismiss,
    goToQuestion, goToDetails, goToIntro,
    changeVote,
  } = voting;

  const [focusedBtn, setFocusedBtn] = useState(0);
  const isVisible = phase === 'intro' || phase === 'question' || phase === 'details' || phase === 'results' || phase === 'historico';

  // Reset focused button when phase changes
  useEffect(() => { setFocusedBtn(0); }, [phase]);

  const getButtonCount = useCallback(() => {
    if (phase === 'intro')    return 3;
    if (phase === 'question') return 3;
    if (phase === 'details')  return 2;
    if (phase === 'results')  return 2;
    return 0;
  }, [phase]);

  const dismissAction = useCallback(() => {
    dismiss();
    setTimeout(() => livePlayerRef.current?.focus(), 50);
  }, [dismiss, livePlayerRef]);

  const handleAction = useCallback(() => {
    if (phase === 'intro') {
      if (focusedBtn === 0) goToQuestion();
      else if (focusedBtn === 1) goToDetails();
      else dismissAction();
    } else if (phase === 'question') {
      if (focusedBtn === 0) vote('sim');
      else if (focusedBtn === 1) vote('nao');
      else dismissAction();
    } else if (phase === 'details') {
      if (focusedBtn === 0) goToIntro();
      else dismissAction();
    } else if (phase === 'results') {
      if (focusedBtn === 0) changeVote();
      else dismissAction();
    }
  }, [phase, focusedBtn, goToQuestion, goToDetails, goToIntro, vote, changeVote, dismissAction]);

  // Ref to avoid stale closure in native event listener
  const handleActionRef = useRef(handleAction);
  useEffect(() => { handleActionRef.current = handleAction; }, [handleAction]);

  // CRITICAL: window listener with capture:true intercepts events
  // BEFORE React/LivePlayer can process them. The LivePlayer's onBlur
  // re-focuses its container, making tabIndex-based focus unusable.
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();

      const buttonCount = getButtonCount();
      if (buttonCount === 0) return;

      if (e.key === 'ArrowDown') {
        setFocusedBtn(curr => (curr + 1) % buttonCount);
      } else if (e.key === 'ArrowUp') {
        setFocusedBtn(curr => (curr - 1 + buttonCount) % buttonCount);
      } else if (e.key === 'Enter') {
        handleActionRef.current();
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        dismiss();
        setTimeout(() => livePlayerRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isVisible, getButtonCount, dismiss, livePlayerRef]);

  if (!isVisible || !sessao) return null;

  const pautaItem = sessao.pauta[0];

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '48px',
    left: '48px',
    width: '420px',
    background: colors.background.baseInverse,
    borderRadius: '32px',
    padding: '48px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    zIndex: 1000,
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  };

  const btnStyle = (isFocused: boolean, type: 'primary' | 'ghost' = 'ghost'): React.CSSProperties => ({
    height: '72px',
    borderRadius: '100px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isFocused ? `4px solid ${colors.background.brandPrimary}` : '4px solid transparent',
    outline: 'none',
    transform: isFocused ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'pointer',
    ...typography.body.large,
    backgroundColor: type === 'primary' ? colors.background.primary : 'transparent',
    color: type === 'primary' ? colors.text.primary : colors.text.primaryInverse,
  });

  return (
    <div style={overlayStyle}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0 }}>
          {phase === 'details' ? (pautaItem?.titulo || 'Detalhes') : 'Qual sua opinião sobre?'}
        </h3>
        {phase !== 'details' && (
          <div style={{ ...typography.body.large, color: colors.text.muted }}>
            Pauta: {pautaItem?.titulo || sessao.votacaoAtiva?.descricao || 'Em andamento'}
          </div>
        )}
      </div>

      {/* Buttons per phase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {phase === 'intro' && (
          <>
            <button style={btnStyle(focusedBtn === 0, 'primary')}>Responder enquete</button>
            <button style={btnStyle(focusedBtn === 1, 'ghost')}>Detalhes da seção</button>
            <button style={btnStyle(focusedBtn === 2, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'question' && (
          <>
            <button style={btnStyle(focusedBtn === 0, 'primary')}>Concordo</button>
            <button style={btnStyle(focusedBtn === 1, 'ghost')}>Discordo</button>
            <button style={btnStyle(focusedBtn === 2, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'details' && (
          <>
            <div style={{ ...typography.headline.small, color: colors.text.primaryInverse, lineHeight: '1.5' }}>
              {pautaItem?.ementa || sessao.votacaoAtiva?.descricao || 'Nenhuma descrição disponível.'}
            </div>
            <button style={btnStyle(focusedBtn === 0, 'primary')}>Voltar</button>
            <button style={btnStyle(focusedBtn === 1, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'results' && (
          <>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: colors.surface.overlay, borderRadius: '24px' }}>
              <div style={{ ...typography.body.medium, color: colors.text.muted }}>Consulta popular</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', ...typography.body.large, color: colors.text.primaryInverse }}>
                  <span>Concordo</span><span>80%</span>
                </div>
                <div style={{ height: '12px', background: colors.surface.overlayMuted, borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '80%', background: colors.feedback.success }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', ...typography.body.large, color: colors.text.primaryInverse }}>
                  <span>Discordo</span><span>20%</span>
                </div>
                <div style={{ height: '12px', background: colors.surface.overlayMuted, borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '20%', background: colors.feedback.error }} />
                </div>
              </div>
            </div>
            <button style={btnStyle(focusedBtn === 0, 'ghost')}>Mudar meu voto</button>
            <button style={btnStyle(focusedBtn === 1, 'primary')}>Fechar</button>
          </>
        )}

      </div>

      <DebugPanel voting={voting} casa="câmara" />
    </div>
  );
}

// ─────────────────────────────────────────────
// DebugPanel — visível apenas com VITE_DEBUG_VOTING=true
// ─────────────────────────────────────────────

interface DebugPanelProps {
  voting: UsePlenarioVotingReturn;
  casa: 'câmara' | 'senado';
}

function DebugPanel({ voting, casa }: DebugPanelProps) {
  if (import.meta.env.VITE_DEBUG_VOTING !== 'true') return null;

  const { phase, sessao } = voting;
  const votacao = sessao?.votacaoAtiva;
  const placar = votacao?.placar;
  const isHistorico = phase === 'historico';

  const sessaoDesc = (sessao?.descricao ?? '—').slice(0, 40);
  const dataFmt = votacao?.dataHoraRegistro
    ? new Date(votacao.dataHoraRegistro).toLocaleString('pt-BR')
    : '—';

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: 'rgba(0,0,0,0.7)',
    color: colors.text.primaryInverse,
    padding: '8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    whiteSpace: 'pre',
    pointerEvents: 'none',
    zIndex: 1001,
  };

  const text =
    `[DEBUG VOTING]\n` +
    `Casa:        ${casa}\n` +
    `Phase:       ${phase}\n` +
    `Sessão:      ${sessaoDesc}\n` +
    `VotaçãoID:   ${votacao?.id ?? '—'}\n` +
    `isHistorico: ${isHistorico}\n` +
    `Placar:      sim=${placar?.sim ?? 0} nao=${placar?.nao ?? 0} abs=${placar?.abstencao ?? 0}\n` +
    `Data:        ${dataFmt}`;

  return <div style={panelStyle}>{text}</div>;
}
