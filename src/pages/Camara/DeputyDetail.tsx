import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { getDeputyById, formatMandate } from '../../data/deputies';
import type { Deputy } from '../../data/deputies';

interface DeputyDetailProps {
  deputyId: string;
  onBack: () => void;
}

const TABS = ['Discursos', 'Agenda', 'Propostas legislativas', 'Votação', 'Biografia', 'Contato'] as const;

export default function DeputyDetail({ deputyId, onBack }: DeputyDetailProps) {
  const [activeSection, setActiveSection] = useState<'back' | 'tabs'>('tabs');
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const deputy = getDeputyById(deputyId);

  useEffect(() => {
    containerRef.current?.focus();
  }, [deputyId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (activeSection === 'tabs' && activeTab > 0) {
          setActiveTab(t => t - 1);
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (activeSection === 'tabs' && activeTab < TABS.length - 1) {
          setActiveTab(t => t + 1);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (activeSection === 'tabs') {
          setActiveSection('back');
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (activeSection === 'back') {
          setActiveSection('tabs');
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (activeSection === 'back') {
          onBack();
        }
        break;

      case 'Escape':
        e.preventDefault();
        onBack();
        break;
    }
  };

  if (!deputy) {
    return (
      <ErrorScreen onBack={onBack} />
    );
  }

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: colors.background.baseInverse,
    overflow: 'hidden',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    height: '72px',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '48px',
    gap: '24px',
    flexShrink: 0,
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    ...typography.body.medium,
    color: isActive ? '#FFF' : colors.text.secondaryInverse,
    borderBottom: isActive ? `3px solid ${colors.background.brandPrimary}` : '3px solid transparent',
    paddingBottom: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    background: 'none',
    border: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: '3px',
    borderBottomColor: isActive ? colors.background.brandPrimary : 'transparent',
    transition: 'color 0.2s, border-color 0.2s',
  });

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div style={headerStyle}>
        <ActionButton
          variant="text"
          label="← Voltar"
          state={activeSection === 'back' ? 'focus' : 'idle'}
          onClick={onBack}
        />
        <div style={{ display: 'flex', gap: '32px', marginLeft: '24px' }}>
          {TABS.map((tab, i) => (
            <span
              key={tab}
              style={tabStyle(activeTab === i)}
              onClick={() => { setActiveSection('tabs'); setActiveTab(i); }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel */}
        <div style={{
          width: '300px',
          flexShrink: 0,
          paddingLeft: '48px',
          paddingTop: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}>
          <img
            src={deputy.photo}
            alt={deputy.displayName}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <h2 style={{
            ...typography.body.large,
            color: '#FFF',
            marginTop: '24px',
            margin: '24px 0 0 0',
          }}>
            {deputy.displayName}
          </h2>
          <span style={{
            ...typography.body.medium,
            color: colors.text.secondaryInverse,
            marginTop: '4px',
          }}>
            {deputy.party} · {deputy.state}
          </span>
        </div>

        {/* Right panel — tab content */}
        <div style={{
          flex: 1,
          paddingLeft: '48px',
          paddingTop: '48px',
          paddingRight: '64px',
          overflow: 'auto',
        }}>
          {activeTab === 0 && <DiscursosTab deputy={deputy} />}
          {activeTab === 1 && <AgendaTab deputy={deputy} />}
          {activeTab === 2 && <PropostasTab deputy={deputy} />}
          {activeTab === 3 && <VotacaoTab />}
          {activeTab === 4 && <BiografiaTab deputy={deputy} />}
          {activeTab === 5 && <ContatoTab deputy={deputy} />}
        </div>
      </div>
    </div>
  );
}

/* ── Error Screen ── */

function ErrorScreen({ onBack }: { onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.background.baseInverse,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        outline: 'none',
      }}
    >
      <p style={{ ...typography.headline.large, color: colors.text.primaryInverse, margin: 0 }}>
        Falha ao carregar informações
      </p>
      <ActionButton
        label="Voltar"
        state="focus"
        onClick={onBack}
      />
    </div>
  );
}

/* ── Tab Components ── */

function DiscursosTab({ deputy }: { deputy: Deputy }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    }}>
      {deputy.speeches.map((speech, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: '#000',
            position: 'relative',
          }}>
            <img
              src={`https://img.youtube.com/vi/${extractYouTubeId(speech.videoUrl)}/hqdefault.jpg`}
              alt={speech.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {speech.duration && (
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                borderRadius: '4px',
                padding: '2px 6px',
                ...typography.label.small,
                color: '#FFF',
              }}>
                {speech.duration}
              </span>
            )}
          </div>
          <div style={{ padding: '16px' }}>
            <p style={{
              ...typography.body.small,
              color: '#FFF',
              margin: 0,
            }}>
              {speech.title}
            </p>
            <p style={{
              ...typography.label.small,
              color: colors.text.secondaryInverse,
              margin: '8px 0 0 0',
            }}>
              {speech.date} · {speech.context}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgendaTab({ deputy }: { deputy: Deputy }) {
  // Group by date
  const grouped = deputy.agenda.reduce<Record<string, typeof deputy.agenda>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} style={{ marginBottom: '32px' }}>
          <h3 style={{
            ...typography.body.large,
            color: '#FFF',
            margin: '0 0 16px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '8px',
          }}>
            {date}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '20px 24px',
                minWidth: '280px',
                flex: '1 1 auto',
                maxWidth: '480px',
              }}>
                <span style={{
                  ...typography.headline.small,
                  color: colors.background.brandPrimary,
                }}>
                  {item.time}
                </span>
                <p style={{
                  ...typography.body.medium,
                  color: '#FFF',
                  margin: '4px 0 0 0',
                }}>
                  {item.location}
                </p>
                <p style={{
                  ...typography.body.medium,
                  color: colors.text.secondaryInverse,
                  margin: '4px 0 0 0',
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PropostasTab({ deputy }: { deputy: Deputy }) {
  const statusColor: Record<string, string> = {
    'Em tramitação': '#1ea7fd',
    'Sancionada': '#2E7D32',
    'Aprovada': '#F9A825',
    'Arquivada': 'rgba(255,255,255,0.3)',
  };

  return (
    <div>
      {deputy.proposals.map((prop, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ ...typography.headline.small, color: '#FFF' }}>
              {prop.id}
            </span>
            <span style={{
              ...typography.label.small,
              color: '#FFF',
              background: statusColor[prop.status] || 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '4px 10px',
            }}>
              {prop.status}
            </span>
          </div>
          <p style={{
            ...typography.body.small,
            color: colors.text.secondaryInverse,
            margin: '4px 0 0 0',
          }}>
            Autor: {prop.author}
          </p>
          <p style={{
            ...typography.body.medium,
            color: colors.text.secondaryInverse,
            margin: '8px 0 0 0',
          }}>
            {prop.summary}
          </p>
        </div>
      ))}
    </div>
  );
}

