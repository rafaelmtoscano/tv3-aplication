import React, { useState, useEffect, useMemo } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { ContentRail } from '../../components/ContentRail';
import type { ContentRailItem } from '../../components/ContentRail';
import type { MainZone } from '../../hooks/useFocusNavigation';
import { homeData } from '../../data/home';
import type { Rail } from '../../data/home';
import { colors } from '../../styles/colors';

const HERO_HEIGHT = 680;
const RAIL_HEIGHT = 320;

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

    switch (mainZone) {
      case 'hero':
        setMainScrollY(0);
        break;
      case 'rail-0':
        setMainScrollY(HERO_HEIGHT);
        break;
      case 'rail-1':
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT);
        break;
      case 'rail-2':
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * 2);
        break;
      case 'rail-3':
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * 3);
        break;
      case 'my-space':
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * 4);
        break;
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

        {/* Space for My Space */}
        <div style={{ height: RAIL_HEIGHT }} />
      </div>
    </main>
  );
}
