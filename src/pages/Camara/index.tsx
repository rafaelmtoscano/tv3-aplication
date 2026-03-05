import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { GridIcon } from '../../icons';
import { useCamaraAPI } from '../../hooks/useCamaraAPI';
import { channels } from '../../data/channels';
import type { MainZone } from '../../hooks/useFocusNavigation';
import DeputiesGrid from './DeputiesGrid';

// ─── Layout constants — mesma fórmula da Home ─────────────────────────────────
const HERO_HEIGHT = 680;
const RAIL_HEIGHT = 408;
const SCROLL_OFFSET = 160;

// rail-0 = deputies, rail-1 = vídeos
const ZONE_INDEX: Record<string, number> = {
  'hero':   -1,
  'rail-0':  0,
  'rail-1':  1,
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

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CamaraProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  onLiveChannel: (channelId: string) => void;
  onWatchVideo: (videoUrl: string, title?: string, logo?: string, channelName?: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Camara({
  mainZone,
  mainItemIndex,
  isActive,
  onLiveChannel,
  onWatchVideo,
}: CamaraProps) {
  const { deputiesList: deputies } = useCamaraAPI();
  const [scrollY, setScrollY] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  const tvCamara = channels.find(ch => ch.id === 'tv-camara')!;
  const programs = tvCamara.programs || [];

  // ─── Hero slide ─────────────────────────────────────────────────────────
  const heroSlide: HeroBannerSlide = {
    id: 'camara-hero',
    mediaType: 'video',
    mediaSrc: tvCamara.streamUrl || tvCamara.logoFull,
    logo: tvCamara.logo,
    isLive: true,
    classification: 'L',
    signal: 'HD',
    title: 'Plenária',
    description: 'Acompanhe ao vivo as sessões do Plenário da Câmara dos Deputados.',
    buttonLabel: 'Assistir agora',
  };

  // ─── Deputies rail items (CircleButton via ContentRail não suporta — renderizado manualmente) ──
  const deputyRailLength = deputies.length + 1; // +1 "Ver todos"

  // ─── Vídeos rail ────────────────────────────────────────────────────────
  const videoItems: ContentRailItem[] = programs.map(prog => ({
    id: prog.id,
    variant: 'image-text' as const,
    image: prog.thumbnail,
    title: prog.title,
    label: prog.category,
  }));

  // ─── Scroll virtual — mesma fórmula da Home ─────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const zoneIdx = ZONE_INDEX[mainZone] ?? -1;
    const y = zoneIdx < 0 ? 0 : HERO_HEIGHT + RAIL_HEIGHT * zoneIdx - SCROLL_OFFSET;
    setScrollY(y);
  }, [mainZone, isActive]);

  // ─── Styles ──────────────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    height: '100vh',
    background: colors.background.baseInverse,
  };

  const scrollTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(-${scrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (showGrid) {
    return (
      <DeputiesGrid
        isActive={true}
        onBack={() => setShowGrid(false)}
        onDeputySelect={() => setShowGrid(false)}
      />
    );
  }

  const isVerTodosFocused = mainZone === 'rail-0' && mainItemIndex === 0;

  return (
    <main style={pageStyle}>
      <div style={scrollTrackStyle}>

        {/* Hero */}
        <div style={{ height: HERO_HEIGHT }}>
          <HeroBanner
            slides={[heroSlide]}
            activeIndex={mainZone === 'hero' ? 0 : undefined}
          />
        </div>

        {/* Rail 0 — Deputados (CircleButtons) */}
        <div style={{ paddingTop: 48, overflow: 'visible' }}>
          <h2 style={{
            ...typography.display.small,
            color: colors.text.primaryInverse,
            paddingLeft: 64,
            margin: '0 0 48px 0',
          }}>
            Deputados
          </h2>
          <div style={{ height: 366, overflow: 'visible' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              paddingLeft: 64,
              gap: 32,
              overflow: 'visible',
              alignItems: 'center',
              height: '100%',
            }}>
              {/* Ver todos */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <CircleButton
                  icon={<GridIcon size={isVerTodosFocused ? 56 : 44} />}
                  label="Ver todos"
                  isFocused={isVerTodosFocused}
                  onClick={() => setShowGrid(true)}
                />
              </div>
              {/* Deputies */}
              {deputies.map((dep, i) => {
                const isFocused = mainZone === 'rail-0' && mainItemIndex === i + 1;
                return (
                  <div
                    key={dep.id}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
                  >
                    <CircleButton
                      image={dep.photo}
                      label={dep.name}
                      isFocused={isFocused}
                    />
                    <span style={{
                      ...typography.body.small,
                      color: colors.text.secondaryInverse,
                      marginTop: 4,
                      textAlign: 'center' as const,
                    }}>
                      {dep.party} · {dep.state}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ height: 64 }} />
        </div>

        {/* Rail 1 — Vídeos */}
        <ContentRail
          title="Em alta"
          variant="image-text"
          items={videoItems}
          focusedIndex={mainZone === 'rail-1' ? mainItemIndex : -1}
          onFocusedIndexChange={() => {}}
          onNavigateUp={() => {}}
          onNavigateDown={() => {}}
        />

        <div style={{ height: RAIL_HEIGHT }} />
      </div>

      <style>{`@keyframes camara-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
