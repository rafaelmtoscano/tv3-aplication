// src/pages/Camara/DeputyDetail.tsx
// Página de detalhe do deputado. Fullscreen overlay (igual ao DeputiesGrid).
// Abas: Agenda | Propostas legislativas | Biografia
// Navegação: ←→ trocam de aba, ↑↓ scrollam conteúdo (transform: translateY)
// Escape / Backspace → onBack()

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { Deputy, AgendaItem, LegislativeProposal } from '../../data/deputies';

// ─── Layout ───────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 88;
const HEADER_HEIGHT = 112;   // barra de abas
const CONTENT_PADDING_TOP = 48;
const SCROLL_STEP = 220;     // px por pressão de ↑↓

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DeputyDetailProps {
  deputy: Deputy;
  isActive: boolean;
  onBack: () => void;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type TabId = 'agenda' | 'proposals' | 'biography';

const TABS: { id: TabId; label: string }[] = [
  { id: 'agenda',    label: 'Agenda' },
  { id: 'proposals', label: 'Propostas legislativas' },
  { id: 'biography', label: 'Biografia' },
];

// ─── Helpers de estilo ────────────────────────────────────────────────────────

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    height: '56px',
    paddingLeft: '32px',
    paddingRight: '32px',
    borderRadius: '100px',
    border: 'none',
    cursor: 'pointer',
    background: active ? colors.background.primary : 'transparent',
    color: active ? colors.text.primary : colors.text.primaryInverse,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: 500,
    fontSize: '24px',
    lineHeight: '145%',
    transition: 'background 0.2s ease, color 0.2s ease',
    flexShrink: 0,
  };
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '32px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const labelStyle: React.CSSProperties = {
  ...typography.body.medium,
  color: colors.text.secondaryInverse,
};

const valueStyle: React.CSSProperties = {
  ...typography.body.medium,
  color: colors.text.primaryInverse,
};

// ─── Sub-componentes das abas ─────────────────────────────────────────────────

