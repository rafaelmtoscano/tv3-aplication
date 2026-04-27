import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { Poll } from '../../data/polls';
import { formatRelativeTime } from '../../utils/formatDateTime';

interface PollOverlayProps {
  poll: Poll;
  isAuthenticated: boolean;
  onClose: () => void;
  onBack?: () => void;
  onGovAuth: () => void;
}

// Steps for authenticated flow:
// 'cta'     — "Responder enquete" + "Detalhes da seção" + "Fechar"
// 'vote'    — "Concordo" / "Discordo" + "Fechar"
// 'results' — Bar chart with results + "Fechar"
// 'detail'  — Bill title + description + "Voltar"
type AuthStep = 'cta' | 'vote' | 'results' | 'detail';

export function PollOverlay({ poll, isAuthenticated, onClose, onBack, onGovAuth }: PollOverlayProps) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [authStep, setAuthStep] = useState<AuthStep>('cta');
  // Focus indices differ per step/mode
  // Unauthenticated: 0 = govAuth button, 1 = voltar
  // Auth 'cta': 0 = Responder enquete, 1 = Detalhes da seção, 2 = Fechar
  // Auth 'vote': 0..N-1 = options, N = Fechar
  // Auth 'results': 0 = Fechar
  // Auth 'detail': 0 = Voltar
  const [focusIndex, setFocusIndex] = useState(0);

  const getMaxFocus = () => {
    if (!isAuthenticated) return 1;
    switch (authStep) {
      case 'cta': return 2;
      case 'vote': return poll.options.length; // options + Fechar
      case 'results': return 0;
      case 'detail': return 0;
      default: return 0;
    }
  };

  // Reset focus when step changes
  useEffect(() => {
    setFocusIndex(0);
  }, [authStep, isAuthenticated]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const max = getMaxFocus();
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      if (isAuthenticated && authStep === 'detail') {
        setAuthStep('cta');
      } else {
        (onBack ?? closeRef.current)();
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.stopImmediatePropagation(); setFocusIndex(i => Math.min(i + 1, max)); }
    if (e.key === 'ArrowUp') { e.stopImmediatePropagation(); setFocusIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      if (!isAuthenticated) {
        if (focusIndex === 0) onGovAuth();
        else (onBack ?? closeRef.current)();
        return;
      }
      // Authenticated actions
      switch (authStep) {
        case 'cta':
          if (focusIndex === 0) setAuthStep('vote');
          else if (focusIndex === 1) setAuthStep('detail');
          else (onBack ?? closeRef.current)();
          break;
        case 'vote':
          if (focusIndex < poll.options.length) {
            setAuthStep('results');
          } else {
            (onBack ?? closeRef.current)();
          }
          break;
        case 'results':
          (onBack ?? closeRef.current)();
          break;
        case 'detail':
          setAuthStep('cta');
          break;
      }
    }
  }, [focusIndex, isAuthenticated, authStep, onGovAuth, onBack, poll.options]);

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

  const btnStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px',
    borderRadius: 100,
    border: focused ? '2px solid #FFF' : '2px solid transparent',
    background: focused ? colors.background.primary : 'transparent',
    color: focused ? colors.text.primary : colors.text.primaryInverse,
    ...typography.body.large,
    fontWeight: 600,
    cursor: 'pointer',
    transform: focused ? 'scale(1.02)' : 'scale(1)',
    boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
    transition: 'all 0.15s ease',
  });

  const closeBtnStyle = (focused: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 48px',
    borderRadius: 100,
    border: focused ? '2px solid #FFF' : '2px solid transparent',
    background: focused ? colors.background.primary : 'transparent',
    color: focused ? colors.text.primary : colors.text.primaryInverse,
    ...typography.body.large,
    fontWeight: 600,
    cursor: 'pointer',
    transform: focused ? 'scale(1.05)' : 'scale(1)',
    boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
    transition: 'all 0.15s ease',
  });

  // ── Unauthenticated: gov.br gate ──
  if (!isAuthenticated) {
    return (
      <div style={panelStyle}>
        <div>
          <p style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 600 }}>
            {poll.question}
          </p>
          <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: '8px 0 0' }}>
            Pauta: {poll.bill}
          </p>
          {poll.createdAt && (
            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
              Criada {formatRelativeTime(poll.createdAt)}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          padding: '20px 24px', background: colors.background.primaryInverse, borderRadius: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 24, color: colors.text.secondaryInverse, flexShrink: 0 }}>lock</span>
            <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
              Participe de enquetes, acesse serviços gov.br e personalize sua experiência
            </p>
          </div>
          <button style={btnStyle(focusIndex === 0)} onClick={onGovAuth}>
            Entrar com gov.br
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onBack ?? onClose} style={closeBtnStyle(focusIndex === 1)}>
            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_back</span>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ── Authenticated flows ──

  // Step: CTA — "Responder enquete" + "Detalhes da seção" + "Fechar"
  if (authStep === 'cta') {
    return (
      <div style={panelStyle}>
        <div>
          <p style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 600 }}>
            {poll.question}
          </p>
          <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: '8px 0 0' }}>
            Pauta: {poll.bill}
          </p>
          {poll.createdAt && (
            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
              Criada {formatRelativeTime(poll.createdAt)}
            </p>
          )}
        </div>

        <button style={btnStyle(focusIndex === 0)} onClick={() => setAuthStep('vote')}>
          Responder enquete
        </button>

        <button
          style={{
            ...typography.body.large,
            background: 'none',
            border: 'none',
            color: focusIndex === 1 ? colors.text.primaryInverse : colors.text.secondaryInverse,
            cursor: 'pointer',
            padding: '8px 0',
            textDecoration: focusIndex === 1 ? 'underline' : 'none',
            fontWeight: focusIndex === 1 ? 600 : 400,
            transition: 'all 0.15s ease',
          }}
          onClick={() => setAuthStep('detail')}
        >
          Detalhes da seção
        </button>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onBack ?? onClose} style={closeBtnStyle(focusIndex === 2)}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Step: Vote — options + "Fechar"
  if (authStep === 'vote') {
    return (
      <div style={panelStyle}>
        <div>
          <p style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 600 }}>
            {poll.question}
          </p>
          <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: '8px 0 0' }}>
            Pauta: {poll.bill}
          </p>
          {poll.createdAt && (
            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
              Criada {formatRelativeTime(poll.createdAt)}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {poll.options.map((opt, i) => (
            <button key={opt.id} style={btnStyle(focusIndex === i)} onClick={() => { setAuthStep('results'); }}>
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onBack ?? onClose} style={closeBtnStyle(focusIndex === poll.options.length)}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Step: Results — bar chart
  if (authStep === 'results') {
    // Mock results: Concordo 80%, Discordo 20%
    const results = poll.options.map((opt) => ({
      ...opt,
      percentage: opt.id === 'concordo' ? 80 : 20,
      barColor: opt.id === 'concordo' ? '#22c55e' : '#ef4444',
    }));

    return (
      <div style={panelStyle}>
        <div>
          <p style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0, fontWeight: 600 }}>
            {poll.question}
          </p>
          <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: '8px 0 0' }}>
            Pauta: {poll.bill}
          </p>
          {poll.createdAt && (
            <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
              Criada {formatRelativeTime(poll.createdAt)}
            </p>
          )}
        </div>

        <div style={{
          padding: '20px 24px', background: colors.background.primaryInverse, borderRadius: 16,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <span style={{ ...typography.label.small, color: colors.text.secondaryInverse }}>
            Consulta popular
          </span>
          {results.map((r) => (
            <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...typography.body.medium, color: colors.text.primaryInverse, fontWeight: 600 }}>
                  {r.label}
                </span>
                <span style={{ ...typography.body.medium, color: colors.text.secondaryInverse }}>
                  {r.percentage}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${r.percentage}%`, background: r.barColor,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={onBack ?? onClose} style={closeBtnStyle(focusIndex === 0)}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Step: Detail — bill info + "Voltar"
  if (authStep === 'detail') {
    return (
      <div style={panelStyle}>
        <h2 style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0, fontWeight: 700 }}>
          {poll.bill}
        </h2>

        <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: 0, lineHeight: '1.6' }}>
          {poll.billDescription ?? 'Sem descrição disponível.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setAuthStep('cta')} style={closeBtnStyle(focusIndex === 0)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
