import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { ContentCard } from '../../components/ContentCard/ContentCard';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { GridIcon } from '../../icons';
import { useDeputies } from '../../hooks/useDeputies';
import { channels } from '../../data/channels';

interface CamaraProps {
  isActive: boolean;
  onLiveChannel?: (channelId: string) => void;
  onDeputySelect?: (deputyId: string) => void;
  onViewAll?: () => void;
  onBack?: () => void;
}

// Total items in deputies rail: 1 "Ver todos" + 6 deputies = 7 (indices 0–6)
const DEPUTY_RAIL_TOTAL = 7;

export default function Camara({ isActive, onLiveChannel, onDeputySelect, onViewAll, onBack }: CamaraProps) {
  const { deputies, loading } = useDeputies(6);
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

  // Hero: 420px | Zone2: 460px (CircleButton focused 312px + label + overhead) | Content: 880px
  const scrollY = zone === 'hero' ? 0 : zone === 'deputies' ? 420 : 880;

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
        // At index 0: let bubble for sidebar
        break;

      case 'ArrowRight':
        if (zone === 'deputies' && deputyIndex < DEPUTY_RAIL_TOTAL - 1) {
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
          if (deputyIndex === 0) {
            onViewAll?.();
          } else {
            const dep = deputies[deputyIndex - 1]; // offset by 1 due to "Ver todos" at index 0
            if (dep) {
              setLoadingDeputy(dep.id);
              setTimeout(() => {
                onDeputySelect?.(dep.id);
                setLoadingDeputy(null);
              }, 600);
            }
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onBack?.();
        break;
    }
  };

  const isVerTodosFocused = zone === 'deputies' && deputyIndex === 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="camara-container"
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @keyframes camara-spin {
          to { transform: rotate(360deg); }
        }
        .camara-container {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #0D1B12;
          outline: none;
        }
        .camara-scroll-wrapper {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .camara-hero {
          position: relative;
          height: 420px;
          width: 100%;
          overflow: hidden;
        }
        .camara-hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }
        .camara-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,27,18,1) 100%);
        }
        .camara-hero-content {
          position: absolute;
          bottom: 40px;
          left: 136px;
          z-index: 2;
        }
        .camara-hero-title {
          color: #FFF;
          margin: 12px 0 0 0;
        }
        .camara-badges-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 0 0 0;
        }
        .camara-badge-l {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${colors.background.brandPrimary};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
        }
        .camara-badge-live {
          background: #E53935;
          border-radius: 6px;
          padding: 4px 12px;
          color: #FFF;
        }
        .camara-badge-hd {
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 4px 12px;
          color: #FFF;
        }
        .camara-hero-desc {
          color: rgba(255,255,255,0.75);
          margin: 12px 0 20px 0;
          max-width: 600px;
        }
        .camara-section-title {
          color: #FFF;
          padding-left: 136px;
          margin: 0 0 24px 0;
        }
        .camara-deputies-zone {
          height: 460px;
          padding-top: 32px;
        }
        .camara-deputies-rail {
          display: flex;
          flex-direction: row;
          padding-left: 136px;
          gap: 32px;
          overflow: visible;
          align-items: flex-end;
        }
        .camara-ver-todos-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
        }
        .camara-ver-todos-circle {
          border-radius: 1000px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .camara-ver-todos-label {
          height: 30px;
          text-align: center;
          margin: 0;
          color: #FFF;
        }
        .camara-content-zone {
          padding-top: 32px;
        }
        .camara-content-rail {
          display: flex;
          flex-direction: row;
          padding-left: 136px;
          gap: 24px;
          overflow: visible;
        }
        .camara-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camara-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid #FFF;
          border-radius: 50%;
          animation: camara-spin 0.8s linear infinite;
        }
        .camara-loading-text {
          padding-left: 136px;
          color: ${colors.text.secondaryInverse};
        }
      `}</style>

      <div
        className="camara-scroll-wrapper"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        {/* Zone 1 — Hero */}
        <div className="camara-hero">
          <div
            className="camara-hero-bg"
            style={{ backgroundImage: `url(${tvCamara.logoFull})` }}
          />
          <div className="camara-hero-gradient" />
          <div className="camara-hero-content">
            <img
              src={tvCamara.logo}
              alt="TV Câmara"
              style={{ height: '40px', objectFit: 'contain' }}
            />
            <h1
              className="camara-hero-title"
              style={{ ...typography.display.large }}
            >
              Plenária
            </h1>
            <div className="camara-badges-row">
              <span
                className="camara-badge-l"
                style={{ ...typography.label.small }}
              >L</span>
              <span
                className="camara-badge-live"
                style={{ ...typography.body.small }}
              >Ao vivo</span>
              <span
                className="camara-badge-hd"
                style={{ ...typography.body.small }}
              >HD</span>
            </div>
            <p
              className="camara-hero-desc"
              style={{ ...typography.body.large }}
            >
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
        <div className="camara-deputies-zone">
          <h2
            className="camara-section-title"
            style={{ ...typography.headline.large }}
          >Deputados</h2>
          {loading ? (
            <div
              className="camara-loading-text"
              style={{ ...typography.body.large }}
            >Carregando...</div>
          ) : (
            <div className="camara-deputies-rail">
              {/* "Ver todos" — custom circle matching CircleButton style */}
              <div
                className="camara-ver-todos-wrapper"
                onClick={() => onViewAll?.()}
              >
                <div
                  className="camara-ver-todos-circle"
                  style={{
                    width: isVerTodosFocused ? '312px' : '248px',
                    height: isVerTodosFocused ? '312px' : '248px',
                    background: isVerTodosFocused
                      ? colors.background.brandPrimary
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: isVerTodosFocused
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : 'none',
                  }}
                >
                  <GridIcon size={isVerTodosFocused ? 56 : 44} color="#FFF" />
                </div>
                <p
                  className="camara-ver-todos-label"
                  style={{ ...typography.body.large }}
                >Ver todos</p>
              </div>

              {/* Deputy CircleButtons (indices 1–6) */}
              {deputies.slice(0, 6).map((dep, i) => (
                <CircleButton
                  key={dep.id}
                  image={dep.photo}
                  label={dep.name}
                  isFocused={zone === 'deputies' && deputyIndex === i + 1}
                  onClick={() => {
                    setZone('deputies');
                    setDeputyIndex(i + 1);
                    setLoadingDeputy(dep.id);
                    setTimeout(() => {
                      onDeputySelect?.(dep.id);
                      setLoadingDeputy(null);
                    }, 600);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Zone 3 — Content rail */}
        <div className="camara-content-zone">
          <h2
            className="camara-section-title"
            style={{ ...typography.headline.large, marginBottom: '16px' }}
          >Em alta</h2>
          <div className="camara-content-rail">
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
        <div className="camara-loading-overlay">
          <div className="camara-spinner" />
        </div>
      )}
    </div>
  );
}
