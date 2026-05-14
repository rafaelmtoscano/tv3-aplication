import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { QualificaCurso } from '../../data/qualifica';

export interface CursoDetailProps {
  curso: QualificaCurso;
  isActive: boolean;
  onBack: () => void;
  onSendToMobile: (curso: QualificaCurso) => void;
}

// 0 = Voltar, 1 = Inscrever pelo celular
type FocusIndex = 0 | 1;

export default function CursoDetail({
  curso,
  isActive,
  onBack,
  onSendToMobile,
}: CursoDetailProps) {
  const [focusIndex, setFocusIndex] = useState<FocusIndex>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) containerRef.current?.focus();
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
          if (focusIndex === 0) onBack();
          else onSendToMobile(curso);
          break;
        case 'Escape':
        case 'Backspace':
          onBack();
          break;
      }
    },
    [focusIndex, onBack, onSendToMobile, curso],
  );

  const showMercado =
    typeof curso.vagasMercado === 'number' ||
    typeof curso.salarioMedio === 'number';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="curso-detail"
      onKeyDown={handleKeyDown}
    >
      <div className="curso-detail-content">
        <button
          className="curso-detail-back"
          style={{
            color: colors.text.primaryInverse,
            border:
              focusIndex === 0
                ? `4px solid ${colors.background.brandPrimary}`
                : '4px solid transparent',
          }}
          onClick={onBack}
        >
          <svg
            width="32"
            height="24"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 16L0 8L8 0L9.86667 1.93333L5.13333 6.66667H21.3333V9.33333H5.13333L9.86667 14.0667L8 16Z"
              fill="currentColor"
            />
          </svg>
          Voltar
        </button>

        <div className="curso-detail-grid">
          <img
            src={curso.thumbnail}
            alt=""
            className="curso-detail-thumb"
          />
          <div className="curso-detail-info">
            <span
              className="curso-detail-instituicao"
              style={{
                ...typography.body.large,
                color: colors.text.secondaryInverse,
              }}
            >
              {curso.instituicao}
            </span>
            <h1
              className="curso-detail-title"
              style={{
                ...typography.display.medium,
                color: colors.text.primaryInverse,
              }}
            >
              {curso.titulo}
            </h1>
            <span
              className="curso-detail-meta"
              style={{
                ...typography.headline.small,
                color: colors.text.primaryInverse,
              }}
            >
              {curso.modalidade} · {curso.cargaHoraria}h
            </span>
          </div>
        </div>

        <p
          className="curso-detail-desc"
          style={{
            ...typography.body.large,
            color: colors.text.primaryInverse,
          }}
        >
          {curso.descricao}
        </p>

        {showMercado && (
          <section className="curso-detail-mercado">
            <h2
              className="curso-detail-mercado-title"
              style={{
                ...typography.headline.medium,
                color: colors.text.primaryInverse,
              }}
            >
              Mercado de trabalho
            </h2>
            <ul className="curso-detail-mercado-list">
              {typeof curso.vagasMercado === 'number' && (
                <li
                  style={{
                    ...typography.body.large,
                    color: colors.text.primaryInverse,
                  }}
                >
                  {curso.vagasMercado.toLocaleString('pt-BR')} vagas abertas
                </li>
              )}
              {typeof curso.salarioMedio === 'number' && (
                <li
                  style={{
                    ...typography.body.large,
                    color: colors.text.primaryInverse,
                  }}
                >
                  Salário médio R$ {curso.salarioMedio.toLocaleString('pt-BR')}
                </li>
              )}
            </ul>
          </section>
        )}

        <button
          className="curso-detail-cta"
          style={{
            background: colors.background.brandPrimary,
            color: colors.text.primaryInverse,
            border:
              focusIndex === 1
                ? '4px solid #FFF'
                : '4px solid transparent',
          }}
          onClick={() => onSendToMobile(curso)}
        >
          Inscrever pelo celular
        </button>
      </div>

      <style>{`
        .curso-detail {
          position: fixed;
          inset: 0;
          background: ${colors.background.baseInverse};
          overflow-y: auto;
          outline: none;
          z-index: 200;
        }
        .curso-detail-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 88px 96px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .curso-detail-back {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 72px;
          padding: 0 32px;
          border-radius: 100px;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
        .curso-detail-grid {
          display: flex;
          flex-direction: row;
          gap: 48px;
          align-items: flex-start;
        }
        .curso-detail-thumb {
          width: 560px;
          height: 320px;
          object-fit: cover;
          border-radius: 16px;
          flex-shrink: 0;
        }
        .curso-detail-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 16px;
        }
        .curso-detail-instituicao {
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .curso-detail-title {
          margin: 0;
        }
        .curso-detail-desc {
          margin: 0;
          max-width: 880px;
        }
        .curso-detail-mercado {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 32px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .curso-detail-mercado-title {
          margin: 0;
        }
        .curso-detail-mercado-list {
          margin: 0;
          padding-left: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .curso-detail-cta {
          align-self: flex-start;
          height: 88px;
          padding: 0 48px;
          border-radius: 100px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