function VotacaoTab() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
    }}>
      <p style={{
        ...typography.headline.large,
        color: colors.text.secondaryInverse,
      }}>
        Em breve
      </p>
    </div>
  );
}

function BiografiaTab({ deputy }: { deputy: Deputy }) {
  const bio = deputy.biography;
  const fields = [
    { label: 'Nome', value: bio.fullName },
    { label: 'Nascimento', value: bio.birthDate },
    { label: 'Nome Civil', value: bio.birthplace },
    { label: 'Profissões', value: bio.professions.join('; ') },
    { label: 'Filiação', value: bio.parentage },
    { label: 'Escolaridade', value: bio.education },
  ];

  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '24px 32px',
      }}>
        {fields.map((f, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 0',
            borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{
              ...typography.body.medium,
              color: colors.text.secondaryInverse,
              width: '200px',
              flexShrink: 0,
            }}>
              {f.label}
            </span>
            <span style={{
              ...typography.body.medium,
              color: '#FFF',
            }}>
              {f.value}
            </span>
          </div>
        ))}
      </div>

      <h3 style={{
        ...typography.body.large,
        color: '#FFF',
        margin: '32px 0 16px 0',
      }}>
        Mandatos (na Câmara dos Deputados
      </h3>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '20px 32px',
      }}>
        {bio.mandates.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '16px',
            padding: '10px 0',
            borderBottom: i < bio.mandates.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{
              ...typography.body.medium,
              color: colors.text.secondaryInverse,
              width: '200px',
              flexShrink: 0,
            }}>
              {m.role}
            </span>
            <span style={{
              ...typography.body.medium,
              color: '#FFF',
            }}>
              {formatMandate(m)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContatoTab({ deputy }: { deputy: Deputy }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
    }}>
      <p style={{
        ...typography.headline.large,
        color: colors.text.secondaryInverse,
      }}>
        Em breve
      </p>
    </div>
  );
}

/* ── Utility ── */

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|\/)([\w-]{11})/);
  return match ? match[1] : '';
}
