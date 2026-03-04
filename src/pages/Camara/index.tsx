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

// ─── Layout constants — mesmas da Home ───────────────────────────────────────
const HERO_HEIGHT = 420;
const DEPUTIES_HEIGHT = 438; // 48px padding-top + 312px circle + 30px label + 48px padding-bottom
const RAIL_HEIGHT = 408;     // igual Home — ContentRail ocupa isso no scroll virtual
const SCROLL_OFFSET = 160;   // igual Home

// scrollY por zona
// hero     → 0
// deputies → HERO_HEIGHT - SCROLL_OFFSET
// content-0 → HERO_HEIGHT + DEPUTIES_HEIGHT - SCROLL_OFFSET
// content-1 → HERO_HEIGHT + DEPUTIES_HEIGHT + RAIL_HEIGHT - SCROLL_OFFSET
const SCROLL_BY_ZONE = {
  'hero':      0,
  'deputies':  HERO_HEIGHT - SCROLL_OFFSET,
  'content-0': HERO_HEIGHT + DEPUTIES_HEIGHT - SCROLL_OFFSET,
  'content-1': HERO_HEIGHT + DEPUTIES_HEIGHT + RAIL_HEIGHT - SCROLL_OFFSET,
};

// ─── HlsVideo ─────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface CamaraProps {
  isActive: boolean;
  isSidebarExpanded?: boolean;
  onLiveChannel?: (channelId: string) => void;
  onBack?: () => void;
}

type CamaraView = 'main' | 'deputy-detail' | 'deputies-grid';
type CamaraZone = 'hero' | 'deputies' | 'content-0' | 'content-1';

