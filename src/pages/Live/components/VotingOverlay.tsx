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
    phase,
    sessao,
    vote,
    dismiss,
    goToQuestion,
    goToDetails,
    goToIntro,
  } = voting;

  const [focusedBtn, setFocusedBtn] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset focus when phase changes
  useEffect(() => {
    setFocusedBtn(0);
  }, [phase]);

  // Keep focus in the overlay when it's active
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'loading' && phase !== 'error' && sessao) {
      containerRef.current?.focus();
    }
  }, [phase, sessao]);

  const getButtonCount = useCallback(() => {
    switch (phase) {
      case 'intro': return 3;
      case 'question': return 3;
      case 'details': return 1;
      case 'results': return 1;
      default: return 0;
    }
  }, [phase]);

  const dismissAction = useCallback(() => {
    dismiss();
    livePlayerRef.current?.focus();
  }, [dismiss, livePlayerRef]);

  const handleAction = useCallback(() => {
    switch (phase) {
      case 'intro':
        if (focusedBtn === 0) goToQuestion();
        else if (focusedBtn === 1) goToDetails();
        else dismissAction();
        break;
      case 'question':
        if (focusedBtn === 0) vote('sim');
        else if (focusedBtn === 1) vote('nao');
        else dismissAction();
        break;
      case 'details':
        if (focusedBtn === 0) goToIntro();
        break;
      case 'results':
        if (focusedBtn === 0) dismissAction();
        break;
    }
  }, [phase, focusedBtn, goToQuestion, goToDetails, dismissAction, vote, goToIntro]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const buttonCount = getButtonCount();
      if (buttonCount === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          setFocusedBtn((curr) => (curr + 1) % buttonCount);
          break;
        case 'ArrowUp':
          setFocusedBtn((curr) => (curr - 1 + buttonCount) % buttonCount);
          break;
        case 'Enter':
          handleAction();
          break;
        case 'Escape':
        case 'Backspace':
          dismissAction();
          break;
      }
    },
    [getButtonCount, handleAction, dismissAction]
  );

  if (phase === 'idle' || phase === 'loading' || phase === 'error' || !sessao) {
    return null;
  }

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
    outline: 'none',
  };

  const buttonStyle = (isFocused: boolean, type: 'primary' | 'ghost' = 'ghost'): React.CSSProperties => {
    let backgroundColor = 'transparent';
    let color = '#FFF';

    if (type === 'primary') {
      backgroundColor = '#FFF';
      color = '#11172B';
    }

    return {
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
      backgroundColor,
      color,
    };
  };

  const pautaItem = sessao.votacaoAtiva 
    ? sessao.pauta.find(p => p.titulo === sessao.votacaoAtiva?.id) || sessao.pauta[0]
    : sessao.pauta[0];

  return (
    <div
      ref={containerRef}
      style={overlayStyle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px', fontWeight: 500, color: '#FFF', margin: 0 }}>
          {phase === 'details' ? (pautaItem?.titulo || 'Detalhes') : 'Qual sua opinião sobre?'}
        </h3>
        {phase !== 'details' && (
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 400, color: 'rgba(255, 255, 255, 0.6)' }}>
            Pauta: {pautaItem?.titulo || 'PL 1/2025'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {phase === 'intro' && (
          <>
            <button style={buttonStyle(focusedBtn === 0, 'primary')}>Responder enquete</button>
            <button style={buttonStyle(focusedBtn === 1, 'ghost')}>Detalhes da seção</button>
            <button style={buttonStyle(focusedBtn === 2, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'question' && (
          <>
            <button style={buttonStyle(focusedBtn === 0, 'primary')}>Concordo</button>
            <button style={buttonStyle(focusedBtn === 1, 'ghost')}>Discordo</button>
            <button style={buttonStyle(focusedBtn === 2, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'details' && (
          <>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', fontWeight: 400, color: '#FFF', lineHeight: '1.5', marginBottom: '16px' }}>
               {pautaItem?.ementa || 'Nenhuma descrição disponível.'}
            </div>
            <button style={buttonStyle(focusedBtn === 0, 'primary')}>Voltar</button>
          </>
        )}

        {phase === 'results' && (
          <>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '24px', marginBottom: '16px' }}>
               <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)' }}>Consulta popular</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 500, color: '#FFF' }}>
                    <span>Concordo</span>
                    <span>80%</span>
                  </div>
                  <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '80%', background: '#10B981' }} />
                  </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plus Jakarta Sans', fontSize: '24px', fontWeight: 500, color: '#FFF' }}>
                    <span>Discordo</span>
                    <span>20%</span>
                  </div>
                  <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '20%', background: '#EF4444' }} />
                  </div>
               </div>
            </div>
            <button style={buttonStyle(focusedBtn === 0, 'primary')}>Fechar</button>
          </>
        )}
      </div>
    </div>
  );
}
