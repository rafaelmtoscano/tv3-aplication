import React, { useState, useEffect, useMemo } from 'react';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import type { MainZone } from '../../hooks/useFocusNavigation';
import { heroSlides } from '../../data/hero-slides';
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
      heroSlides.map((slide) => ({
        id: slide.id,
        mediaType: 'image' as const,
        mediaSrc: slide.backgroundImage,
        title: slide.title,
        description: slide.description,
        buttonLabel: slide.ctaLabel,
        isLive: slide.badge === 'AO VIVO',
      })),
    []
  );

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
      case 'my-space':
        setMainScrollY(HERO_HEIGHT + RAIL_HEIGHT * 2);
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

        {/* Just to enable scrolling visual test, we could add more height */}
        <div style={{ height: '200vh' }} />
      </div>
    </main>
  );
}
