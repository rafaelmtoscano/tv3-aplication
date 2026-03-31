import { useEffect, useCallback, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

interface AccountPageProps {
  sessionCode: string;
  isConnected: boolean;
  isAuthenticated: boolean;
  onBack: () => void;
  onSimulateConnection?: () => void;
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'done';
  content?: React.ReactNode;
}

function StepCard({ number, title, description, icon, status, content }: StepCardProps) {
  const isDone = status === 'done';
  const isPending = status === 'pending';

  const cardStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: '48px 40px',
    background: isDone
      ? 'rgba(30, 167, 253, 0.06)'
      : colors.background.primaryInverse,
    border: `1px solid ${isDone ? 'rgba(30,167,253,0.3)' : colors.line.dark}`,
    borderRadius: 24,
    opacity: isPending ? 0.4 : 1,
    transition: 'opacity 0.3s ease',
  };

  const numberStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: isDone ? colors.background.brandPrimary : 'transparent',
    border: `2px solid ${isDone ? colors.background.brandPrimary : colors.line.dark}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...typography.body.large,
    color: isDone ? '#fff' : colors.text.secondaryInverse,
    fontWeight: 600,
    flexShrink: 0,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={numberStyle}>{isDone ? '✓' : number}</div>
        <span style={{ fontSize: 36 }}>{icon}</span>
        {isDone && (
          <span style={{
            marginLeft: 'auto',
            padding: '6px 20px',
            borderRadius: 100,
            background: 'rgba(30,167,253,0.15)',
            color: colors.background.brandPrimary,
            ...typography.body.small,
            fontWeight: 600,
          }}>
            Conectado ✓
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ ...typography.headline.medium, color: colors.text.primaryInverse, margin: 0 }}>
          {title}
        </h3>
        <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse, margin: 0 }}>
          {description}
        </p>
      </div>
      {content && <div>{content}</div>}
    </div>
  );
}

export default function AccountPage({ sessionCode, isConnected, isAuthenticated, onBack, onSimulateConnection }: AccountPageProps) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const [backFocused, setBackFocused] = useState(true);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.stopImmediatePropagation();
      onBackRef.current();
    }
    if (e.key === 'Enter' && backFocused) {
      e.stopImmediatePropagation();
      onBackRef.current();
    }
  }, [backFocused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  const step2Status: 'done' | 'active' | 'pending' = isConnected ? 'done' : 'active';
  const step3Status: 'done' | 'active' | 'pending' = isAuthenticated ? 'done' : isConnected ? 'active' : 'pending';
  const connectedStyle = `
    @keyframes connectedPulse {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: colors.background.baseInverse,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 56,
      padding: '80px 120px',
      zIndex: 150,
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ ...typography.display.medium, color: colors.text.primaryInverse, margin: 0 }}>
          Minha conta
        </h1>
        <style>{connectedStyle}</style>
        <p style={{ ...typography.body.large, color: colors.text.secondaryInverse, margin: 0 }}>
          Conecte seu celular e entre com gov.br para acessar todos os recursos
        </p>
      </div>

      <div style={{ display: 'flex', gap: 32, width: '100%', maxWidth: 1400 }}>
        <StepCard
          number={1}
          icon="App"
          title="Baixe o app"
          description="Disponível para Android e iOS. Escaneie o QR code para baixar a segunda tela."
          status="done"
          content={
            <div style={{
              width: 120, height: 120,
              background: '#fff',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...typography.body.small,
              color: colors.text.secondary,
            }}>
              QR Code
            </div>
          }
        />

        <StepCard
          number={2}
          icon="Celular"
          title="Conecte seu celular"
          description="Abra o app e digite o código exibido abaixo para sincronizar com esta TV."
          status={step2Status}
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isConnected && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'rgba(30,167,253,0.12)',
                  border: '1px solid rgba(30,167,253,0.3)',
                  animation: 'connectedPulse 0.4s ease',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1ea7fd', flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ ...typography.body.medium, color: '#1ea7fd', fontWeight: 600 }}>
                    Celular conectado com sucesso
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                {sessionCode.split('').map((digit, i) => (
                  <div key={i} style={{
                    width: 72, height: 88,
                    borderRadius: 14,
                    border: `2px solid ${isConnected ? colors.background.brandPrimary : 'rgba(255,255,255,0.25)'}`,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...typography.display.small,
                    color: isConnected ? colors.background.brandPrimary : colors.text.primaryInverse,
                    fontWeight: 700,
                  }}>
                    {digit}
                  </div>
                ))}
              </div>
              <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                {isConnected ? '✓ Celular conectado' : 'Aguardando conexão…'}
              </p>
            </div>
          }
        />

        <StepCard
          number={3}
          icon="gov.br"
          title="Entre com gov.br"
          description="Faça login pelo celular para participar de enquetes, petições e personalizar sua experiência."
          status={step3Status}
          content={
            isAuthenticated ? (
              <p style={{ ...typography.body.medium, color: colors.background.brandPrimary, margin: 0, fontWeight: 600 }}>
                ✓ Autenticado com gov.br
              </p>
            ) : (
              <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                {isConnected ? 'Faça login no app da segunda tela' : 'Disponível após conectar o celular'}
              </p>
            )
          }
        />
      </div>

      <button
        onClick={onBack}
        onFocus={() => setBackFocused(true)}
        onBlur={() => setBackFocused(false)}
        style={{
          padding: '18px 64px',
          borderRadius: 100,
          border: 'none',
          background: backFocused ? colors.background.primary : colors.background.primaryInverse,
          color: backFocused ? colors.text.primary : colors.text.primaryInverse,
          ...typography.body.large,
          fontWeight: 600,
          cursor: 'pointer',
          transform: backFocused ? 'scale(1.05)' : 'scale(1)',
          transition: 'background 0.2s ease, transform 0.2s ease, color 0.2s ease',
          boxShadow: backFocused ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        Voltar
      </button>

      {onSimulateConnection && (
        <button
          onClick={onSimulateConnection}
          style={{
            marginTop: 8,
            padding: '10px 32px',
            borderRadius: 100,
            border: '1px dashed rgba(255,255,255,0.2)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'inherit',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          [Demo] Simular conexão do celular
        </button>
      )}
    </div>
  );
}
