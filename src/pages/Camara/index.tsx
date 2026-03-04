import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { GridIcon } from '../../icons';
import { useCamaraAPI } from '../../hooks/useCamaraAPI';
import { channels } from '../../data/channels';
import DeputyDetail from './DeputyDetail';
import DeputiesGrid from './DeputiesGrid';

interface CamaraProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  onLiveChannel?: (channelId: string) => void;
  onBack?: () => void;
}

function HlsVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);
  return (
    <video
      ref={videoRef}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}

type CamaraView = 'main' | 'deputy-detail' | 'deputies-grid';

export default function Camara({ isActive, isSidebarExpanded, onLiveChannel, onBack }: CamaraProps) {
  const { deputiesList: deputies, loading, selectDeputyData } = useCamaraAPI();
  const [view, setView] = useState<CamaraView>('main');
  const [selectedDeputyId, setSelectedDeputyId] = useState<string | null>(null);
  const [zone, setZone] = useState<'hero' | 'deputies' | 'content-0' | 'content-1'>('hero');
  const [deputyIndex, setDeputyIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [loadingDeputy, setLoadingDeputy] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tvCamara = channels.find(ch => ch.id === 'tv-camara')!;
  const programs = tvCamara.programs || [];

  // Total items in deputies rail: 1 "Ver todos" + all deputies
  const deputyRailTotal = deputies.length + 1;

  const plenariasItems: ContentRailItem[] = programs.slice(0, 5).map(prog => ({
    id: prog.id,
    variant: 'image-text' as const,
    image: prog.thumbnail,
    title: prog.title,
    label: prog.category,
  }));

  const emAltaItems: ContentRailItem[] = programs.slice(5, 10).map(prog => ({
    id: prog.id,
    variant: 'image-text' as const,
    image: prog.thumbnail,
    title: prog.title,
    label: prog.category,
  }));

  useEffect(() => {
    if (isActive && view === 'main') {
      containerRef.current?.focus();
    }
  }, [isActive, view]);

  // Hero: 420px | Zone2: 360px fixed | Content offset
  const scrollY =
    zone === 'hero' ? 0 :
    zone === 'deputies' ? 380 :
    zone === 'content-0' ? 760 :
    zone === 'content-1' ? 1160 : 0;

  const handleDeputySelect = async (dep: typeof deputies[0]) => {
    setLoadingDeputy(dep.id);
    try {
      const resolvedId = await selectDeputyData(dep);
      setSelectedDeputyId(resolvedId);
      setView('deputy-detail');
    } catch {
      setSelectedDeputyId(dep.id);
      setView('deputy-detail');
    } finally {
      setLoadingDeputy(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarExpanded) return;

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
          setZone('content-0');
          setContentIndex(0);
        } else if (zone === 'content-0') {
          e.preventDefault();
          e.stopPropagation();
          setZone('content-1');
          setContentIndex(0);
        }
        break;

      case 'ArrowUp':
        if (zone === 'content-1') {
          e.preventDefault();
          e.stopPropagation();
          setZone('content-0');
          setContentIndex(0);
        } else if (zone === 'content-0') {
          e.preventDefault();
          e.stopPropagation();
          setZone('deputies');
          setContentIndex(0);
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
        } else if ((zone === 'content-0' || zone === 'content-1') && contentIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          setContentIndex(i => i - 1);
        }
        // At index 0: let bubble for sidebar
        break;

      case 'ArrowRight':
        if (zone === 'deputies' && deputyIndex < deputyRailTotal - 1) {
          e.preventDefault();
          e.stopPropagation();
          setDeputyIndex(i => i + 1);
        } else if ((zone === 'content-0' || zone === 'content-1') && contentIndex < 5 - 1) {
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
            setView('deputies-grid');
          } else {
            const dep = deputies[deputyIndex - 1];
            if (dep) {
              handleDeputySelect(dep);
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

  // Sub-view rendering
  if (view === 'deputy-detail' && selectedDeputyId) {
    return <DeputyDetail deputyId={selectedDeputyId} onBack={() => setView('main')} />;
  }
  if (view === 'deputies-grid') {
    return (
      <DeputiesGrid
        deputies={deputies}
        onBack={() => setView('main')}
        onDeputySelect={(dep) => {
          setView('main');
          handleDeputySelect(dep);
        }}
      />
    );
  }

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
          overflow: hidden;
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
          overflow: hidden;
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
          padding-top: 48px;
          overflow: visible;
        }
        .camara-deputies-rail {
          display: flex;
          flex-direction: row;
          padding-left: 136px;
          padding-bottom: 48px;
          gap: 32px;
          overflow: visible;
          align-items: flex-end;
          height: 358px;
        }
        .camara-content-zone {
          padding-top: 0;
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
          <div className="camara-hero-bg">
            {tvCamara.streamUrl
              ? <HlsVideo src={tvCamara.streamUrl} />
              : <img src={tvCamara.logoFull} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
          </div>
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
              <CircleButton
                icon={<GridIcon size={isVerTodosFocused ? 56 : 44} />}
                label="Ver todos"
                isFocused={isVerTodosFocused}
                onClick={() => setView('deputies-grid')}
              />

              {deputies.map((dep, i) => (
                <div
                  key={dep.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0,
                    flexShrink: 0,
                  }}
                >
                  <CircleButton
                    image={dep.photo}
                    label={dep.name}
                    isFocused={zone === 'deputies' && deputyIndex === i + 1}
                    onClick={() => {
                      setZone('deputies');
                      setDeputyIndex(i + 1);
                      handleDeputySelect(dep);
                    }}
                  />
                  <span style={{
                    ...typography.body.small,
                    color: colors.text.secondaryInverse,
                    marginTop: '-8px',
                    textAlign: 'center',
                  }}>
                    {dep.party} · {dep.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone 3 — Plenárias */}
        <div className="camara-content-zone">
          <ContentRail
            title="Plenárias"
            variant="image-text"
            items={plenariasItems}
            focusedIndex={zone === 'content-0' ? contentIndex : -1}
            onFocusedIndexChange={(i) => setContentIndex(i)}
            onNavigateUp={() => { setZone('deputies'); setContentIndex(0); }}
            onNavigateDown={() => { setZone('content-1'); setContentIndex(0); }}
          />
        </div>

        {/* Zone 4 — Em alta */}
        <div className="camara-content-zone">
          <ContentRail
            title="Em alta"
            variant="image-text"
            items={emAltaItems}
            focusedIndex={zone === 'content-1' ? contentIndex : -1}
            onFocusedIndexChange={(i) => setContentIndex(i)}
            onNavigateUp={() => { setZone('content-0'); setContentIndex(0); }}
            onNavigateDown={() => {}}
          />
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
