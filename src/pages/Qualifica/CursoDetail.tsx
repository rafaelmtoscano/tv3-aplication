import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import type { QualificaCurso } from '../../data/qualifica';

export interface CursoDetailProps {
  curso: QualificaCurso;
  isActive: boolean;
  onBack: () => void;
  onSendToMobile: (curso: QualificaCurso) => void;
}

// 0 = Inscrever pelo celular, 1 = Fechar (default — botão mais seguro p/ TV)
type FocusIndex = 0 | 1;

const EMPREGABILIDADE_LABEL: Record<NonNullable<QualificaCurso['empregabilidade']>, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

const EMPREGABILIDADE_ICON_COLOR: Record<NonNullable<QualificaCurso['empregabilidade']>, string> = {
  alta: '#00AF51',
  media: '#F2C744',
  baixa: '#F25C44',
};

function TrendingIcon({ tone, color }: { tone: NonNullable<QualificaCurso['empregabilidade']>; color: string }) {
  // alta: trending_up, media: trending_flat, baixa: trending_down
  if (tone === 'alta') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5.665 30L3.332 27.667L15.665 15.25L22.332 21.917L30.999 13.333H26.665V10H36.665V20H33.332V15.667L22.332 26.667L15.665 20L5.665 30Z" fill={color} />
      </svg>
    );
  }
  if (tone === 'baixa') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5.665 10L3.332 12.333L15.665 24.75L22.332 18.083L30.999 26.667H26.665V30H36.665V20H33.332V24.333L22.332 13.333L15.665 20L5.665 10Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M30 13.333L26.667 16.667H6.667V23.333H26.667L30 26.667L36.667 20L30 13.333Z" fill={color} />
    </svg>
  );
}