function AgendaTab({ items }: { items: AgendaItem[] }) {
  // Agrupa por data
  const groups: { date: string; entries: AgendaItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.date === item.date) {
      last.entries.push(item);
    } else {
      groups.push({ date: item.date, entries: [item] });
    }
  }

  if (items.length === 0) {
    return (
      <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse }}>
        Nenhum evento agendado.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {groups.map((group) => (
        <div key={group.date}>
          <p style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: '0 0 20px 0' }}>
            {group.date}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {group.entries.map((entry, i) => (
              <div key={i} style={{ ...cardStyle, flexDirection: 'row', alignItems: 'flex-start', gap: '24px', flex: '1 1 400px' }}>
                <span style={{ ...typography.headline.medium, color: colors.text.primaryInverse, flexShrink: 0, minWidth: '72px' }}>
                  {entry.time}
                </span>
                <div>
                  <p style={{ ...typography.body.large, color: colors.text.primaryInverse, margin: '0 0 4px 0', letterSpacing: 'normal' }}>
                    {entry.location}
                  </p>
                  <p style={{ ...typography.body.small, color: colors.text.secondaryInverse, margin: 0 }}>
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProposalsTab({ proposals }: { proposals: LegislativeProposal[] }) {
  if (proposals.length === 0) {
    return (
      <p style={{ ...typography.body.medium, color: colors.text.secondaryInverse }}>
        Nenhuma proposta legislativa encontrada.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {proposals.map((p) => (
        <div key={p.id} style={cardStyle}>
          <p style={{ ...typography.headline.small, color: colors.text.primaryInverse, margin: 0 }}>
            {p.id}
          </p>
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={labelStyle}>Autor:</span>
            <span style={valueStyle}>{p.author}</span>
          </div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <span style={{ ...labelStyle, flexShrink: 0 }}>Ementa</span>
            <span style={{ ...valueStyle, lineHeight: '1.6' }}>{p.summary}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BiographyTab({ deputy }: { deputy: Deputy }) {
  const { biography } = deputy;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ ...labelStyle, width: '160px', flexShrink: 0 }}>Nome</span>
          <span style={valueStyle}>{biography.fullName}</span>
        </div>
        {biography.birthDate && (
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={{ ...labelStyle, width: '160px', flexShrink: 0 }}>Nascimento</span>
            <span style={valueStyle}>{biography.birthDate}</span>
          </div>
        )}
        {biography.birthplace && (
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={{ ...labelStyle, width: '160px', flexShrink: 0 }}>Naturalidade</span>
            <span style={valueStyle}>{biography.birthplace}</span>
          </div>
        )}
        {biography.education && (
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={{ ...labelStyle, width: '160px', flexShrink: 0 }}>Escolaridade</span>
            <span style={valueStyle}>{biography.education}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DeputyDetail({ deputy, isActive, onBack }: DeputyDetailProps) {
  const [activeTab, setActiveTab]   = useState<TabId>('agenda');
  const [scrollY, setScrollY]       = useState(0);
  const contentHeightRef            = useRef(0);
  const contentRef                  = useRef<HTMLDivElement>(null);

  // Reset ao abrir novo deputado
  useEffect(() => {
    setActiveTab('agenda');
    setScrollY(0);
  }, [deputy.id]);

  // Reset scroll ao trocar de aba
  useEffect(() => {
    setScrollY(0);
  }, [activeTab]);

  // Calcula altura do conteúdo da aba para limitar scroll
  useEffect(() => {
    if (contentRef.current) {
      contentHeightRef.current = contentRef.current.scrollHeight;
    }
  });

  const maxScroll = useCallback(() => {
    const viewportH = window.innerHeight - HEADER_HEIGHT - CONTENT_PADDING_TOP;
    return Math.max(0, contentHeightRef.current - viewportH);
  }, []);

  // ─── Captura de teclado via window capture (evita conflito com outros listeners)
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();

      if (e.key === 'ArrowRight') {
        setActiveTab(prevTab => {
          const currentIndex = TABS.findIndex(t => t.id === prevTab);
          const nextIndex = Math.min(currentIndex + 1, TABS.length - 1);
          return TABS[nextIndex].id;
        });
      } else if (e.key === 'ArrowLeft') {
        setActiveTab(prevTab => {
          const currentIndex = TABS.findIndex(t => t.id === prevTab);
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (currentIndex === 0) { onBack(); return prevTab; }
          return TABS[prevIndex].id;
        });
      } else if (e.key === 'ArrowDown') {
        setScrollY(y => Math.min(y + SCROLL_STEP, maxScroll()));
      } else if (e.key === 'ArrowUp') {
        setScrollY(y => Math.max(y - SCROLL_STEP, 0));
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        onBack();
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [isActive, onBack, maxScroll]);

  // ─── Estilos ──────────────────────────────────────────────────────────────

  const rootStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: colors.background.baseInverse,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    height: HEADER_HEIGHT,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: SIDEBAR_WIDTH + 64,
    paddingRight: 64,
    gap: '48px',
    borderBottom: `1px solid ${colors.line.dark}`,
  };

  const backBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.text.primaryInverse,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: 500,
    fontSize: '24px',
    flexShrink: 0,
    padding: 0,
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'absolute',
    left: SIDEBAR_WIDTH + 64,
    top: CONTENT_PADDING_TOP,
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  };

  const photoStyle: React.CSSProperties = {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `4px solid ${colors.line.dark}`,
  };

  const contentAreaStyle: React.CSSProperties = {
    position: 'absolute',
    left: SIDEBAR_WIDTH + 64 + 200 + 64,
    right: 64,
    top: 0,
    // Scroll virtual
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    paddingTop: CONTENT_PADDING_TOP,
    paddingBottom: 120,
  };

  return (
    <div style={rootStyle}>

      {/* Barra de abas */}
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={onBack}>
          <span style={{ fontSize: '28px', lineHeight: 1 }}>←</span>
          Voltar
        </button>
        <div style={tabsStyle}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={tabBtnStyle(activeTab === tab.id)}
              onClick={() => {
                setActiveTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: foto à esquerda + conteúdo à direita */}
      <div style={bodyStyle}>

        {/* Coluna esquerda: foto + nome */}
        <div style={sidebarStyle}>
          <img
            src={deputy.photo}
            alt={deputy.name}
            style={photoStyle}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://www.camara.leg.br/internet/deputado/bandep/default.jpg';
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...typography.body.medium, color: colors.text.primaryInverse, margin: 0 }}>
              {deputy.displayName}
            </p>
            <p style={{ ...typography.label.small, color: colors.text.secondaryInverse, margin: '4px 0 0' }}>
              {deputy.party} · {deputy.state}
            </p>
          </div>
        </div>

        {/* Conteúdo da aba com scroll virtual */}
        <div ref={contentRef} style={contentAreaStyle}>
          {activeTab === 'agenda'    && <AgendaTab    items={deputy.agenda} />}
          {activeTab === 'proposals' && <ProposalsTab proposals={deputy.proposals} />}
          {activeTab === 'biography' && <BiographyTab deputy={deputy} />}
        </div>

      </div>
    </div>
  );
}
