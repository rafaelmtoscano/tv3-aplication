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
  return (
    <div style={{ background: colors.line.dark, paddingTop: '56px', paddingBottom: '56px' }}>
      <div style={{ padding: '0 64px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* Label + rail of service tiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start' }}>
            {services.map((service, i) => (
              <TileButton
                key={service.id}
                variant="image"
                image={service.image}
                alt={service.name}
                isFocused={focusedIndex === i}
                imageObjectFit="contain"
                backgroundColor={service.backgroundColor}
              />
            ))}
          </div>
        </div>

        {/* Banner gov.br */}
        <div style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1a3a1a 0%, #1e5c1e 50%, #2d7a2d 100%)',
          padding: '48px 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '48px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: '36px',
              lineHeight: '120%',
              color: '#FFFFFF',
              margin: 0,
            }}>
              Acesse seus serviços digitais
            </p>
            <p style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
            }}>
              Faça login com sua conta gov.br
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
            {/* gov.br logo */}
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '20px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido.png"
                alt="gov.br"
                style={{ width: '72px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            {/* QR Code + caption */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '12px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src="https://chart.googleapis.com/chart?chs=80x80&cht=qr&chl=https://acesso.gov.br&choe=UTF-8"
                  alt="QR Code gov.br"
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
              <p style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                textAlign: 'center' as const,
                maxWidth: '200px',
                lineHeight: '1.5',
                margin: 0,
              }}>
                Aponte a câmera do seu celular para o QR Code e siga as instruções para um login na <strong>sua conta gov.br</strong>.
              </p>
            </div>
          </div>
        </div>

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
