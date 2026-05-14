import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import {
  qualificaCategorias,
  filtrarCursos,
  totalCursos,
} from '../../data/qualifica';
import type { MainZone } from '../../hooks/useFocusNavigation';

// Layout constants — mesma fórmula da Home
const HERO_HEIGHT = 680;
const CHIPS_HEIGHT = 120;
const RAIL_HEIGHT = 408;
const SCROLL_OFFSET = 160;

// rail-0 = chips, rail-1..N = rails de cursos
const HERO_BG =
  'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F23a546d531574df3b5ed68a926341c55';
const QUALIFICA_LOGO =
  'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F7b4ca1dd20c549f2ab8adfb7e0300393';

export interface QualificaProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  categoriaAtiva: string;
  onCategoriaChange: (id: string) => void;
}

export default function Qualifica({
  mainZone,
  mainItemIndex,
  isActive,
  categoriaAtiva,
  onCategoriaChange,
}: QualificaProps) {
  const [scrollY, setScrollY] = useState(0);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // refs por rail-N (N>=1): cursoRefs.current[N] = array de cards
  const cursoRefs = useRef<Record<number, (HTMLDivElement | null)[]>>({});

  // Sincroniza chip ↔ filtro: navegar entre chips muda a categoria imediatamente
  useEffect(() => {
    if (mainZone === 'rail-0' && qualificaCategorias[mainItemIndex]) {
      onCategoriaChange(qualificaCategorias[mainItemIndex].id);
    }
  }, [mainZone, mainItemIndex, onCategoriaChange]);

  // Categorias renderizadas como rails (excluindo "todos" quando agrupando)
  const railCategorias = useMemo(
    () => qualificaCategorias.filter((c) => c.id !== 'todos'),
    [],
  );

  // Lista de rails a renderizar: no modo "todos", uma por categoria; senão, só a selecionada
  const rails = useMemo(() => {
    if (categoriaAtiva === 'todos') {
      return railCategorias.map((cat) => ({
        cat,
        cursos: filtrarCursos(cat.id),
      }));
    }
    const cat = qualificaCategorias.find((c) => c.id === categoriaAtiva);
    if (!cat) return [];
    return [{ cat, cursos: filtrarCursos(cat.id) }];
  }, [categoriaAtiva, railCategorias]);

  // Scroll virtual
  useEffect(() => {
    if (!isActive) return;
    let y = 0;
    if (mainZone === 'rail-0') {
      y = 0;
    } else {
      const m = mainZone.match(/^rail-(\d+)$/);
      if (m) {
        const railIdx = parseInt(m[1]);
        if (railIdx >= 1) {
          y = HERO_HEIGHT + CHIPS_HEIGHT + (railIdx - 1) * RAIL_HEIGHT - SCROLL_OFFSET;
        }
      }
    }
    setScrollY(y);
  }, [mainZone, isActive]);

  // ScrollIntoView do chip / curso focado
  useEffect(() => {
    if (mainZone === 'rail-0' && chipRefs.current[mainItemIndex]) {
      chipRefs.current[mainItemIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      return;
    }
    const m = mainZone.match(/^rail-(\d+)$/);
    if (m) {
      const railIdx = parseInt(m[1]);
      if (railIdx >= 1) {
        const arr = cursoRefs.current[railIdx];
        const el = arr && arr[mainItemIndex];
        el?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [mainZone, mainItemIndex]);

  return (
    <main className="qualifica-page">
      <div
        className="qualifica-scroll-track"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        {/* ── Hero ── */}
        <section
          className="qualifica-hero"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        >
          <div className="qualifica-hero-content">
            <img
              src={QUALIFICA_LOGO}
              alt="QualificaPro"
              className="qualifica-hero-logo"
            />
            <h1
              className="qualifica-hero-title"
              style={typography.display.large}
            >
              {totalCursos} Cursos gratuitos e remotos para você
            </h1>
            <span
              className="qualifica-hero-tagline"
              style={typography.body.large}
            >
              Trabalho e Emprego · Governo do Brasil
            </span>
          </div>
        </section>

        {/* ── Chips de filtro (rail-0) ── */}
        <nav className="qualifica-chips-rail">
          <div className="qualifica-chips-track">
            {qualificaCategorias.map((cat, i) => {
              const isActiveChip = categoriaAtiva === cat.id;
              const isFocusedChip =
                mainZone === 'rail-0' && mainItemIndex === i;
              return (
                <button
                  key={cat.id}
                  ref={(el) => {
                    chipRefs.current[i] = el;
                  }}
                  className="qualifica-chip"
                  style={{
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 28,
                    fontWeight: 500,
                    lineHeight: '120%',
                    color: isActiveChip
                      ? '#11172B'
                      : colors.text.primaryInverse,
                    background: isActiveChip ? '#FFF' : 'transparent',
                    border: isFocusedChip
                      ? `4px solid ${colors.background.brandPrimary}`
                      : isActiveChip
                      ? '4px solid #FFF'
                      : '4px solid transparent',
                  }}
                  onClick={() => onCategoriaChange(cat.id)}
                >
                  {cat.nome}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Rails de cursos (rail-1 .. rail-N) ── */}
        {rails.map((rail, idx) => {
          const railIdx = idx + 1; // rail-1, rail-2, ...
          // garante array para refs
          if (!cursoRefs.current[railIdx]) cursoRefs.current[railIdx] = [];
          return (
            <section key={rail.cat.id} className="qualifica-cursos-section">
              <h2
                className="qualifica-cursos-title"
                style={{
                  ...typography.display.small,
                  color: colors.text.primaryInverse,
                }}
              >
                {rail.cat.nome}
              </h2>
              <div className="qualifica-cursos-rail-outer">
                <div className="qualifica-cursos-rail">
                  {rail.cursos.map((curso, i) => {
                    const isFocused =
                      mainZone === `rail-${railIdx}` && mainItemIndex === i;
                    return (
                      <div
                        key={curso.id}
                        ref={(el) => {
                          if (!cursoRefs.current[railIdx]) {
                            cursoRefs.current[railIdx] = [];
                          }
                          cursoRefs.current[railIdx][i] = el;
                        }}
                        className="qualifica-curso-item"
                      >
                        <ContentCard
                          variant="image-text"
                          image={curso.thumbnail}
                          label={curso.instituicao}
                          title={curso.titulo}
                          timestamp={`${curso.modalidade} · ${curso.cargaHoraria}h`}
                          isFocused={isFocused}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        <div className="qualifica-bottom-spacer" />
      </div>

      <style>{`
        .qualifica-page {
          flex: 1;
          overflow: clip;
          position: relative;
          height: 100vh;
          background: ${colors.background.baseInverse};
        }
        .qualifica-scroll-track {
          position: absolute;
          inset: 0 0 auto 0;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .qualifica-hero {
          height: ${HERO_HEIGHT}px;
          width: 100%;
          background-color: ${colors.background.baseInverse};
          background-repeat: no-repeat;
          background-size: cover;
          background-position: right center;
          position: relative;
          display: flex;
          align-items: center;
        }
        .qualifica-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            ${colors.background.baseInverse} 0%,
            ${colors.background.baseInverse} 35%,
            rgba(17, 23, 43, 0.6) 55%,
            rgba(17, 23, 43, 0) 75%
          );
        }
        .qualifica-hero-content {
          position: relative;
          padding: 0 64px 0 152px;
          max-width: 60%;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .qualifica-hero-logo {
          height: 80px;
          width: auto;
          align-self: flex-start;
        }
        .qualifica-hero-title {
          margin: 0;
          color: ${colors.text.primaryInverse};
        }
        .qualifica-hero-tagline {
          color: ${colors.text.secondaryInverse};
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .qualifica-chips-rail {
          height: ${CHIPS_HEIGHT}px;
          display: flex;
          align-items: center;
        }
        .qualifica-chips-track {
          display: flex;
          flex-direction: row;
          gap: 24px;
          padding: 0 64px;
          overflow-x: auto;
          overflow-y: visible;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          width: 100%;
          box-sizing: border-box;
        }
        .qualifica-chips-track::-webkit-scrollbar { display: none; }
        .qualifica-chip {
          border-radius: 100px;
          padding: 0 24px;
          height: 72px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease-out;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .qualifica-cursos-section {
          padding-top: 32px;
        }
        .qualifica-cursos-title {
          padding-left: 64px;
          margin: 0 0 32px 0;
        }
        .qualifica-cursos-rail-outer {
          position: relative;
          width: 100%;
          height: ${RAIL_HEIGHT}px;
          overflow: visible;
        }
        .qualifica-cursos-rail {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: row;
          gap: 32px;
          padding: 0 64px;
          overflow-x: auto;
          overflow-y: visible;
          align-items: center;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          box-sizing: border-box;
        }
        .qualifica-cursos-rail::-webkit-scrollbar { display: none; }
        .qualifica-curso-item {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .qualifica-bottom-spacer {
          height: ${RAIL_HEIGHT}px;
        }
      `}</style>
    </main>
  );
}
