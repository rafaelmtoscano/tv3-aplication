import React, { useState, useEffect, useMemo } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import type { MainZone } from '../../hooks/useFocusNavigation';
import { homeData } from '../../data/home';
import type { Rail } from '../../data/home';
import { StoriesRail } from '../../components/StoriesRail';
import { nationalStories } from '../../data/stories';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TileButton } from '../../components/TileButton';
import { services } from '../../data/services';

const visibleServices = services.filter((s) => !s.hidden);

// ─── Login Card styles (gov.br section) ──────────────────────────────────────
const loginCardStyles = `
  .govbr-login-section {
    padding: 80px 80px 160px 80px;
    border-radius: 48px;
    background: linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08)), #12182A;
  }
  .govbr-login-card {
    padding: 48px;
    border-radius: 24px;
    background: rgba(217, 217, 217, 0.08);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .govbr-login-title {
    font-family: Roboto, sans-serif;
    font-size: 36px;
    line-height: 44px;
    color: #FFFFFF;
    margin: 0;
  }
  .govbr-login-subtitle {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 32px;
    color: #FFFFFF;
    opacity: 0.7;
    margin: 0;
  }
  .govbr-login-button {
    align-self: flex-start;
    background: #2864AE;
    border-radius: 100px;
    padding: 24px 48px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 28px;
    color: #FFFFFF;
    border: 4px solid transparent;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }
  .govbr-login-button.is-focused {
    border-color: #FFFFFF;
    box-shadow: 0 0 0 6px rgba(255,255,255,0.25), 0 12px 32px rgba(40,100,174,0.55);
    transform: scale(1.02);
  }
  .govbr-login-button-bold {
    font-weight: 700;
  }
`;

const HERO_HEIGHT = 680;
const STORIES_HEIGHT = 554; // altura máxima (focused)
const RAIL_HEIGHT = 408;
const RAIL_SCROLL_OFFSET = 160;

// ─── ServicesSection ─────────────────────────────────────────────────────────

interface ServicesSectionProps {
  focusedIndex: number;
  isGovBrConnected: boolean;
}

function ServicesSection({ focusedIndex, isGovBrConnected }: ServicesSectionProps) {
  if (isGovBrConnected) return null;

  const isLoginButtonFocused = focusedIndex === 0;

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

        {/* Login Card gov.br */}
        <div className="govbr-login-section">
          <div className="govbr-login-card">
            <p className="govbr-login-title">
              Faça login para acessar serviços para seu perfil
            </p>
            <p className="govbr-login-subtitle">
              Participe de enquetes, acesse serviços gov.br e personalize sua experiência
            </p>
            <div className={`govbr-login-button${isLoginButtonFocused ? ' is-focused' : ''}`}>
              Entrar com <span className="govbr-login-button-bold">gov.br</span>
            </div>
          </div>
        </div>

        <style>{loginCardStyles}</style>
      </div>
    </div>
  );
}

export interface HomeProps {
  mainZone: MainZone;
  mainItemIndex: number;
  isActive: boolean;
  isGovBrConnected?: boolean;
}

