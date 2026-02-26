import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from '../../components/Sidebar';
import type { SidebarItem, SidebarSign } from '../../components/Sidebar';
import { HeroBanner } from '../../components/HeroBanner';
import type { HeroBannerSlide } from '../../components/HeroBanner';
import { useFocusNavigation } from '../../hooks/useFocusNavigation';
import { heroSlides } from '../../data/hero-slides';
import { rails } from '../../data/rails';
import { colors } from '../../styles/colors';
import { HomeIcon, LiveIcon, GridIcon, AppsIcon, SettingsIcon, HelpIcon, PersonIcon } from '../../icons';

const HERO_HEIGHT = 680;
const RAIL_HEIGHT = 320;

export default function Home() {
  const { focusState, isSidebarExpanded, setFocusState } = useFocusNavigation({
    heroLength: heroSlides.length,
    railLengths: rails.map((r) => r.cards.length),
  });

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

  const handleSlideChange = useCallback(
    (index: number) => {
      setFocusState({ zone: 'hero', itemIndex: index });
    },
    [setFocusState]
  );

  useEffect(() => {
    switch (focusState.zone) {
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
      default:
        // Keep current scroll if in sidebar
        break;
    }
  }, [focusState.zone]);

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'home', icon: <HomeIcon />, label: 'Início' },
    { id: 'live', icon: <LiveIcon />, label: 'Ao vivo' },
    { id: 'my-channels', icon: <GridIcon />, label: 'Meus canais' },
    { id: 'apps', icon: <AppsIcon />, label: 'Aplicativos' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Configurações' },
    { id: 'help', icon: <HelpIcon />, label: 'Ajuda' },
  ], []);

  const sidebarSign: SidebarSign = useMemo(() => ({
    variant: 'icon',
    icon: <PersonIcon size={28} />,
  }), []);

  const rootStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'row',
    background: colors.background.baseInverse,
    overflow: 'hidden',
  };

  const sidebarSpacerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '88px',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const mainAreaStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
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
    <div style={rootStyle}>
      <Sidebar
        logoName="Plataforma"
        logoSubtitle="Comum"
        items={sidebarItems}
        sign={sidebarSign}
        expanded={isSidebarExpanded}
        activeItemId="home"
      />
      
      {/* Spacer to prevent content from going under the fixed sidebar collapsed strip */}
      <div style={sidebarSpacerStyle} />

      <main style={mainAreaStyle}>
        <div style={scrollTrackStyle}>
          {/* Hero Banner Section */}
          <div style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
            <HeroBanner
              slides={bannerSlides}
              onSlideChange={handleSlideChange}
            />
          </div>

          {/* Just to enable scrolling visual test, we could add more height */}
          <div style={{ height: '200vh' }} />
        </div>
      </main>
    </div>
  );
}
