// src/pages/Live/components/VotingOverlay.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../../../styles/colors';
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
  const isVisible = phase === 'intro' || phase === 'question' || phase === 'details' || phase === 'results';

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
    background: '#11172B',
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
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '24px',
    fontWeight: 500,
    backgroundColor: type === 'primary' ? '#FFF' : 'transparent',
    color: type === 'primary' ? '#11172B' : '#FFF',
  });

  return (
    <div style={overlayStyle}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px', fontWeight: 500, color: '#FFF', margin: 0 }}>
          {phase === 'details' ? (pautaItem?.titulo || 'Detalhes') : 'Qual sua opinião sobre?'}
        </h3>
        {phase !== 'details' && (
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
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
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', fontWeight: 400, color: '#FFF', lineHeight: '1.5' }}>
              {pautaItem?.ementa || sessao.votacaoAtiva?.descricao || 'Nenhuma descrição disponível.'}
            </div>
            <button style={btnStyle(focusedBtn === 0, 'primary')}>Voltar</button>
            <button style={btnStyle(focusedBtn === 1, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'results' && (
          <>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '24px' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Consulta popular</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 500, color: '#FFF' }}>
                  <span>Concordo</span><span>80%</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '80%', background: '#10B981' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 500, color: '#FFF' }}>
                  <span>Discordo</span><span>20%</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '20%', background: '#EF4444' }} />
                </div>
              </div>
            </div>
            <button style={btnStyle(focusedBtn === 0, 'ghost')}>Mudar meu voto</button>
            <button style={btnStyle(focusedBtn === 1, 'primary')}>Fechar</button>
          </>
        )}

      </div>
    </div>
  );
}
