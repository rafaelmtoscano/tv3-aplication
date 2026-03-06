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
    phase,
    sessao,
    userVote,
    vote,
    changeVote,
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
      case 'details': return 2;
      case 'results': return 2;
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
        else dismissAction();
        break;
      case 'results':
        if (focusedBtn === 0) dismissAction(); // Plan says Fechar is here
        else if (focusedBtn === 1) dismissAction(); // Fallback
        // Mudar meu voto would be index 0 if we follow plan strictly, but figma shows Fechar.
        // Let's follow the plan: result bars / Mudar meu voto (ghost) / Fechar (ghost)
        // Wait, if I follow the plan, index 0 is Mudar meu voto.
        if (focusedBtn === 0) changeVote();
        else dismissAction();
        break;
    }
  }, [phase, focusedBtn, goToQuestion, goToDetails, dismissAction, vote, goToIntro, changeVote]);

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
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '520px',
    background: 'rgba(10, 15, 30, 0.92)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: `1px solid ${colors.line.dark}`,
    padding: '40px 48px 36px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    zIndex: 1000,
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
    outline: 'none',
  };

  const buttonStyle = (isFocused: boolean, type: 'primary' | 'ghost' | 'success' | 'danger' = 'ghost'): React.CSSProperties => {
    let backgroundColor = 'rgba(255, 255, 255, 0.08)';
    let color = colors.text.primaryInverse;

    if (type === 'primary') {
      backgroundColor = colors.background.primary;
      color = colors.text.primary;
    } else if (type === 'success') {
      backgroundColor = '#22C55E';
    } else if (type === 'danger') {
      backgroundColor = '#EF4444';
    }

    return {
      height: '64px',
      borderRadius: '10px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      outline: isFocused ? '3px solid white' : 'none',
      transform: isFocused ? 'scale(1.03)' : 'scale(1)',
      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
      ...typography.body.large,
      letterSpacing: 'normal',
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ ...typography.headline.small, color: colors.text.primaryInverse, textAlign: 'center', margin: 0 }}>
          {phase === 'intro' && 'Qual sua opinião sobre?'}
          {phase === 'question' && 'Qual sua opinião sobre?'}
          {phase === 'details' && (pautaItem?.titulo || 'Detalhes da pauta')}
          {phase === 'results' && 'Qual sua opinião sobre?'}
        </h3>
        {sessao.votacaoAtiva && phase !== 'details' && (
          <div style={{ ...typography.body.small, color: colors.text.secondaryInverse, textAlign: 'center', marginTop: '8px' }}>
            Pauta: {pautaItem?.titulo || sessao.votacaoAtiva.id}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            <div style={{ ...typography.body.medium, color: colors.text.secondaryInverse, lineHeight: '1.6', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
               {pautaItem?.ementa || sessao.votacaoAtiva?.descricao || 'Nenhuma descrição disponível.'}
            </div>
            <button style={buttonStyle(focusedBtn === 0, 'primary')}>Voltar</button>
            <button style={buttonStyle(focusedBtn === 1, 'ghost')}>Fechar</button>
          </>
        )}

        {phase === 'results' && (
          <>
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}>
               <div style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>Consulta popular</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', ...typography.body.small, color: colors.text.primaryInverse }}>
                    <span>Concordo</span>
                    <span>80%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '80%', background: '#22C55E' }} />
                  </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', ...typography.body.small, color: colors.text.primaryInverse }}>
                    <span>Discordo</span>
                    <span>20%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '20%', background: '#EF4444' }} />
                  </div>
               </div>
            </div>
            <button style={buttonStyle(focusedBtn === 0, 'ghost')}>Mudar meu voto</button>
            <button style={buttonStyle(focusedBtn === 1, 'ghost')}>Fechar</button>
          </>
        )}
      </div>
    </div>
  );
}