export default function CursoDetail({
  curso,
  isActive,
  onBack,
  onSendToMobile,
}: CursoDetailProps) {
  const [focusIndex, setFocusIndex] = useState<FocusIndex>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setFocusIndex(1);
      containerRef.current?.focus();
    }
  }, [isActive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const navKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Backspace'];
      if (navKeys.includes(e.key)) e.preventDefault();

      switch (e.key) {
        case 'ArrowUp':
          setFocusIndex(0);
          break;
        case 'ArrowDown':
          setFocusIndex(1);
          break;
        case 'Enter':
          if (focusIndex === 0) onSendToMobile(curso);
          else onBack();
          break;
        case 'Escape':
        case 'Backspace':
          onBack();
          break;
      }
    },
    [focusIndex, onBack, onSendToMobile, curso],
  );

  const empregabilidade = curso.empregabilidade ?? 'media';
  const empregabilidadeLabel = EMPREGABILIDADE_LABEL[empregabilidade];
  const empregabilidadeColor = EMPREGABILIDADE_ICON_COLOR[empregabilidade];
  const salario = curso.salarioMedio
    ? curso.salarioMedio.toLocaleString('pt-BR')
    : '—';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="curso-detail-overlay"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="curso-detail-modal"
        style={{ backgroundImage: `url(${curso.thumbnail})` }}
      >
        <div className="curso-detail-modal-tint" />

        <section className="curso-detail-card-top">
          <header className="curso-detail-header">
            <img
              className="curso-detail-logo"
              src={curso.logoInstituicao}
              alt={curso.instituicao}
            />
            <div className="curso-detail-heading">
              <h1 className="curso-detail-title">{curso.titulo}</h1>
              <span className="curso-detail-instituicao">
                {curso.instituicaoFull ?? curso.instituicao}
              </span>
            </div>
          </header>

          <div className="curso-detail-metrics">
            <div className="curso-detail-metric">
              <span className="curso-detail-metric-value">{salario}</span>
              <span className="curso-detail-metric-label">Salário médio</span>
            </div>
            <div className="curso-detail-metric">
              <div className="curso-detail-metric-row">
                <span className="curso-detail-metric-value">{empregabilidadeLabel}</span>
                <TrendingIcon tone={empregabilidade} color={empregabilidadeColor} />
              </div>
              <span className="curso-detail-metric-label">Empregabilidade</span>
            </div>
          </div>

          {(curso.cbo || curso.cboDescricao) && (
            <div className="curso-detail-cbo">
              {curso.cbo && <h2 className="curso-detail-cbo-title">{curso.cbo}</h2>}
              {curso.cboDescricao && (
                <p className="curso-detail-cbo-desc">{curso.cboDescricao}</p>
              )}
            </div>
          )}
        </section>

        <section className="curso-detail-card-bottom">
          <button
            className={`curso-detail-btn curso-detail-btn-ghost ${focusIndex === 0 ? 'is-focused' : ''}`}
            onClick={() => onSendToMobile(curso)}
          >
            Inscrever pelo celular
          </button>
          <button
            className={`curso-detail-btn curso-detail-btn-primary ${focusIndex === 1 ? 'is-focused' : ''}`}
            onClick={onBack}
          >
            Fechar
          </button>
        </section>
      </div>

      <style>{`
        .curso-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          z-index: 220;
        }
        .curso-detail-modal {
          position: relative;
          width: 960px;
          max-width: calc(100vw - 64px);
          max-height: calc(100vh - 64px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          border-radius: 24px;
          background-color: ${colors.background.baseInverse};
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: 0 4px 37.5px 45px rgba(0, 0, 0, 0.25);
        }
        .curso-detail-modal-tint {
          position: absolute;
          inset: 0;
          background: ${colors.background.baseInverse};
          opacity: 0.94;
          pointer-events: none;
          border-radius: 24px;
        }
        .curso-detail-card-top {
          position: relative;
          padding: 24px 32px 0;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .curso-detail-header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 0;
        }
        .curso-detail-logo {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #FFF;
          object-fit: cover;
          flex-shrink: 0;
        }
        .curso-detail-heading {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }
        .curso-detail-title {
          margin: 0;
          color: ${colors.text.primaryInverse};
          font-family: Roboto, 'Plus Jakarta Sans', sans-serif;
          font-size: 36px;
          font-weight: 400;
          line-height: 44px;
        }
        .curso-detail-instituicao {
          color: ${colors.text.secondaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 500;
          line-height: 145%;
          letter-spacing: 0.25px;
          text-transform: uppercase;
        }
        .curso-detail-metrics {
          display: flex;
          gap: 8px;
        }
        .curso-detail-metric {
          flex: 1;
          min-height: 120px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          border-radius: 16px;
          background: ${colors.background.primaryInverse};
        }
        .curso-detail-metric-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .curso-detail-metric-value {
          color: ${colors.text.primaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 120%;
        }
        .curso-detail-metric-label {
          color: ${colors.text.secondaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 500;
          line-height: 145%;
          letter-spacing: 0.25px;
        }
        .curso-detail-cbo {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-radius: 24px;
          background: ${colors.background.primaryInverse};
        }
        .curso-detail-cbo-title {
          margin: 0;
          color: ${colors.text.primaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 120%;
        }
        .curso-detail-cbo-desc {
          margin: 0;
          color: ${colors.text.secondaryInverse};
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 500;
          line-height: 145%;
          letter-spacing: 0.24px;
        }
        .curso-detail-card-bottom {
          position: relative;
          padding: 32px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .curso-detail-btn {
          width: 100%;
          height: 72px;
          padding: 0 24px;
          border: 4px solid transparent;
          border-radius: 100px;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 120%;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
        .curso-detail-btn-ghost {
          color: ${colors.text.primaryInverse};
        }
        .curso-detail-btn-ghost.is-focused {
          border-color: ${colors.background.brandPrimary};
        }
        .curso-detail-btn-primary {
          color: ${colors.text.primaryInverse};
        }
        .curso-detail-btn-primary.is-focused {
          background: #FFF;
          border-color: #FFF;
          color: ${colors.text.primary};
        }
      `}</style>
    </div>
  );
}
