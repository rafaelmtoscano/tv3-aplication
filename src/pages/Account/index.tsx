import { useEffect, useCallback, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

interface AccountPageProps {
  sessionCode: string;
  isConnected: boolean;
  isAuthenticated: boolean;
  onBack: () => void;
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

export default function AccountPage({ sessionCode, isConnected, isAuthenticated, onBack }: AccountPageProps) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.stopImmediatePropagation();
      onBackRef.current();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  const step2Status: 'done' | 'active' | 'pending' = isConnected ? 'done' : 'active';
  const step3Status: 'done' | 'active' | 'pending' = isAuthenticated ? 'done' : isConnected ? 'active' : 'pending';

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
        <p style={{ ...typography.body.large, color: colors.text.secondaryInverse, margin: 0 }}>
          Conecte seu celular e entre com gov.br para acessar todos os recursos
        </p>
      </div>

      <div style={{ display: 'flex', gap: 32, width: '100%', maxWidth: 1400 }}>
        <StepCard
          number={1}
          icon="📱"
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
          icon="📡"
          title="Conecte seu celular"
          description="Abra o app e digite o código exibido abaixo para sincronizar com esta TV."
          status={step2Status}
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          icon="🏛️"
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
        style={{
          padding: '18px 64px',
          borderRadius: 100,
          border: 'none',
          background: colors.background.primaryInverse,
          color: colors.text.primaryInverse,
          ...typography.body.large,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Voltar
      </button>
    </div>
  );
}
