import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import { channels } from '../../data/channels';
import { deputies } from '../../data/deputies';

interface CamaraProps {
  isActive: boolean;
  onLiveChannel?: (channelId: string) => void;
  onDeputySelect?: (deputyId: string) => void;
  onBack?: () => void;
}

export default function Camara({ isActive, onLiveChannel, onDeputySelect, onBack }: CamaraProps) {
  const [zone, setZone] = useState<'hero' | 'deputies' | 'content'>('hero');
  const [deputyIndex, setDeputyIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [loadingDeputy, setLoadingDeputy] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tvCamara = channels.find(ch => ch.id === 'tv-camara')!;
  const programs = tvCamara.programs || [];

  useEffect(() => {
    if (isActive) {
      containerRef.current?.focus();
    }
  }, [isActive]);

  const scrollY = zone === 'hero' ? 0 : zone === 'deputies' ? 420 : 680;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (zone === 'hero') {
          e.preventDefault();
          e.stopPropagation();
          setZone('deputies');
          setDeputyIndex(0);
        } else if (zone === 'deputies') {
          e.preventDefault();
          e.stopPropagation();
          setZone('content');
          setContentIndex(0);
        }
        break;

      case 'ArrowUp':
        if (zone === 'content') {
          e.preventDefault();
          e.stopPropagation();
          setZone('deputies');
        } else if (zone === 'deputies') {
          e.preventDefault();
          e.stopPropagation();
          setZone('hero');
        }
        // hero: don't stop propagation, let sidebar handle
        break;

      case 'ArrowLeft':
        if (zone === 'deputies' && deputyIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          setDeputyIndex(i => i - 1);
        } else if (zone === 'content' && contentIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          setContentIndex(i => i - 1);
        }
        // At index 0 or hero: let bubble for sidebar
        break;

      case 'ArrowRight':
        if (zone === 'deputies' && deputyIndex < deputies.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          setDeputyIndex(i => i + 1);
        } else if (zone === 'content' && contentIndex < programs.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          setContentIndex(i => i + 1);
        }
        break;

      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (zone === 'hero') {
          onLiveChannel?.('tv-camara');
        } else if (zone === 'deputies') {
          const dep = deputies[deputyIndex];
          setLoadingDeputy(dep.id);
          setTimeout(() => {
            onDeputySelect?.(dep.id);
            setLoadingDeputy(null);
          }, 600);
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onBack?.();
        break;
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: '#0D1B12',
    outline: 'none',
  };

  const wrapperStyle: React.CSSProperties = {
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const heroStyle: React.CSSProperties = {
    position: 'relative',
    height: '420px',
    width: '100%',
    overflow: 'hidden',
  };

  const heroBgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${tvCamara.logoFull})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const heroGradientStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,27,18,1) 100%)',
  };

  const heroContentStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '40px',
    left: '136px',
    zIndex: 2,
  };

  const badgesRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 0 0 0',
  };

  const lBadgeStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: colors.background.brandPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...typography.label.small,
    color: '#FFF',
  };

  const liveBadgeStyle: React.CSSProperties = {
    background: '#E53935',
    borderRadius: '6px',
    padding: '4px 12px',
    ...typography.body.small,
    color: '#FFF',
  };

  const hdBadgeStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '4px 12px',
    ...typography.body.small,
    color: '#FFF',
  };

  const sectionTitleStyle: React.CSSProperties = {
    ...typography.headline.large,
    color: '#FFF',
    paddingLeft: '136px',
    margin: '0 0 24px 0',
  };

  const deputiesRailStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '136px',
    gap: '32px',
    overflow: 'visible',
  };

  const contentRailStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '136px',
    gap: '24px',
    overflow: 'visible',
  };

  const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #FFF',
    borderRadius: '50%',
    animation: 'camara-spin 0.8s linear infinite',
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes camara-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={wrapperStyle}>
        {/* Zone 1 — Hero */}
        <div style={heroStyle}>
          <div style={heroBgStyle} />
          <div style={heroGradientStyle} />
          <div style={heroContentStyle}>
            <img
              src={tvCamara.logo}
              alt="TV Câmara"
              style={{ height: '40px', objectFit: 'contain' }}
            />
            <h1 style={{
              ...typography.display.large,
              color: '#FFF',
              margin: '12px 0 0 0',
            }}>
              Plenária
            </h1>
            <div style={badgesRowStyle}>
              <span style={lBadgeStyle}>L</span>
              <span style={liveBadgeStyle}>Ao vivo</span>
              <span style={hdBadgeStyle}>HD</span>
            </div>
            <p style={{
              ...typography.body.large,
              color: 'rgba(255,255,255,0.75)',
              margin: '12px 0 20px 0',
              maxWidth: '600px',
            }}>
              Acompanhe ao vivo as sessões do Plenário da Câmara dos Deputados.
            </p>
            <ActionButton
              label="Assistir agora"
              state={zone === 'hero' ? 'focus' : 'idle'}
              onClick={() => onLiveChannel?.('tv-camara')}
            />
          </div>
        </div>

        {/* Zone 2 — Deputies rail */}
        <div style={{ height: '260px', paddingTop: '32px' }}>
          <h2 style={sectionTitleStyle}>Deputados</h2>
          <div style={deputiesRailStyle}>
            {deputies.map((dep, i) => {
              const isFocused = zone === 'deputies' && deputyIndex === i;
              return (
                <div
                  key={dep.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
                    transform: isFocused ? 'scale(1.1)' : 'scale(1)',
                  }}
                  onClick={() => {
                    setZone('deputies');
                    setDeputyIndex(i);
                    setLoadingDeputy(dep.id);
                    setTimeout(() => {
                      onDeputySelect?.(dep.id);
                      setLoadingDeputy(null);
                    }, 600);
                  }}
                >
                  <img
                    src={dep.photo}
                    alt={dep.displayName}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isFocused
                        ? `4px solid ${colors.background.brandPrimary}`
                        : '4px solid transparent',
                      transition: 'border-color 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
                    }}
                  />
                  <span style={{
                    ...typography.body.medium,
                    color: '#FFF',
                    textAlign: 'center',
                    maxWidth: '140px',
                  }}>
                    {dep.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone 3 — Content rail */}
        <div style={{ paddingTop: '32px' }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: '16px' }}>Em alta</h2>
          <div style={contentRailStyle}>
            {programs.map((prog, i) => (
              <ContentCard
                key={prog.id}
                variant="image-text"
                image={prog.thumbnail}
                title={prog.title}
                label={prog.category}
                isFocused={zone === 'content' && contentIndex === i}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loadingDeputy && (
        <div style={loadingOverlayStyle}>
          <div style={spinnerStyle} />
        </div>
      )}
    </div>
  );
}
