import React, { useState, useMemo } from 'react';
import Home from './pages/Home/index';
import Live from './pages/Live/index';
import WatchPage from './pages/Watch/index';
import Search from './pages/Search/index';
import Schedule from './pages/Schedule/index';
import Apps from './pages/Apps/index';
import Settings from './pages/Settings/index';
import Help from './pages/Help/index';
import Camara from './pages/Camara/index';
import { Sidebar } from './components/Sidebar';
import type { SidebarItem, SidebarSign } from './components/Sidebar';
import { useFocusNavigation } from './hooks/useFocusNavigation';
import { homeData } from './data/home';
import { channels } from './data/channels';
import { colors } from './styles/colors';
import { SearchIcon, HomeIcon, LiveIcon, GridIcon, AppsIcon, SettingsIcon, HelpIcon, PersonIcon } from './icons';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [livePage, setLivePage] = useState<{ channelId: string; singleChannel?: boolean } | null>(null);
  const [watchPage, setWatchPage] = useState<{ videoUrl: string; title?: string; logo?: string; channelName?: string } | null>(null);
  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'search', icon: <SearchIcon />, label: 'Busca' },
    { id: 'home', icon: <HomeIcon />, label: 'Início' },
    { id: 'live', icon: <LiveIcon />, label: 'Ao vivo' },
    { id: 'schedule', icon: <GridIcon />, label: 'Programação' },
    { id: 'apps', icon: <AppsIcon />, label: 'Serviços' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Configurações' },
    { id: 'help', icon: <HelpIcon />, label: 'Ajuda' },
  ], []);

  const heroLength = currentPage === 'apps-camara' ? 1 : homeData.hero.length;
  const railLengths = currentPage === 'apps-camara'
    ? [7, 10]
    : homeData.rails.map((r) => r.cards.length);

  const {
    isSidebarExpanded,
    mainZone,
    mainItemIndex,
    sidebarIndex,
    resetToMain,
  } = useFocusNavigation({
    heroLength,
    railLengths,
    sidebarItemIds: sidebarItems.map((i) => i.id),
    sidebarLength: sidebarItems.length + 1,
    activeSidebarId: currentPage,
    onEnter: (state) => {
      if (currentPage === 'apps-camara') {
        if (state.mainZone === 'hero') {
          const tvCamara = channels.find(ch => ch.id === 'tv-camara');
          if (tvCamara?.streamUrl) setLivePage({ channelId: 'tv-camara', singleChannel: true });
        }
        const zoneMatch2 = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatch2 && parseInt(zoneMatch2[1]) === 1) {
          const tvCamara = channels.find(ch => ch.id === 'tv-camara');
          const prog = tvCamara?.programs?.[state.mainItemIndex];
          if (prog?.videoUrl) {
            setWatchPage({ videoUrl: prog.videoUrl, title: prog.title, logo: tvCamara?.logo, channelName: 'TV Câmara' });
          }
        }
      }
      if (currentPage === 'home') {
        if (state.mainZone === 'hero') {
          const slide = homeData.hero[state.mainItemIndex];
          if (slide?.isLive) {
            setLivePage({ channelId: slide.channelId, singleChannel: true });
          } else if (slide?.videoUrl) {
            setWatchPage({ videoUrl: slide.videoUrl, title: slide.title, logo: slide.logo, channelName: slide.channelId });
          }
        }
        if (state.mainZone === 'rail-0') {
          // rail-0 = TV ao vivo
          const card = homeData.rails[0].cards[state.mainItemIndex];
          if (card?.streamUrl) {
            setLivePage({ channelId: card.channelId });
          }
        }
        // Video rails (rail-1, rail-2, rail-3, etc.)
        const zoneMatch = state.mainZone.match(/^rail-(\d+)$/);
        if (zoneMatch) {
          const railIndex = parseInt(zoneMatch[1]);
          if (railIndex >= 1) {
            const card = homeData.rails[railIndex]?.cards[state.mainItemIndex];
            if (card?.videoUrl) {
              setWatchPage({ videoUrl: card.videoUrl, title: card.title, logo: card.logo, channelName: card.channelName });
            }
          }
        }
      }
    },
    onSidebarSelect: (id) => {
      if (id === 'avatar') return;
      if (id === 'live') {
        const firstLiveChannel = channels.find(ch => ch.streamUrl && ch.streamUrl.length > 0);
        if (firstLiveChannel) setLivePage({ channelId: firstLiveChannel.id });
        return;
      }
      setCurrentPage(id);
    },
  });

  const sidebarSign: SidebarSign = useMemo(() => ({
    variant: 'icon',
    icon: <PersonIcon size={28} />,
  }), []);

  if (watchPage) {
    return (
      <WatchPage
        {...watchPage}
        onExit={() => {
          setWatchPage(null);
          resetToMain();
        }}
      />
    );
  }

  if (livePage) {
    return (
      <Live
        initialChannelId={livePage.channelId}
        singleChannel={livePage.singleChannel}
        onExit={() => {
          setLivePage(null);
          resetToMain();
        }}
      />
    );
  }

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

  const mainWrapperStyle: React.CSSProperties = {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'home'}
          />
        );
      case 'search':
        return (
          <Search
            isActive={currentPage === 'search'}
            isSidebarExpanded={isSidebarExpanded}
            onLiveChannel={(channelId) => setLivePage({ channelId })}
            onWatchVideo={(videoUrl, title, logo, channelName) => setWatchPage({ videoUrl, title, logo, channelName })}
          />
        );
      case 'schedule':
        return (
          <Schedule
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'schedule'}
            isSidebarExpanded={isSidebarExpanded}
            onLiveChannel={(channelId) => setLivePage({ channelId })}
          />
        );
      case 'apps':
        return (
          <Apps
            isActive={currentPage === 'apps'}
            isSidebarExpanded={isSidebarExpanded}
            onServiceSelect={(serviceId) => {
              if (serviceId === 'camara-deputados') setCurrentPage('apps-camara');
            }}
          />
        );
      case 'apps-camara':
        return (
          <Camara
            mainZone={mainZone}
            mainItemIndex={mainItemIndex}
            isActive={currentPage === 'apps-camara'}
            onLiveChannel={(channelId) => setLivePage({ channelId, singleChannel: true })}
            onWatchVideo={(videoUrl, title, logo, channelName) => setWatchPage({ videoUrl, title, logo, channelName })}
          />
        );
      case 'settings':
        return <Settings isActive={currentPage === 'settings'} />;
      case 'help':
        return <Help isActive={currentPage === 'help'} />;
      default:
        return <Home mainZone={mainZone} mainItemIndex={mainItemIndex} isActive={currentPage === 'home'} />;
    }
  };

  return (
    <div style={rootStyle}>
      <Sidebar
        logoName="Plataforma"
        logoSubtitle="Comum"
        items={sidebarItems}
        sign={sidebarSign}
        expanded={isSidebarExpanded}
        activeItemId={currentPage}
        focusedItemId={isSidebarExpanded ? (sidebarIndex === 0 ? 'avatar' : sidebarItems[sidebarIndex - 1]?.id) : undefined}
        onItemClick={(id) => setCurrentPage(id)}
      />
      
      {/* Spacer to prevent content from going under the fixed sidebar collapsed strip */}
      <div style={sidebarSpacerStyle} />

      <div style={mainWrapperStyle}>
        {renderPage()}
      </div>

    </div>
  );
}