export default function Home({ mainZone, mainItemIndex, isActive, isGovBrConnected = false }: HomeProps) {
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

    // Visual order: hero → rail-0 → rail-1 (TV ao vivo) → [stories] → rail-2 → ...
    const storiesOffset = isGovBrConnected ? STORIES_HEIGHT : 0;

    if (mainZone === 'hero') {
      setMainScrollY(0);
    } else if (mainZone === 'stories') {
      // stories comes after hero + rail-0 + rail-1 (only when connected)
      setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * 2 - RAIL_SCROLL_OFFSET);
    } else if (mainZone === 'my-space') {
      setMainScrollY(HERO_HEIGHT + storiesOffset + RAIL_HEIGHT * homeData.rails.length - RAIL_SCROLL_OFFSET);
    } else {
      const railMatch = mainZone.match(/^rail-(\d+)$/);
      if (railMatch) {
        const railIdx = parseInt(railMatch[1]);
        if (railIdx === 0) {
          setMainScrollY(HERO_HEIGHT - RAIL_SCROLL_OFFSET);
        } else if (railIdx === 1) {
          // rail-1 (TV ao vivo) comes right after rail-0, before stories
          setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT - RAIL_SCROLL_OFFSET);
        } else {
          // rail-2 and beyond come after stories (when present)
          setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * railIdx + storiesOffset - RAIL_SCROLL_OFFSET);
        }
      }
    }
  }, [mainZone, isActive, isGovBrConnected]);

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

        {/* Services Rail (rail-0) */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          marginBottom: '64px',
          overflowX: 'visible',
          overflowY: 'visible',
        }}>
          <h2 style={{
            ...typography.display.small,
            color: colors.text.primaryInverse,
            paddingLeft: '64px',
            margin: 0,
          }}>
            {isGovBrConnected ? 'Meus serviços' : 'Serviços'}
          </h2>
          <div style={{
            position: 'relative',
            width: '100%',
            height: mainZone === 'rail-0' ? '312px' : '248px',
            transition: 'height 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)',
            overflow: 'visible',
          }}>
            <div className="services-rail-hide-scrollbar" style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              gap: '48px',
              alignItems: 'center',
              overflowX: 'auto',
              overflowY: 'visible',
              padding: '0 64px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth',
              boxSizing: 'border-box',
            }}>
              {visibleServices.map((service, i) => (
                <div key={service.id} style={{ flexShrink: 0 }}>
                  <TileButton
                    variant="image"
                    image={service.image}
                    alt={service.name}
                    isFocused={mainZone === 'rail-0' && mainItemIndex === i}
                    imageObjectFit="contain"
                    backgroundColor={service.backgroundColor}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TV ao Vivo Rail (rail-1) */}
        {homeData.rails[0] && (
          <ContentRail
            key={homeData.rails[0].id}
            title={homeData.rails[0].title}
            variant={homeData.rails[0].variant}
            items={railItems(homeData.rails[0].cards)}
            focusedIndex={mainZone === 'rail-1' ? mainItemIndex : -1}
            onFocusedIndexChange={() => {}}
            onNavigateUp={() => {}}
            onNavigateDown={() => {}}
          />
        )}

        {/* Stories Rail (below TV ao vivo) — apenas quando conectado ao gov.br */}
        {isGovBrConnected && (
          <div style={{ marginTop: '48px', marginBottom: '48px' }}>
            <StoriesRail
              title="Em destaque agora"
              items={nationalStories}
              focusedIndex={mainZone === 'stories' ? mainItemIndex : -1}
              onFocusedIndexChange={() => {}}
              onNavigateUp={() => {}}
              onNavigateDown={() => {}}
            />
          </div>
        )}

        {/* Content Rails (rail-2 through rail-N) */}
        {homeData.rails.slice(1).map((rail, railIndex) => (
          <ContentRail
            key={rail.id}
            title={rail.title}
            variant={rail.variant}
            items={railItems(rail.cards)}
            focusedIndex={mainZone === `rail-${railIndex + 2}` ? mainItemIndex : -1}
            onFocusedIndexChange={() => {}}
            onNavigateUp={() => {}}
            onNavigateDown={() => {}}
          />
        ))}

        {/* Seção gov.br: Login Card (deslogado) ou oculta (conectado) */}
        <ServicesSection
          focusedIndex={mainZone === `rail-${homeData.rails.length + 1}` ? mainItemIndex : -1}
          isGovBrConnected={isGovBrConnected}
        />

        {/* Spacing after services section */}
        <div style={{ height: '80px' }} />

        {/* Espaço final para scroll */}
        <div style={{ height: RAIL_HEIGHT }} />
      </div>
    </main>
  );
}
