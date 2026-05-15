import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../styles/colors';

export interface RegionSuggestionBannerProps {
  ufNome: string;
  isActive: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

// 0 = aceitar (Sim, definir), 1 = recusar (Agora não)
type FocusIndex = 0 | 1;

export default function RegionSuggestionBanner({
  ufNome,
  isActive,
  onAccept,
  onDismiss,
}: RegionSuggestionBannerProps) {
  const [focusIndex, setFocusIndex] = useState<FocusIndex>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setFocusIndex(0);
      containerRef.current?.focus();
    }
  }, [isActive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const navKeys = ['ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace'];
      if (navKeys.includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':
          setFocusIndex(0);
          break;
        case 'ArrowRight':
          setFocusIndex(1);
          break;
        case 'Enter':
          if (focusIndex === 0) onAccept();
          else onDismiss();
          break;
        case 'Escape':
        case 'Backspace':
          onDismiss();
          break;
      }
    },
    [focusIndex, onAccept, onDismiss],
  );

  // Quando o banner não está ativo (ex.: CursoDetail aberto sobreposto),
  // não renderiza para evitar conflito visual e devolver foco depois via useEffect.
  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="region-suggestion-banner"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label={`Detectamos que você está em ${ufNome}`}
    >
      <div className="region-suggestion-icon" aria-hidden="true">📍</div>
      <h3 className="region-suggestion-title">Detectamos que você está em {ufNome}</h3>
      <p className="region-suggestion-desc">
        Quer ver primeiro os cursos disponíveis no seu estado?
      </p>
      <div className="region-suggestion-actions">
        <button
          className={`region-suggestion-btn region-suggestion-btn-accept ${focusIndex === 0 ? 'is-focused' : ''}`}
          onClick={onAccept}
        >
          Sim, definir
        </button>
        <button
          className={`region-suggestion-btn region-suggestion-btn-dismiss ${focusIndex === 1 ? 'is-focused' : ''}`}
          onClick={onDismiss}
        >
          Agora não
        </button>
      </div>

      <style>{`
        .region-suggestion-banner {
          position: fixed;
          top: 32px;
          right: 88px;
          z-index: 210;
          width: 420px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 16px;
          background: rgba(17, 23, 43, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          outline: none;
        }
        .region-suggestion-icon {
          font-size: 28px;
        }
        .region-suggestion-title {
          margin: 0;
          color: ${colors.text.primaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 130%;
        }
        .region-suggestion-desc {
          margin: 0;
          color: ${colors.text.secondaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 400;
          line-height: 145%;
        }
        .region-suggestion-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .region-suggestion-btn {
          flex: 1;
          height: 56px;
          padding: 0 20px;
          border: 4px solid transparent;
          border-radius: 100px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
        .region-suggestion-btn-accept {
          background: ${colors.background.brandPrimary};
          color: ${colors.text.primaryInverse};
        }
        .region-suggestion-btn-accept.is-focused {
          border-color: #FFF;
        }
        .region-suggestion-btn-dismiss {
          background: transparent;
          color: ${colors.text.primaryInverse};
        }
        .region-suggestion-btn-dismiss.is-focused {
          border-color: ${colors.background.brandPrimary};
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
