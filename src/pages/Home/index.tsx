import React, { useState, useEffect, useMemo } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import type { MainZone } from '../../hooks/useFocusNavigation';
import { homeData } from '../../data/home';
import type { Rail } from '../../data/home';
import { colors } from '../../styles/colors';
import { TileButton } from '../../components/TileButton';
import { services } from '../../data/services';

const HERO_HEIGHT = 680;
const RAIL_HEIGHT = 408;
const RAIL_SCROLL_OFFSET = 160;

// ─── ServicesSection ─────────────────────────────────────────────────────────

interface ServicesSectionProps {
  focusedIndex: number;
}

function ServicesSection({ focusedIndex }: ServicesSectionProps) {
  // Fixed height pattern: same as ContentRail (248px idle, 312px focused)
  const TILES_IDLE_HEIGHT = 248;
  const TILES_FOCUSED_HEIGHT = 312;
  const hasFocus = focusedIndex !== undefined && focusedIndex >= 0;

  const tilesOuterStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: hasFocus ? `${TILES_FOCUSED_HEIGHT}px` : `${TILES_IDLE_HEIGHT}px`,
    transition: 'height 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
    overflow: 'visible',
  };

  const tilesInnerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'center',
    overflowX: 'auto',
    overflowY: 'visible',
    paddingLeft: '64px',
    paddingRight: '64px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    scrollBehavior: 'smooth',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: colors.line.dark, paddingTop: '56px', paddingBottom: '56px' }}>
      <div style={{ padding: '0 64px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* Header gov.br */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F8f7c09382abf47279a18236cee0142fa"
              alt="gov.br"
              style={{ height: '48px', objectFit: 'contain' }}
            />
            <p style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 400,
              fontSize: '24px',
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
            }}>
              Serviços e informações públicas em um só lugar
            </p>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Label */}
        <p style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 500,
          fontSize: '28px',
          lineHeight: '120%',
          color: 'rgba(255,255,255,0.75)',
          margin: 0,
        }}>
          Serviços
        </p>

        {/* Rail of service tiles with fixed height */}
        <div style={tilesOuterStyle}>
          <div className="services-rail-hide-scrollbar" style={tilesInnerStyle}>
            {services.map((service, i) => (
              <div key={service.id} style={{ flexShrink: 0 }}>
                <TileButton
                  variant="image"
                  image={service.image}
                  alt={service.name}
                  isFocused={focusedIndex === i}
                  imageObjectFit="contain"
                  backgroundColor={service.backgroundColor}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Banner gov.br */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F3c51489c8feb4b94a9e29d040e13c91f"
          alt="Acesse seus serviços digitais - gov.br"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '24px',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        <style>{`
          .services-rail-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}

export interface HomeProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
}

export default function Home({ mainZone, mainItemIndex, isActive }: HomeProps) {
  const [mainScrollY, setMainScrollY] = useState(0);

  const bannerSlides: HeroBannerSlide[] = useMemo(
    () =>
      homeData.hero.map((slide) => ({
        id: slide.id,
        mediaType: slide.mediaType,
        mediaSrc: slide.mediaSrc,
        logo: slide.logo,
        isLive: slide.isLive,
        classification: slide.classification,
        signal: slide.signal,
        title: slide.title,
        description: slide.description,
        buttonLabel: slide.buttonLabel,
      })),
    []
  );

  const railItems = (cards: Rail['cards']): ContentRailItem[] =>
    cards.map(({ id, image, logo, title, label, isLive }) => ({
      id,
      image,
      logo,
      title,
      label,
      isLive,
    }));

  useEffect(() => {
    if (!isActive) return;

    if (mainZone === 'hero') {
      setMainScrollY(0);
    } else if (mainZone === 'my-space') {
      setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * homeData.rails.length - RAIL_SCROLL_OFFSET);
    } else {
      const railMatch = mainZone.match(/^rail-(\d+)$/);
      if (railMatch) {
        const railIdx = parseInt(railMatch[1]);
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * railIdx - RAIL_SCROLL_OFFSET);
      }
    }
  }, [mainZone, isActive]);

  const mainAreaStyle: React.CSSProperties = {
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
    transform: `translateY(-${mainScrollY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <main style={mainAreaStyle}>
      <div style={scrollTrackStyle}>
        {/* Hero Banner Section */}
        <div style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
          <HeroBanner
            slides={bannerSlides}
            activeIndex={mainZone === 'hero' ? mainItemIndex : undefined}
          />
        </div>

        {/* Content Rails */}
        {homeData.rails.map((rail, railIndex) => (
          <ContentRail
            key={rail.id}
            title={rail.title}
            variant={rail.variant}
            items={railItems(rail.cards)}
            focusedIndex={mainZone === `rail-${railIndex}` ? mainItemIndex : -1}
            onFocusedIndexChange={() => {}}
            onNavigateUp={() => {}}
            onNavigateDown={() => {}}
          />
        ))}

        {/* Seção Serviços + Banner gov.br */}
        <ServicesSection
          focusedIndex={mainZone === 'rail-4' ? mainItemIndex : -1}
        />

        {/* Espaço final para scroll */}
        <div style={{ height: RAIL_HEIGHT }} />
      </div>
    </main>
  );
}