// ─── Component ────────────────────────────────────────────────────────────────
export default function Camara({ isActive, isSidebarExpanded, onLiveChannel, onBack }: CamaraProps) {
  const { deputiesList: deputies, loading, selectDeputyData } = useCamaraAPI();
  const [view, setView] = useState<CamaraView>('main');
  const [selectedDeputyId, setSelectedDeputyId] = useState<string | null>(null);
  const [zone, setZone] = useState<CamaraZone>('hero');
  const [deputyIndex, setDeputyIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [loadingDeputy, setLoadingDeputy] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tvCamara = channels.find(ch => ch.id === 'tv-camara')!;
  const programs = tvCamara.programs || [];

  const deputyRailTotal = deputies.length + 1; // +1 for "Ver todos"

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

  const scrollY = SCROLL_BY_ZONE[zone] ?? 0;

  // ─── Deputy selection ────────────────────────────────────────────────────
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

  // ─── Keyboard ────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarExpanded) return;

    switch (e.key) {
      case 'ArrowDown':
        if (zone === 'hero') {
          e.preventDefault(); e.stopPropagation();
          setZone('deputies'); setDeputyIndex(0);
        } else if (zone === 'deputies') {
          e.preventDefault(); e.stopPropagation();
          setZone('content-0'); setContentIndex(0);
        } else if (zone === 'content-0') {
          e.preventDefault(); e.stopPropagation();
          setZone('content-1'); setContentIndex(0);
        }
        break;

      case 'ArrowUp':
        if (zone === 'content-1') {
          e.preventDefault(); e.stopPropagation();
          setZone('content-0'); setContentIndex(0);
        } else if (zone === 'content-0') {
          e.preventDefault(); e.stopPropagation();
          setZone('deputies'); setContentIndex(0);
        } else if (zone === 'deputies') {
          e.preventDefault(); e.stopPropagation();
          setZone('hero');
        }
        // hero: não bloqueia — deixa propagar para sidebar
        break;

      case 'ArrowLeft':
        if (zone === 'deputies' && deputyIndex > 0) {
          e.preventDefault(); e.stopPropagation();
          setDeputyIndex(i => i - 1);
        } else if ((zone === 'content-0' || zone === 'content-1') && contentIndex > 0) {
          e.preventDefault(); e.stopPropagation();
          setContentIndex(i => i - 1);
        }
        // index 0: propaga para sidebar
        break;

      case 'ArrowRight':
        if (zone === 'deputies' && deputyIndex < deputyRailTotal - 1) {
          e.preventDefault(); e.stopPropagation();
          setDeputyIndex(i => i + 1);
        } else if ((zone === 'content-0' || zone === 'content-1') && contentIndex < 4) {
          e.preventDefault(); e.stopPropagation();
          setContentIndex(i => i + 1);
        }
        break;

      case 'Enter':
        e.preventDefault(); e.stopPropagation();
        if (zone === 'hero') {
          onLiveChannel?.('tv-camara');
        } else if (zone === 'deputies') {
          if (deputyIndex === 0) {
            setView('deputies-grid');
          } else {
            const dep = deputies[deputyIndex - 1];
            if (dep) handleDeputySelect(dep);
          }
        }
        break;

      case 'Escape':
        e.preventDefault(); e.stopPropagation();
        onBack?.();
        break;
    }
  };

  // ─── Sub-views ───────────────────────────────────────────────────────────
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

  // ─── Styles ───────────────────────────────────────────────────────────────
  const isVerTodosFocused = zone === 'deputies' && deputyIndex === 0;

  const pageStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    background: '#0D1B12',
    outline: 'none',
  };

  const scrollTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const heroStyle: React.CSSProperties = {
    position: 'relative',
    height: `${HERO_HEIGHT}px`,
    width: '100%',
    overflow: 'hidden',
  };

  const heroBgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  };

  const heroGradientStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,27,18,1) 100%)',
  };

  const heroContentStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 40,
    left: 136,
    zIndex: 2,
  };

  // Deputies zone: sem height fixo, deixa o conteúdo determinar
  const deputiesZoneStyle: React.CSSProperties = {
    paddingTop: 48,
    paddingLeft: 0, // ContentRail usa 64px, aqui controlamos manualmente
    overflow: 'visible',
  };

  const deputiesTitleStyle: React.CSSProperties = {
    ...typography.display.small,
    color: colors.text.primaryInverse,
    paddingLeft: 64,
    margin: '0 0 48px 0',
  };

  // Rail de deputados: altura fixada pelo maior item (focado = 312px) + label + partido
  const deputiesRailStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 64,
    paddingBottom: 48,
    gap: 32,
    overflow: 'visible',
    alignItems: 'flex-end',
    height: 370, // 312px círculo + 30px label + 28px partido
  };

  const deputySubtitleStyle: React.CSSProperties = {
    ...typography.body.small,
    color: colors.text.secondaryInverse,
    marginTop: 4,
    textAlign: 'center',
    display: 'block',
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={pageStyle}
      onKeyDown={handleKeyDown}
    >
      <div style={scrollTrackStyle}>

        {/* Zone 1 — Hero */}
        <div style={heroStyle}>
          <div style={heroBgStyle}>
            {tvCamara.streamUrl
              ? <HlsVideo src={tvCamara.streamUrl} />
              : <img src={tvCamara.logoFull} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
          </div>
          <div style={heroGradientStyle} />
          <div style={heroContentStyle}>
            <img
              src={tvCamara.logo}
              alt="TV Câmara"
              style={{ height: 40, objectFit: 'contain' }}
            />
            <h1 style={{ ...typography.display.large, color: '#FFF', margin: '12px 0 0 0' }}>
              Plenária
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 0 0' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: colors.background.brandPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', ...typography.label.small,
              }}>L</span>
              <span style={{
                background: '#E53935', borderRadius: 6,
                padding: '4px 12px', color: '#FFF', ...typography.body.small,
              }}>Ao vivo</span>
              <span style={{
                background: 'rgba(255,255,255,0.2)', borderRadius: 6,
                padding: '4px 12px', color: '#FFF', ...typography.body.small,
              }}>HD</span>
            </div>
            <p style={{
              ...typography.body.large,
              color: 'rgba(255,255,255,0.75)',
              margin: '12px 0 20px 0',
              maxWidth: 600,
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
        <div style={deputiesZoneStyle}>
          <h2 style={deputiesTitleStyle}>Deputados</h2>
          {loading ? (
            <p style={{
              ...typography.body.large,
              color: colors.text.secondaryInverse,
              paddingLeft: 64,
            }}>
              Carregando...
            </p>
          ) : (
            <div style={deputiesRailStyle}>
              {/* Ver todos */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <CircleButton
                  icon={<GridIcon size={isVerTodosFocused ? 56 : 44} />}
                  label="Ver todos"
                  isFocused={isVerTodosFocused}
                  onClick={() => setView('deputies-grid')}
                />
              </div>

              {/* Deputies */}
              {deputies.map((dep, i) => (
                <div
                  key={dep.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
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
                  <span style={deputySubtitleStyle}>
                    {dep.party} · {dep.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone 3 — Plenárias rail */}
        <ContentRail
          title="Plenárias"
          variant="image-text"
          items={plenariasItems}
          focusedIndex={zone === 'content-0' ? contentIndex : -1}
          onFocusedIndexChange={(i) => setContentIndex(i)}
          onNavigateUp={() => { setZone('deputies'); setContentIndex(0); }}
          onNavigateDown={() => { setZone('content-1'); setContentIndex(0); }}
        />

        {/* Zone 4 — Em alta rail */}
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

      {/* Loading overlay */}
      {loadingDeputy && (
        <div style={loadingOverlayStyle}>
          <div style={{
            width: 48, height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #FFF',
            borderRadius: '50%',
            animation: 'camara-spin 0.8s linear infinite',
          }} />
        </div>
      )}

      <style>{`@keyframes camara-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
