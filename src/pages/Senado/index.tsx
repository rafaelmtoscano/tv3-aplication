import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import { CircleButton } from '../../components/CircleButton/CircleButton';
import { GridIcon } from '../../icons';
import { channels } from '../../data/channels';
import type { Senator } from '../../data/senators';
import type { MainZone } from '../../hooks/useFocusNavigation';

const HERO_HEIGHT = 680;
const RAIL_HEIGHT = 408;
const SCROLL_OFFSET = 160;

const ZONE_INDEX: Record<string, number> = {
  hero: -1,
  'rail-0': 0,
  'rail-1': 1,
};

export interface SenadoProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  senators: Senator[];
  onOpenGrid: () => void;
  onSenatorSelect: (senator: Senator) => void;
}

export default function Senado({
  mainZone,
  mainItemIndex,
  isActive,
  senators,
  onOpenGrid,
  onSenatorSelect,
}: SenadoProps) {
  const [scrollY, setScrollY] = useState(0);
  const senatorItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const idx = mainZone === 'rail-0' ? mainItemIndex : -1;
    if (idx >= 0 && senatorItemRefs.current[idx]) {
      senatorItemRefs.current[idx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [mainZone, mainItemIndex]);

  const tvSenado = channels.find((ch) => ch.id === 'tv-senado')!;
  const programs = tvSenado.programs || [];

  const heroSlide: HeroBannerSlide = {
    id: 'senado-hero',
    mediaType: 'video',
    mediaSrc: tvSenado.streamUrl || tvSenado.logoFull,
    logo: tvSenado.logo,
    isLive: true,
    classification: 'L',
    signal: 'HD',
    title: 'Sessão Plenária',
    description: 'Acompanhe ao vivo as sessões do Plenário do Senado Federal.',
    buttonLabel: 'Assistir agora',
  };

  const videoItems: ContentRailItem[] = programs.map((prog) => ({
    id: prog.id,
    variant: 'image-text' as const,
    image: prog.thumbnail,
    title: prog.title,
    label: prog.category,
  }));

  useEffect(() => {
    if (!isActive) return;
    const zoneIdx = ZONE_INDEX[mainZone] ?? -1;
    const y = zoneIdx < 0 ? 0 : HERO_HEIGHT + RAIL_HEIGHT * zoneIdx - SCROLL_OFFSET;
    setScrollY(y);
  }, [mainZone, isActive]);

  const pageStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'clip',
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

  const isVerTodosFocused = mainZone === 'rail-0' && mainItemIndex === 0;

  return (
    <main style={pageStyle}>
      <div style={scrollTrackStyle}>
        <div style={{ height: HERO_HEIGHT }}>
          <HeroBanner slides={[heroSlide]} activeIndex={mainZone === 'hero' ? 0 : undefined} />
        </div>

        <div style={{ paddingTop: 48, overflow: 'visible' }}>
          <h2
            style={{
              ...typography.display.small,
              color: colors.text.primaryInverse,
              paddingLeft: 64,
              margin: '0 0 48px 0',
            }}
          >
            Senadores
          </h2>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: isVerTodosFocused || (mainZone === 'rail-0' && mainItemIndex > 0) ? '380px' : '310px',
              transition: 'height 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
              overflow: 'visible',
            }}
          >
            <div
              className="senator-rail"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'row',
                paddingLeft: 64,
                paddingRight: 64,
                gap: 32,
                overflowX: 'auto',
                overflowY: 'visible',
                alignItems: 'center',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
                boxSizing: 'border-box',
              }}
            >
              <div ref={(el) => { senatorItemRefs.current[0] = el; }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <CircleButton
                  icon={<GridIcon size={isVerTodosFocused ? 56 : 44} />}
                  label="Ver todos"
                  isFocused={isVerTodosFocused}
                  focusedBackgroundColor={colors.background.primary}
                  onClick={onOpenGrid}
                />
              </div>

              {senators.slice(0, 10).map((senator, i) => {
                const isFocused = mainZone === 'rail-0' && mainItemIndex === i + 1;
                return (
                  <div
                    key={senator.id}
                    ref={(el) => { senatorItemRefs.current[i + 1] = el; }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
                  >
                    <CircleButton
                      image={senator.photo}
                      label={senator.name}
                      isFocused={isFocused}
                      onClick={() => onSenatorSelect(senator)}
                    />
                    <span
                      style={{
                        ...typography.body.small,
                        color: colors.text.secondaryInverse,
                        marginTop: 4,
                        textAlign: 'center' as const,
                      }}
                    >
                      {senator.party} · {senator.state}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 64 }} />
        </div>

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

      <style>{`.senator-rail::-webkit-scrollbar { display: none; }`}</style>
    </main>
  );
}
